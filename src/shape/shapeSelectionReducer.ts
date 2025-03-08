import { ActionType, createAction, getType } from "typesafe-actions";
import { ShapeSelection } from "~/shape/shapeTypes";
import { removeKeysFromMap } from "~/util/mapUtils";

export const shapeSelectionActions = {
	addNodeToSelection: createAction("sh_sel/ADD_NODE_TO_SELECTION", (action) => {
		return (shapeId: string, nodeId: string) => action({ shapeId, nodeId });
	}),

	toggleNodeSelection: createAction("sh_sel/TOGGLE_NODE_SELECTED", (action) => {
		return (shapeId: string, nodeId: string) => action({ shapeId, nodeId });
	}),

	removeNodeFromSelection: createAction("sh_sel/REMOVE_NODE_FROM_SELECTION", (action) => {
		return (shapeId: string, nodeId: string) => action({ shapeId, nodeId });
	}),

	addEdgeToSelection: createAction("sh_sel/ADD_EDGE_TO_SELECTION", (action) => {
		return (shapeId: string, edgeId: string) => action({ shapeId, edgeId });
	}),

	toggleEdgeSelection: createAction("sh_sel/TOGGLE_EDGE_SELECTED", (action) => {
		return (shapeId: string, edgeId: string) => action({ shapeId, edgeId });
	}),

	addControlPointToSelection: createAction("sh_sel/ADD_CP_TO_SELECTION", (action) => {
		return (shapeId: string, cpId: string) => action({ shapeId, cpId });
	}),

	toggleControlPointSelection: createAction("sh_sel/TOGGLE_CP_SELECTED", (action) => {
		return (shapeId: string, cpId: string) => action({ shapeId, cpId });
	}),

	removeControlPointFromSelection: createAction("sh_sel/REMOVE_CP_FROM_SELECTION", (action) => {
		return (shapeId: string, cpId: string) => action({ shapeId, cpId });
	}),

	clearShapeSelection: createAction("sh_sel/CLEAR_SELECTION", (action) => {
		return (shapeId: string) => action({ shapeId });
	}),

	setShapeSelection: createAction("sh_sel/SET_SHAPE_SELECTION", (action) => {
		return (shapeIds: string[]) => action({ shapeIds });
	}),

	addShapeToSelection: createAction("sh_sel/ADD_SHAPE_TO_SELECTION", (action) => {
		return (shapeId: string) => action({ shapeId });
	}),

	removeShapeFromSelection: createAction("sh_sel/REMOVE_SHAPE_FROM_SELECTION", (action) => {
		return (shapeId: string) => action({ shapeId });
	}),
};

export interface ShapeSelectionState {
	[shapeId: string]: ShapeSelection;
	selectedShapeIds: string[];
}

export const initialShapeSelectionState: ShapeSelectionState = {
	selectedShapeIds: [],
};

const createNewShapeSelection = (): ShapeSelection => ({
	nodes: {},
	edges: {},
	controlPoints: {},
});

type Action = ActionType<typeof shapeSelectionActions>;

const singleShapeSelectionReducer = (state: ShapeSelection, action: Action): ShapeSelection => {
	switch (action.type) {
		case getType(shapeSelectionActions.addNodeToSelection): {
			const { nodeId } = action.payload;
			return { ...state, nodes: { ...state.nodes, [nodeId]: true } };
		}

		case getType(shapeSelectionActions.toggleNodeSelection): {
			const { nodeId } = action.payload;

			return {
				...state,
				nodes: state.nodes[nodeId]
					? removeKeysFromMap(state.nodes, [nodeId])
					: { ...state.nodes, [nodeId]: true },
			};
		}

		case getType(shapeSelectionActions.removeNodeFromSelection): {
			const { nodeId } = action.payload;
			return { ...state, nodes: removeKeysFromMap(state.nodes, [nodeId]) };
		}

		case getType(shapeSelectionActions.addEdgeToSelection): {
			const { edgeId } = action.payload;

			return {
				...state,
				edges: { ...state.edges, [edgeId]: true },
			};
		}

		case getType(shapeSelectionActions.toggleEdgeSelection): {
			const { edgeId } = action.payload;

			return {
				...state,
				edges: state.edges[edgeId]
					? removeKeysFromMap(state.edges, [edgeId])
					: { ...state.edges, [edgeId]: true },
			};
		}

		case getType(shapeSelectionActions.addControlPointToSelection): {
			const { cpId } = action.payload;

			return {
				...state,
				controlPoints: { ...state.controlPoints, [cpId]: true },
			};
		}

		case getType(shapeSelectionActions.toggleControlPointSelection): {
			const { cpId } = action.payload;

			return {
				...state,
				controlPoints: state.controlPoints[cpId]
					? removeKeysFromMap(state.controlPoints, [cpId])
					: { ...state.controlPoints, [cpId]: true },
			};
		}

		case getType(shapeSelectionActions.removeControlPointFromSelection): {
			const { cpId } = action.payload;

			return {
				...state,
				controlPoints: removeKeysFromMap(state.controlPoints, [cpId]),
			};
		}

		default:
			return state;
	}
};

export const shapeSelectionReducer = (
	state = initialShapeSelectionState,
	action: Action | { type: string },
): ShapeSelectionState => {
	// Gérer les actions redux-undo et autres actions sans payload
	if (!('payload' in action)) {
		return state;
	}

	switch (action.type) {
		case getType(shapeSelectionActions.setShapeSelection): {
			const { shapeIds } = action.payload;
			return {
				selectedShapeIds: shapeIds,
			};
		}

		case getType(shapeSelectionActions.clearShapeSelection): {
			return {
				selectedShapeIds: [],
			};
		}

		case getType(shapeSelectionActions.addShapeToSelection): {
			const { shapeId } = action.payload;
			return {
				selectedShapeIds: [...state.selectedShapeIds, shapeId],
			};
		}

		case getType(shapeSelectionActions.removeShapeFromSelection): {
			const { shapeId } = action.payload;
			return {
				selectedShapeIds: state.selectedShapeIds.filter(id => id !== shapeId),
			};
		}

		default:
			return state;
	}
};
