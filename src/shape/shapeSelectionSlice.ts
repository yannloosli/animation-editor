import { PayloadAction } from "@reduxjs/toolkit";
import { ShapeSelection } from "~/shape/shapeTypes";
import { createUndoableSlice } from "~/state/undoConfig";

export interface ShapeSelectionState {
    selections: { [shapeId: string]: ShapeSelection };
    selectedShapeIds: string[];
}

export const initialState: ShapeSelectionState = {
    selections: {},
    selectedShapeIds: [],
};

export { initialState as initialShapeSelectionState };

const createNewShapeSelection = (): ShapeSelection => ({
    nodes: {},
    edges: {},
    controlPoints: {},
});

const reducers = {
    addNodeToSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string; nodeId: string }>) => {
        const { shapeId, nodeId } = action.payload;
        if (!state.selections[shapeId]) {
            state.selections[shapeId] = createNewShapeSelection();
        }
        state.selections[shapeId].nodes[nodeId] = true;
    },

    toggleNodeSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string; nodeId: string }>) => {
        const { shapeId, nodeId } = action.payload;
        if (!state.selections[shapeId]) {
            state.selections[shapeId] = createNewShapeSelection();
        }
        if (state.selections[shapeId].nodes[nodeId]) {
            delete state.selections[shapeId].nodes[nodeId];
        } else {
            state.selections[shapeId].nodes[nodeId] = true;
        }
    },

    removeNodeFromSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string; nodeId: string }>) => {
        const { shapeId, nodeId } = action.payload;
        if (state.selections[shapeId]) {
            delete state.selections[shapeId].nodes[nodeId];
        }
    },

    addEdgeToSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string; edgeId: string }>) => {
        const { shapeId, edgeId } = action.payload;
        if (!state.selections[shapeId]) {
            state.selections[shapeId] = createNewShapeSelection();
        }
        state.selections[shapeId].edges[edgeId] = true;
    },

    toggleEdgeSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string; edgeId: string }>) => {
        const { shapeId, edgeId } = action.payload;
        if (!state.selections[shapeId]) {
            state.selections[shapeId] = createNewShapeSelection();
        }
        if (state.selections[shapeId].edges[edgeId]) {
            delete state.selections[shapeId].edges[edgeId];
        } else {
            state.selections[shapeId].edges[edgeId] = true;
        }
    },

    addControlPointToSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string; cpId: string }>) => {
        const { shapeId, cpId } = action.payload;
        if (!state.selections[shapeId]) {
            state.selections[shapeId] = createNewShapeSelection();
        }
        state.selections[shapeId].controlPoints[cpId] = true;
    },

    toggleControlPointSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string; cpId: string }>) => {
        const { shapeId, cpId } = action.payload;
        if (!state.selections[shapeId]) {
            state.selections[shapeId] = createNewShapeSelection();
        }
        if (state.selections[shapeId].controlPoints[cpId]) {
            delete state.selections[shapeId].controlPoints[cpId];
        } else {
            state.selections[shapeId].controlPoints[cpId] = true;
        }
    },

    removeControlPointFromSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string; cpId: string }>) => {
        const { shapeId, cpId } = action.payload;
        if (state.selections[shapeId]) {
            delete state.selections[shapeId].controlPoints[cpId];
        }
    },

    clearShapeSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string }>) => {
        const { shapeId } = action.payload;
        state.selectedShapeIds = state.selectedShapeIds.filter(id => id !== shapeId);
        delete state.selections[shapeId];
    },

    setShapeSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeIds: string[] }>) => {
        const { shapeIds } = action.payload;
        state.selectedShapeIds = shapeIds;
        // Clear previous selections
        Object.keys(state.selections).forEach(key => {
            if (!shapeIds.includes(key)) {
                delete state.selections[key];
            }
        });
    },

    addShapeToSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string }>) => {
        const { shapeId } = action.payload;
        if (!state.selectedShapeIds.includes(shapeId)) {
            state.selectedShapeIds.push(shapeId);
        }
        if (!state.selections[shapeId]) {
            state.selections[shapeId] = createNewShapeSelection();
        }
    },

    removeShapeFromSelection: (state: ShapeSelectionState, action: PayloadAction<{ shapeId: string }>) => {
        const { shapeId } = action.payload;
        state.selectedShapeIds = state.selectedShapeIds.filter(id => id !== shapeId);
        delete state.selections[shapeId];
    },
};

export const shapeSelectionSlice = createUndoableSlice(
    'shapeSelection',
    initialState,
    reducers
);

export const {
    addNodeToSelection,
    toggleNodeSelection,
    removeNodeFromSelection,
    addEdgeToSelection,
    toggleEdgeSelection,
    addControlPointToSelection,
    toggleControlPointSelection,
    removeControlPointFromSelection,
    clearShapeSelection,
    setShapeSelection,
    addShapeToSelection,
    removeShapeFromSelection,
} = shapeSelectionSlice.actions;

export const shapeSelectionReducer = shapeSelectionSlice.reducer; 
