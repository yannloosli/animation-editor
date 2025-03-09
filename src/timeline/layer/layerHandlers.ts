import { getAreaViewport } from "~/area/util/getAreaViewport";
import { getPickWhipLayerTarget } from "~/composition/layer/layerUtils";
import { AreaType } from "~/constants";
import { layerOperations } from "~/layer/layerOperations";
import { createOperation } from "~/state/operation";
import { getActionState, getAreaActionState } from "~/state/stateUtils";
import { setFields } from "~/timeline/timelineAreaSlice";
import { mouseDownMoveAction } from "~/util/action/mouseDownMoveAction";
import { Vec2 } from "~/util/math/vec2";

export const layerHandlers = {
	onLayerParentWhipMouseDown: (e: React.MouseEvent, areaId: string, layerId: string) => {
		const { compositionState } = getActionState();

		const layer = compositionState.layers[layerId];
		const viewport = getAreaViewport(areaId, AreaType.Timeline);

		mouseDownMoveAction(e, {
			keys: [],
			beforeMove: () => {},
			mouseMove: (params, { mousePosition }) => {
				params.dispatchToAreaState(
					areaId,
					setFields({
						pickWhipLayerParent: {
							fromId: layerId,
							to: Vec2.new(mousePosition.global.x - 1, mousePosition.global.y - 3),
						},
					}),
				);
			},
			mouseUp: (params) => {
				const { pickWhipLayerParent, panY } = getAreaActionState<AreaType.Timeline>(areaId);

				if (!pickWhipLayerParent) {
					// Mouse did not move
					params.cancelAction();
					return;
				}

				const target = getPickWhipLayerTarget(
					pickWhipLayerParent.to,
					pickWhipLayerParent.fromId,
					layer.compositionId,
					compositionState,
					panY,
					viewport,
				);

				if (!target) {
					params.cancelAction();
					return;
				}

				const op = createOperation(params);
				layerOperations.setLayerParentLayer(op, getActionState(), layerId, target.layerId);

				op.submit();
				params.dispatchToAreaState(
					areaId,
					setFields({
						pickWhipLayerParent: null,
					}),
				);
				params.submitAction("Set layer's parent layer");
			},
		});
	},
};
