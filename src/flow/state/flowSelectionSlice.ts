import { PayloadAction } from "@reduxjs/toolkit";
import { createUndoableSlice } from "~/state/undoConfig";
import { KeySelectionMap } from "~/types";
import { removeKeysFromMap } from "~/util/mapUtils";

export interface FlowGraphSelection {
    nodes: KeySelectionMap;
}

export interface FlowSelectionState {
    [graphId: string]: FlowGraphSelection;
}

const _emptySelection: FlowGraphSelection = { nodes: {} };

export const initialState: FlowSelectionState = {};

export { initialState as initialFlowSelectionState };

const reducers = {
    addNode: (
        state: FlowSelectionState,
        action: PayloadAction<{ graphId: string; nodeId: string }>,
    ) => {
        const { graphId, nodeId } = action.payload;
        const selection = state[graphId] || _emptySelection;
        state[graphId] = {
            ...selection,
            nodes: {
                ...selection.nodes,
                [nodeId]: true,
            },
        };
    },

    removeNode: (
        state: FlowSelectionState,
        action: PayloadAction<{ graphId: string; nodeId: string }>,
    ) => {
        const { graphId, nodeId } = action.payload;
        const selection = state[graphId] || _emptySelection;
        state[graphId] = {
            ...selection,
            nodes: removeKeysFromMap(selection.nodes, [nodeId]),
        };
    },

    toggleNode: (
        state: FlowSelectionState,
        action: PayloadAction<{ graphId: string; nodeId: string }>,
    ) => {
        const { graphId, nodeId } = action.payload;
        const selection = state[graphId] || _emptySelection;
        state[graphId] = {
            ...selection,
            nodes: selection.nodes[nodeId]
                ? removeKeysFromMap(selection.nodes, [nodeId])
                : {
                    ...selection.nodes,
                    [nodeId]: true,
                },
        };
    },

    setSelectedNodesInGraph: (
        state: FlowSelectionState,
        action: PayloadAction<{ graphId: string; nodeIds: string[] }>,
    ) => {
        const { graphId, nodeIds } = action.payload;
        const selection = state[graphId] || _emptySelection;
        const nodes: KeySelectionMap = {};

        for (const nodeId of nodeIds) {
            nodes[nodeId] = true;
        }

        state[graphId] = { ...selection, nodes };
    },

    removeGraph: (
        state: FlowSelectionState,
        action: PayloadAction<{ graphId: string }>,
    ) => {
        const { graphId } = action.payload;
        state[graphId] = _emptySelection;
    },
};

export const flowSelectionSlice = createUndoableSlice(
    'flowSelection',
    initialState,
    reducers
);

export const {
    addNode,
    removeNode,
    toggleNode,
    setSelectedNodesInGraph,
    removeGraph,
} = flowSelectionSlice.actions;

export const flowSelectionReducer = flowSelectionSlice.reducer;

// Pour la compatibilité avec redux-undo
export const createInitialUndoableState = () => ({
    past: [],
    present: initialState,
    future: [],
    _latestUnfiltered: initialState,
    group: null,
    index: 0,
    limit: 50,
}); 
