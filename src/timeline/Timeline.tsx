import React, { useEffect, useRef, useState } from "react";
import { dispatchToAreaState } from "~/area/state/areaSlice";
import { useCompositionPlayback } from "~/composition/compositionPlayback";
import { TIMELINE_SEPARATOR_WIDTH, TRACKPAD_ZOOM_DELTA_FAC } from "~/constants";
import { GraphEditor } from "~/graphEditor/GraphEditor";
import { useKeyDownEffect } from "~/hook/useKeyDown";
import { requestAction, RequestActionCallback } from "~/listener/requestAction";
import { connectActionState } from "~/state/stateUtils";
import { TimelineLayerParentPickWhipPreview } from "~/timeline/layer/TimelineLayerParentPickWhipPreview";
import { TimelineScrubber } from "~/timeline/scrubber/TimelineScrubber";
import styles from "~/timeline/Timeline.styles";
import { setViewBounds, TimelineAreaState } from "~/timeline/timelineAreaSlice";
import { timelineHandlers } from "~/timeline/timelineHandlers";
import { TimelineHeader } from "~/timeline/TimelineHeader";
import { TimelineLayerList } from "~/timeline/TimelineLayerList";
import { TimelineViewBounds } from "~/timeline/TimelineViewBounds";
import { TrackEditor } from "~/trackEditor/TrackEditor";
import { AreaComponentProps } from "~/types/areaTypes";
import { capToRange, isVecInRect, splitRect } from "~/util/math";
import { Vec2 } from "~/util/math/vec2";
import { separateLeftRightMouse } from "~/util/mouse";
import { convertExtendedRectToRect, createExtendedRectFromXY, ExtendedRect } from "~/util/rectUtils";
import { compileStylesheetLabelled } from "~/util/stylesheets";
import { parseWheelEvent } from "~/util/wheelEvent";
import {
    GraphEditorProps,
    TimelineLayerListProps,
    TimelineLayerParentPickWhipPreviewProps,
    TimelineScrubberProps,
    TrackEditorProps
} from './timelineComponentTypes';
import {
    handleControlPointMouseDown,
    handleKeyframeMouseDown,
    handleTimelineBackgroundMouseDown
} from './timelineEventHandlers';

const s = compileStylesheetLabelled(styles);

type OwnProps = AreaComponentProps<TimelineAreaState>;
interface StateProps {
	compositionLength: number;
}
type Props = OwnProps & StateProps;

const TimelineComponent: React.FC<Props> = (props) => {
	const [t, setT] = useState(0.3);
	const [isZooming, setIsZooming] = useState(false);
	const [isPanning, setIsPanning] = useState(false);

	const viewportRect: ExtendedRect = createExtendedRectFromXY({
		x: props.x,
		y: props.y,
		width: props.width,
		height: props.height
	});

	let [viewportLeft, viewportRight] = splitRect(
		"horizontal",
		createExtendedRectFromXY({
			x: props.x,
			y: props.y,
			width: props.width,
			height: props.height
		}),
		t,
		TIMELINE_SEPARATOR_WIDTH,
	);

	const zoomTarget = useRef<HTMLDivElement>(null);
	const panTarget = useRef<HTMLDivElement>(null);

	useKeyDownEffect("Z", (down) => {
		setIsZooming(down);
		if (zoomTarget.current) {
			zoomTarget.current.style.display = down ? "block" : "";
		}
	});
	useKeyDownEffect("Space", (down) => {
		setIsPanning(down);
		if (panTarget.current) {
			panTarget.current.style.display = down ? "block" : "";
		}
	});

	const onMouseDown: RequestActionCallback = (params) => {
		const { addListener, submitAction } = params;

		addListener.repeated("mousemove", (e) => {
			if (e instanceof MouseEvent) {
				const pos = Vec2.fromEvent(e).subX(props.x);
				setT(capToRange(0.1, 0.8, pos.x / props.width));
			}
		});

		addListener.once("mouseup", () => {
			submitAction();
		});
	};

	const outRef = useRef<HTMLDivElement>(null);

	const wrapperRef = useRef<HTMLDivElement>(null);

	const propsRef = useRef<Props>(props);
	propsRef.current = props;

	useCompositionPlayback(props.areaState.compositionId, propsRef);

	useEffect(() => {
		if (!wrapperRef.current) {
			return;
		}

		const listener = (e: WheelEvent) => {
			e.preventDefault();

			const props = propsRef.current;

			const parsed = parseWheelEvent(e);
			const { compositionLength } = props;
			const { panY, viewBounds } = props.areaState;
			let [viewportLeft, viewportRight] = splitRect(
				"horizontal",
				createExtendedRectFromXY({
					x: props.x,
					y: props.y,
					width: props.width,
					height: props.height
				}),
				t,
				TIMELINE_SEPARATOR_WIDTH,
			);

			const onPan = () => {
				const lockY = props.areaState.graphEditorOpen
					? !isVecInRect(Vec2.fromEvent(e), viewportLeft)
					: false;

				timelineHandlers.onWheelPan({
					nativeEvent: e,
					preventDefault: () => {}
				} as React.WheelEvent, props.areaId, {
					compositionId: props.areaState.compositionId,
					viewport: viewportRight,
					compositionLength,
					viewBounds,
					lockY,
					panY,
				});
			};

			switch (parsed.type) {
				case "pinch_zoom": {
					timelineHandlers.onWheelZoom(
						{
							nativeEvent: e,
							preventDefault: () => {},
							clientX: e.clientX,
							clientY: e.clientY,
							deltaY: e.deltaY
						} as unknown as React.WheelEvent,
						props.areaId,
						Math.abs(e.deltaY) * TRACKPAD_ZOOM_DELTA_FAC,
						{
							viewBounds,
							width: viewportRight.width,
							left: viewportRight.left,
						},
					);
					break;
				}

				case "pan": {
					onPan();
					break;
				}

				case "mouse_wheel": {
					onPan();
					break;
				}
			}
		};

		const el = wrapperRef.current;
		el.addEventListener("wheel", listener, { passive: false });

		return () => {
			el.removeEventListener("wheel", listener);
		};
	}, [wrapperRef.current, t]);

	const { compositionId, viewBounds, panY } = props.areaState;
	const { compositionLength } = props;

	const onKeyframeMouseDown = (keyframeId: string, e: React.MouseEvent) => {
		handleKeyframeMouseDown(
			props.areaState.compositionId,
			keyframeId,
			e.nativeEvent,
			e.shiftKey
		);
	};

	const onControlPointMouseDown = (keyframeIndex: number, direction: 'left' | 'right', e: React.MouseEvent) => {
		handleControlPointMouseDown(
			props.areaState.compositionId,
			keyframeIndex,
			direction,
			e.nativeEvent
		);
	};

	const onBackgroundMouseDown = (e: React.MouseEvent) => {
		if (e.button === 0 && !isZooming && !isPanning) {
			handleTimelineBackgroundMouseDown(
				props.areaState.compositionId,
				e.nativeEvent,
				{
					viewBounds: props.areaState.viewBounds,
					viewport: convertExtendedRectToRect(viewportRight)
				}
			);
		}
	};

	// Préparer les props pour les composants enfants
	const timelineLayerListProps: TimelineLayerListProps = {
		compositionId,
		moveLayers: props.areaState.moveLayers,
		panY: props.areaState.panY
	};

	const timelineLayerParentPickWhipPreviewProps: TimelineLayerParentPickWhipPreviewProps = {
		pickWhipLayerParent: props.areaState.pickWhipLayerParent ? {
			fromId: props.areaState.pickWhipLayerParent.fromId,
			to: Vec2.new(
				props.areaState.pickWhipLayerParent.to.x,
				props.areaState.pickWhipLayerParent.to.y
			)
		} : null,
		viewport: viewportLeft,
		compositionId,
		panY: props.areaState.panY
	};

	const timelineScrubberProps: TimelineScrubberProps = {
		compositionId,
		viewportRight,
		viewBounds
	};

	const trackEditorProps: TrackEditorProps = {
		panY: props.areaState.panY,
		viewBounds,
		compositionId,
		viewport: {
			width: viewportRight.width,
			height: viewportRight.height - 32,
			x: viewportRight.left,
			y: viewportRight.top + 32,
		},
		timelineAreaId: props.areaId,
		trackDragSelectRect: props.areaState.trackDragSelectRect
	};

	const graphEditorProps: GraphEditorProps = {
		areaId: props.areaId,
		compositionId,
		viewport: {
			width: viewportRight.width,
			height: viewportRight.height - 32,
			x: viewportRight.left,
			y: viewportRight.top + 32,
		}
	};

	return (
		<div className={s("wrapper")} ref={wrapperRef}>
			<div
				className={s("panTarget")}
				ref={panTarget}
				onMouseDown={separateLeftRightMouse({
					left: (e) => {
						const lockY = props.areaState.graphEditorOpen
							? !isVecInRect(Vec2.fromEvent(e.nativeEvent), viewportLeft)
							: false;
						timelineHandlers.onPan(e, props.areaId, {
							compositionId,
							viewport: viewportRight,
							compositionLength,
							viewBounds,
							lockY,
							panY,
						});
					},
				})}
			/>
			<div
				className={s("left")}
				style={viewportLeft}
				ref={outRef}
				onMouseDown={separateLeftRightMouse({
					left: () => timelineHandlers.onMouseDownOut(compositionId),
					right: (e) => timelineHandlers.onRightClickOut(e, compositionId),
				})}
			>
				<TimelineHeader areaId={props.areaId} />
				<TimelineLayerList {...timelineLayerListProps} />
				<TimelineLayerParentPickWhipPreview {...timelineLayerParentPickWhipPreviewProps} />
			</div>
			<div
				className={s("separator")}
				style={{ left: viewportLeft.width }}
				onMouseDown={separateLeftRightMouse({
					left: () => requestAction({ history: false }, onMouseDown),
				})}
			/>
			<div className={s("right")} style={viewportRight}>
				<TimelineViewBounds
					x={viewportRight.left}
					width={viewportRight.width}
					compositionLength={compositionLength}
					requestUpdate={(cb) => {
						requestAction({ history: false }, (params) => {
							cb({
								addListener: params.addListener as any,
								update: (viewBounds) => {
									params.dispatch(
										dispatchToAreaState({
											areaId: props.areaId,
											action: setViewBounds(viewBounds),
										}),
									);
								},
								submit: () => params.submitAction(),
							});
						});
					}}
					viewBounds={viewBounds}
				/>
				<TimelineScrubber {...timelineScrubberProps} />
				<div style={{ position: "relative" }}>
					<div
						className={s("zoomTarget")}
						ref={zoomTarget}
						onMouseDown={separateLeftRightMouse({
							left: (e) =>
								timelineHandlers.onZoomClick(e, props.areaId, {
									viewBounds,
									width: viewportRight.width,
									left: viewportRight.left,
								}),
						})}
					/>
					{!props.areaState.graphEditorOpen && (
						<TrackEditor {...trackEditorProps} />
					)}
					{props.areaState.graphEditorOpen && (
						<GraphEditor {...graphEditorProps} />
					)}
				</div>
			</div>
		</div>
	);
};

const mapStateToProps: MapActionState<StateProps, OwnProps> = ({ compositionState }, ownProps) => {
	const composition = compositionState.compositions[ownProps.areaState.compositionId];

	return {
		compositionLength: composition.length,
	};
};

export const Timeline = connectActionState(mapStateToProps)(TimelineComponent);
