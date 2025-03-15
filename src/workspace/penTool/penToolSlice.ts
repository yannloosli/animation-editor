import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShapeControlPoint, ShapeEdge, ShapeNode, ShapePath } from "~/shape/shapeTypes";
import type { RootState } from "~/state/store-init";
import { Vec2 } from "~/util/math/vec2";

// Types pour les opérations du pen tool
export type PenToolOperationType =
    | "create_path"
    | "edit_path"
    | "move_node"
    | "move_control_point"
    | "split_edge"
    | "remove_node"
    | null;

export interface PenToolOperation {
    type: PenToolOperationType;
    pathId?: string;
    nodeId?: string;
    controlPointId?: string;
    edgeId?: string;
    position?: Vec2;
    initialPosition?: Vec2;
}

// État du pen tool
export interface PenToolState {
    activeOperation: PenToolOperation;
    lastMousePosition: Vec2 | null;
    temporaryObjects: {
        nodes: Record<string, ShapeNode>;
        edges: Record<string, ShapeEdge>;
        controlPoints: Record<string, ShapeControlPoint>;
        paths: Record<string, ShapePath>;
    };
}

// État initial
const initialState: PenToolState = {
    activeOperation: {
        type: null
    },
    lastMousePosition: null,
    temporaryObjects: {
        nodes: {},
        edges: {},
        controlPoints: {},
        paths: {}
    }
};

// Création du slice
export const penToolSlice = createSlice({
    name: "penTool",
    initialState,
    reducers: {
        startOperation: (state, action: PayloadAction<PenToolOperation>) => {
            state.activeOperation = action.payload;
            if (action.payload.position) {
                state.lastMousePosition = action.payload.position;
            }
        },

        updateMousePosition: (state, action: PayloadAction<Vec2>) => {
            state.lastMousePosition = action.payload;
        },

        endOperation: (state) => {
            state.activeOperation = { type: null };
            state.lastMousePosition = null;
            state.temporaryObjects = {
                nodes: {},
                edges: {},
                controlPoints: {},
                paths: {}
            };
        },

        addTemporaryNode: (state, action: PayloadAction<{ id: string; node: ShapeNode }>) => {
            state.temporaryObjects.nodes[action.payload.id] = action.payload.node;
        },

        addTemporaryEdge: (state, action: PayloadAction<{ id: string; edge: ShapeEdge }>) => {
            state.temporaryObjects.edges[action.payload.id] = action.payload.edge;
        },

        addTemporaryControlPoint: (state, action: PayloadAction<{ id: string; controlPoint: ShapeControlPoint }>) => {
            state.temporaryObjects.controlPoints[action.payload.id] = action.payload.controlPoint;
        },

        addTemporaryPath: (state, action: PayloadAction<{ id: string; path: ShapePath }>) => {
            state.temporaryObjects.paths[action.payload.id] = action.payload.path;
        },

        updateTemporaryNode: (state, action: PayloadAction<{ id: string; updates: Partial<ShapeNode> }>) => {
            if (state.temporaryObjects.nodes[action.payload.id]) {
                state.temporaryObjects.nodes[action.payload.id] = {
                    ...state.temporaryObjects.nodes[action.payload.id],
                    ...action.payload.updates
                };
            }
        },

        updateTemporaryControlPoint: (state, action: PayloadAction<{ id: string; updates: Partial<ShapeControlPoint> }>) => {
            if (state.temporaryObjects.controlPoints[action.payload.id]) {
                state.temporaryObjects.controlPoints[action.payload.id] = {
                    ...state.temporaryObjects.controlPoints[action.payload.id],
                    ...action.payload.updates
                };
            }
        },

        clearTemporaryObjects: (state) => {
            state.temporaryObjects = {
                nodes: {},
                edges: {},
                controlPoints: {},
                paths: {}
            };
        }
    }
});

// Export des actions
export const {
    startOperation,
    updateMousePosition,
    endOperation,
    addTemporaryNode,
    addTemporaryEdge,
    addTemporaryControlPoint,
    addTemporaryPath,
    updateTemporaryNode,
    updateTemporaryControlPoint,
    clearTemporaryObjects
} = penToolSlice.actions;

// Sélecteurs
export const selectPenToolState = (state: RootState) => state.penTool;
export const selectActiveOperation = (state: RootState) => state.penTool.activeOperation;
export const selectLastMousePosition = (state: RootState) => state.penTool.lastMousePosition;
export const selectTemporaryObjects = (state: RootState) => state.penTool.temporaryObjects;

// Export du reducer
export default penToolSlice.reducer; 
