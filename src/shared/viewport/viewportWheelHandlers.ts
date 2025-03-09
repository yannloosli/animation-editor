import { dispatchToAreaState } from "~/area/state/areaSlice";
import { getAreaViewport } from "~/area/util/getAreaViewport";
import { AreaType, TRACKPAD_ZOOM_DELTA_FAC } from "~/constants";
import { isKeyDown } from "~/listener/keyboard";
import { requestAction } from "~/listener/requestAction";
import { getAreaActionState } from "~/state/stateUtils";
import { Action } from "~/types";
import { capToRange, interpolate } from "~/util/math";
import { SerializableVec2 } from "~/util/math/types";
import { Vec2 } from "~/util/math/vec2";
import { parseWheelEvent } from "~/util/wheelEvent";
import { WorkspaceAreaState } from "~/workspace/workspaceAreaReducer";

type PossibleAreaTypes = AreaType.FlowEditor | AreaType.Workspace;

interface Actions {
	setPan: (pan: Vec2) => Action;
	setScale: (scale: number) => Action;
}

// Fonction utilitaire pour convertir SerializableVec2 en Vec2
export const toVec2 = (v: SerializableVec2): Vec2 => Vec2.new(v.x, v.y);

export const createViewportWheelHandlers = <T extends PossibleAreaTypes>(
	areaType: T,
	actions: Actions,
) => {
	const handlers = {
		onPanStart: (areaId: string, e: React.MouseEvent) => {
			e.stopPropagation();

			const initialPos = Vec2.fromEvent(e.nativeEvent);

			requestAction({ history: true }, (params) => {
				const handleMouseMove = (e: MouseEvent | KeyboardEvent) => {
					if (e instanceof MouseEvent) {
						const areaState = getAreaActionState<T>(areaId);
						if (!areaState || !areaState.pan) return;

						const pos = Vec2.fromEvent(e);
						const diff = pos.sub(initialPos);
						const action = actions.setPan(toVec2(areaState.pan).add(diff));
						if ((<WorkspaceAreaState>areaState).compositionId) {
							const { compositionId, scale } = areaState as WorkspaceAreaState;
							params.performDiff((diff) => diff.compositionView(compositionId, scale));
						}
						params.dispatchToAreaState(areaId, action);
					}
				};

				const handleMouseUp = () => {
					const areaState = getAreaActionState<T>(areaId);
					if (!areaState) return;

					if ((<WorkspaceAreaState>areaState).compositionId) {
						const { compositionId, scale } = areaState as WorkspaceAreaState;
						params.addDiff((diff) => diff.compositionView(compositionId, scale));
					}
					params.submitAction("Pan");
				};

				params.addListener.repeated("mousemove", handleMouseMove);
				params.addListener.once("mouseup", handleMouseUp);
			});
		},

		onZoomClick: (e: React.MouseEvent, areaId: string) => {
			e.stopPropagation();

			const mousePos = Vec2.fromEvent(e.nativeEvent);
			const areaState = getAreaActionState<T>(areaId);
			
			if (!areaState || !areaState.pan || !areaState.scale) return;

			if (
				(areaState.scale < 0.0625 && isKeyDown("Alt")) ||
				(areaState.scale > 256 && !isKeyDown("Alt"))
			) {
				return;
			}

			requestAction({ history: true }, (params) => {
				const viewport = getAreaViewport(areaId, areaType);
				if (!viewport) return;

				const fac = isKeyDown("Alt") ? 0.5 : 2;

				const pos = mousePos
					.sub(Vec2.new(areaState.pan))
					.sub(Vec2.new(viewport.width / 2, viewport.height / 2))
					.sub(Vec2.new(viewport));

				const xt = pos.x / viewport.width;
				const yt = pos.y / viewport.height;

				const diff = Vec2.new(
					viewport.width * (xt * fac) * (isKeyDown("Alt") ? -1 : 0.5),
					viewport.height * (yt * fac) * (isKeyDown("Alt") ? -1 : 0.5),
				);

				const nextScale = areaState.scale * fac;
				const panAction = actions.setPan(toVec2(areaState.pan).sub(diff));
				const scaleAction = actions.setScale(areaState.scale * fac);

				params.dispatch(
					dispatchToAreaState({ areaId, action: panAction }),
					dispatchToAreaState({ areaId, action: scaleAction }),
				);
				if ((<WorkspaceAreaState>areaState).compositionId) {
					const { compositionId } = areaState as WorkspaceAreaState;
					params.addDiff((diff) => diff.compositionView(compositionId, nextScale));
				}
				params.submitAction("Zoom");
			});
		},

		onWheelScale: (e: WheelEvent, areaId: string, impact = 1) => {
			const { deltaY } = e;

			const mousePos = Vec2.fromEvent(e);
			const areaState = getAreaActionState<T>(areaId);
			const viewport = getAreaViewport(areaId, areaType);

			if (!areaState || !areaState.pan || !areaState.scale || !viewport) return;

			const fac = interpolate(1, -deltaY < 0 ? 0.85 : 1.15, capToRange(0, 2, impact));

			requestAction({ history: false }, (params) => {
				const pos = mousePos
					.sub(Vec2.new(areaState.pan))
					.sub(Vec2.new(viewport.width / 2, viewport.height / 2))
					.sub(Vec2.new(viewport));

				const xt = pos.x / viewport.width;
				const yt = pos.y / viewport.height;

				const xDiff = viewport.width * xt * ((1 - fac) / 1) * -1;
				const yDiff = viewport.height * yt * ((1 - fac) / 1) * -1;

				const diff = Vec2.new(xDiff, yDiff);

				const panAction = actions.setPan(toVec2(areaState.pan).sub(diff));
				const scaleAction = actions.setScale(areaState.scale * fac);

				params.dispatch(
					dispatchToAreaState({ areaId, action: panAction }),
					dispatchToAreaState({ areaId, action: scaleAction }),
				);
				if ((<WorkspaceAreaState>areaState).compositionId) {
					const { compositionId, scale } = areaState as WorkspaceAreaState;
					params.addDiff((diff) => diff.compositionView(compositionId, scale));
				}
				params.submitAction("Zoom");
			});
		},

		onWheelPan: (deltaX: number, deltaY: number, areaId: string) => {
			const areaState = getAreaActionState<T>(areaId);
			
			if (!areaState || !areaState.pan) return;

			requestAction({ history: false }, (params) => {
				const pan = toVec2(areaState.pan).add(Vec2.new(-deltaX, -deltaY));
				const panAction = actions.setPan(pan);

				params.dispatch(dispatchToAreaState({ areaId, action: panAction }));
				if ((<WorkspaceAreaState>areaState).compositionId) {
					const { compositionId, scale } = areaState as WorkspaceAreaState;
					params.addDiff((diff) => diff.compositionView(compositionId, scale));
				}
				params.submitAction("Pan");
			});
		},

		onWheel: (e: WheelEvent, areaId: string) => {
			e.preventDefault();

			const normalized = parseWheelEvent(e);

			switch (normalized.type) {
				case "mouse_wheel": {
					handlers.onWheelScale(e, areaId);
					break;
				}
				case "pinch_zoom": {
					handlers.onWheelScale(e, areaId, Math.abs(e.deltaY) * TRACKPAD_ZOOM_DELTA_FAC);
					break;
				}
				case "pan": {
					handlers.onWheelPan(normalized.deltaX, normalized.deltaY, areaId);
					break;
				}
			}
		},
	};
	return handlers;
};
