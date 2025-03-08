import React, { useMemo } from "react";
import { Dispatch } from "redux";
import { areaComponentRegistry } from "~/area/areaRegistry";
import { AreaComponent } from "~/area/components/Area";
import AreaRootStyles from "~/area/components/AreaRoot.styles";
import { AREA_PLACEMENT_TRESHOLD } from "~/area/state/areaConstants";
import { AreaReducerState } from "~/area/state/areaSlice";
import {
    getAreaToOpenPlacementInViewport,
    PlaceArea
} from "~/area/util/areaUtils";
import { AREA_BORDER_WIDTH } from "~/constants";
import { connectActionState, MapActionState } from "~/state/stateUtils";
import { AreaToOpen } from "~/types/areaTypes";
import { contractRect } from "~/util/math";
import { Vec2 } from "~/util/math/vec2";
import { compileStylesheetLabelled } from "~/util/stylesheets";

interface RenderAreaToOpenProps {
	viewport: Rect;
	areaToOpen: AreaToOpen;
	dimensions: Vec2;
	dispatch: Dispatch;
}

const RenderAreaToOpen: React.FC<RenderAreaToOpenProps> = (props) => {
	const { areaToOpen, viewport, dimensions, dispatch } = props;

	const placement = useMemo(() => {
		return getAreaToOpenPlacementInViewport(viewport, areaToOpen.position);
	}, [viewport, areaToOpen]);

	const treshold = Math.min(viewport.width, viewport.height) * AREA_PLACEMENT_TRESHOLD;
	const O = Vec2.new(treshold, treshold);

	const w = viewport.width;
	const h = viewport.height;

	const nw_0 = Vec2.new(0, 0);
	const nw_1 = nw_0.add(O);
	const ne_0 = Vec2.new(w, 0);
	const ne_1 = ne_0.add(O.scaleX(-1));
	const sw_0 = Vec2.new(0, h);
	const sw_1 = sw_0.add(O.scaleY(-1));
	const se_0 = Vec2.new(w, h);
	const se_1 = se_0.add(O.scale(-1));

	const lines = [
		[nw_0, nw_1],
		[ne_0, ne_1],
		[sw_0, sw_1],
		[se_0, se_1],
		[nw_1, ne_1],
		[ne_1, se_1],
		[se_1, sw_1],
		[sw_1, nw_1],
	];

	const placementLines: Record<PlaceArea, Vec2[]> = {
		left: [nw_0, nw_1, sw_1, sw_0],
		top: [nw_0, ne_0, ne_1, nw_1],
		right: [ne_1, ne_0, se_0, se_1],
		bottom: [sw_0, sw_1, se_1, se_0],
		replace: [nw_1, ne_1, se_1, sw_1],
	};

	const hlines = placementLines[placement];
	const hd =
		hlines
			.map((p) => [p.x, p.y].join(","))
			.map((str, i) => [i === 0 ? "M" : "L", str].join(" "))
			.join(" ") + " Z";

	return (
		<>
			<div
				className={s("areaToOpenContainer")}
				style={{
					left: areaToOpen.position.x,
					top: areaToOpen.position.y,
				}}
			>
				<AreaComponent
					id="-1"
					Component={areaComponentRegistry[areaToOpen.area.type]}
					raised
					state={areaToOpen.area.state}
					type={areaToOpen.area.type}
					viewport={{
						left: -(dimensions.x / 2),
						top: -(dimensions.y / 2),
						height: dimensions.y,
						width: dimensions.x,
					}}
					dispatch={dispatch}
				/>
			</div>
			<div
				className={s("areaToOpenTargetOverlay")}
				style={contractRect(viewport, AREA_BORDER_WIDTH)}
			>
				<svg width={w} height={h} className={s("placement")}>
					{lines.map(([p0, p1], i) => (
						<line key={i} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} />
					))}
					<path d={hd} />
				</svg>
			</div>
		</>
	) as React.ReactElement;
};

const s = compileStylesheetLabelled(AreaRootStyles);

interface StateProps {
	areaState: AreaReducerState;
}

interface DispatchProps {
	dispatch: Dispatch;
}

interface Props extends StateProps, DispatchProps {
	areaToViewport: { [areaId: string]: Rect };
}

const AreaToOpenPreviewComponent: React.FC<Props> = ({ areaState, areaToViewport, dispatch }) => {
	if (!areaState) {
		console.error('AreaToOpenPreview received undefined areaState');
		return <></>;
	}

	const { areaToOpen } = areaState;

	if (!areaToOpen) {
		return <></>;
	}

	const { area, position } = areaToOpen;

	return (
		<div
			style={{
				position: "absolute",
				left: position.x,
				top: position.y,
				width: 200,
				height: 200,
				backgroundColor: "rgba(0, 0, 0, 0.1)",
				border: "1px solid rgba(0, 0, 0, 0.2)",
				pointerEvents: "none",
			}}
		/>
	) as React.ReactElement;
};

const mapStateToProps: MapActionState<StateProps & DispatchProps> = ({ area }, dispatch) => ({
	areaState: area,
	dispatch: dispatch as Dispatch,
});

export const AreaToOpenPreview = connectActionState(mapStateToProps)(AreaToOpenPreviewComponent);
