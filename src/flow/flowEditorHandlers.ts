import { getAreaViewport } from "~/area/util/getAreaViewport";
import { AreaType } from "~/constants";
import { contextMenuActions } from "~/contextMenu/contextMenuActions";
import {
    didFlowSelectionChange,
    flowEditorGlobalToNormal,
    flowSelectionFromState,
} from "~/flow/flowUtils";
import { setPan, setScale } from "~/flow/state/flowAreaSlice";
import { removeGraph, setSelectedNodesInGraph } from "~/flow/state/flowSelectionSlice";
import { setDragSelectRect } from "~/flow/state/flowSlice";
import { getFlowGraphContextMenuOptions } from "~/flow/util/flowGraphContextMenu";
import { calculateNodeHeight } from "~/flow/util/flowNodeHeight";
import { isKeyDown } from "~/listener/keyboard";
import { requestAction } from "~/listener/requestAction";
import { createViewportWheelHandlers } from "~/shared/viewport/viewportWheelHandlers";
import { getActionState } from "~/state/stateUtils";
import { mouseDownMoveAction } from "~/util/action/mouseDownMoveAction";
import { clearElementFocus } from "~/util/focus";
import { rectOfTwoVecs, rectsIntersect } from "~/util/math";
import { Vec2 } from "~/util/math/vec2";

export const flowEditorHandlers = {
	onLeftClickOutside: (
		e: React.MouseEvent,
		graphId: string,
		areaId: string,
		scale: number,
		pan: Vec2,
	) => {
		const isAdditiveSelection = isKeyDown("Shift");
		const viewport = getAreaViewport(areaId, AreaType.FlowEditor);

		mouseDownMoveAction(e, {
			shouldAddToStack: didFlowSelectionChange(graphId),
			translate: (vec) => flowEditorGlobalToNormal(vec, viewport, scale, pan),
			keys: [],
			beforeMove: () => {},
			mouseMove: (params, { initialMousePosition, mousePosition }) => {
				const rect = rectOfTwoVecs(initialMousePosition.normal, mousePosition.normal);
				params.dispatch(setDragSelectRect({ graphId, rect }));
			},
			mouseUp: (params, hasMoved) => {
				if (!hasMoved) {
					params.dispatch(removeGraph(graphId));
					params.submitAction("Modify selection");
					return;
				}

				const { flowState, flowSelectionState } = getActionState();
				const selection = flowSelectionFromState(graphId, flowSelectionState);
				const graph = flowState.graphs[graphId];

				const nodeIds = graph.nodes.reduce<string[]>((arr, nodeId) => {
					const node = flowState.nodes[nodeId];

					const shouldBeSelected =
						(isAdditiveSelection && selection.nodes[nodeId]) ||
						rectsIntersect(graph._dragSelectRect!, {
							left: node.position.x,
							top: node.position.y,
							height: calculateNodeHeight(node),
							width: node.width,
						});

					if (shouldBeSelected) {
						arr.push(nodeId);
					}

					return arr;
				}, []);

				params.dispatch(setDragSelectRect({ graphId, rect: null }));
				params.dispatch(setSelectedNodesInGraph(graphId, nodeIds));
				params.submitAction("Modify selection");
			},
		});
	},

	onRightClickOutside: (
		e: React.MouseEvent,
		graphId: string,
		areaId: string,
		setClickCapture: (fn: { fn: ((e: React.MouseEvent) => void) | null }) => void,
	) => {
		const pos = Vec2.fromEvent(e);
		clearElementFocus();

		requestAction({ history: true }, (params) => {
			const { cancelAction, dispatch, execOnComplete } = params;

			// Cleanup click capture on completion
			execOnComplete(() => setClickCapture({ fn: null }));

			const viewport = getAreaViewport(areaId, AreaType.FlowEditor);
			dispatch(
				contextMenuActions.openContextMenu(
					"Node Editor",
					getFlowGraphContextMenuOptions({
						params,
						graphId,
						areaId,
						viewport,
						setClickCapture,
					}),
					pos,
					cancelAction,
				),
			);
		});
	},

	...createViewportWheelHandlers(AreaType.FlowEditor, {
		setPan,
		setScale,
	}),
};
