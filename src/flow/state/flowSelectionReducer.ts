import { ActionType, createAction, getType } from "typesafe-actions";
import { KeySelectionMap } from "~/types";
import { removeKeysFromMap } from "~/util/mapUtils";

export const flowSelectionActions = {
	addNode: createAction("flowSelection/ADD_NODE_TO_SELECTION", (action) => {
		return (graphId: string, nodeId: string) => action({ graphId, nodeId });
	}),

	removeNode: createAction("flowSelection/REMOVE_NODE_FROM_SELECTION", (action) => {
		return (graphId: string, nodeId: string) => action({ graphId, nodeId });
	}),

	toggleNode: createAction("flowSelection/TOGGLE_NODE_SELECTION", (action) => {
		return (graphId: string, nodeId: string) => action({ graphId, nodeId });
	}),

	setSelectedNodesInGraph: createAction("flowSelection/SET_SELECTED_NODES_IN_GRAPH", (action) => {
		return (graphId: string, nodeIds: string[]) => action({ graphId, nodeIds });
	}),

	removeGraph: createAction("flowSelection/CLEAR_SELECTION", (action) => {
		return (graphId: string) => action({ graphId });
	}),
};

type Action = ActionType<typeof flowSelectionActions>;

export interface FlowGraphSelection {
	nodes: KeySelectionMap;
}

export interface FlowSelectionState {
	[graphId: string]: FlowGraphSelection;
}

const _emptySelection: FlowGraphSelection = { nodes: {} };

export const initialFlowSelectionState: FlowSelectionState = {};

// Créer un état initial compatible avec redux-undo
export const createInitialUndoableState = () => ({
	past: [],
	present: initialFlowSelectionState,
	future: [],
	_latestUnfiltered: initialFlowSelectionState,
	group: null,
	index: 0,
	limit: 50
});

function singleFlowGraphSelectionReducer(
	state: FlowGraphSelection,
	action: Action,
): FlowGraphSelection {
	switch (action.type) {
		case getType(flowSelectionActions.addNode): {
			const { nodeId } = action.payload;
			return {
				...state,
				nodes: {
					...state.nodes,
					[nodeId]: true,
				},
			};
		}

		case getType(flowSelectionActions.removeNode): {
			const { nodeId } = action.payload;
			return {
				...state,
				nodes: removeKeysFromMap(state.nodes, [nodeId]),
			};
		}

		case getType(flowSelectionActions.toggleNode): {
			const { nodeId } = action.payload;
			return {
				...state,
				nodes: state.nodes[nodeId]
					? removeKeysFromMap(state.nodes, [nodeId])
					: {
							...state.nodes,
							[nodeId]: true,
					  },
			};
		}

		case getType(flowSelectionActions.setSelectedNodesInGraph): {
			const { nodeIds } = action.payload;

			const nodes: KeySelectionMap = {};

			for (const nodeId of nodeIds) {
				nodes[nodeId] = true;
			}

			return { ...state, nodes };
		}

		case getType(flowSelectionActions.removeGraph): {
			return _emptySelection;
		}

		default:
			return state;
	}
}

export const flowSelectionReducer = (
	state = initialFlowSelectionState,
	action: Action | { type: string },
): FlowSelectionState => {
	// Gérer les actions sans payload
	if (!('payload' in action) || !action.payload) {
		return state;
	}

	// Vérifier que graphId existe dans le payload
	if (!('graphId' in action.payload)) {
		return state;
	}

	const { graphId } = action.payload;
	if (!graphId) {
		return state;
	}

	const selection = state[graphId] || _emptySelection;

	return {
		...state,
		[graphId]: singleFlowGraphSelectionReducer(selection, action as Action),
	};
};
