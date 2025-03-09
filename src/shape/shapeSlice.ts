import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    ShapeControlPoint,
    ShapeEdge,
    ShapeGraph,
    ShapeNode,
    ShapePath,
    ShapePathItem,
} from "~/shape/shapeTypes";
import { removeKeysFromMap } from "~/util/mapUtils";

export interface ShapeState {
    shapes: {
        [shapeId: string]: ShapeGraph;
    };
    nodes: {
        [nodeId: string]: ShapeNode;
    };
    edges: {
        [edgeId: string]: ShapeEdge;
    };
    controlPoints: Partial<{
        [controlPointId: string]: ShapeControlPoint;
    }>;
    paths: {
        [pathId: string]: ShapePath;
    };
}

const initialState: ShapeState = {
    shapes: {},
    nodes: {},
    edges: {},
    controlPoints: {},
    paths: {},
};

export const shapeSlice = createSlice({
    name: "shape",
    initialState,
    reducers: {
        setState: (state, action: PayloadAction<{ state: ShapeState }>) => {
            return action.payload.state;
        },
        
        setShape: (state, action: PayloadAction<{ shape: ShapeGraph }>) => {
            const { shape } = action.payload;
            state.shapes[shape.id] = shape;
        },

        removeShape: (state, action: PayloadAction<{ shapeId: string }>) => {
            const { shapeId } = action.payload;
            const shape = state.shapes[shapeId];
            
            if (!shape) return;

            const controlPointIds: string[] = [];
            for (const edgeId of shape.edges) {
                const edge = state.edges[edgeId];
                controlPointIds.push(edge.cp0, edge.cp1);
            }

            state.controlPoints = removeKeysFromMap(state.controlPoints, controlPointIds);
            state.edges = removeKeysFromMap(state.edges, shape.edges);
            state.nodes = removeKeysFromMap(state.nodes, shape.nodes);
            delete state.shapes[shapeId];
        },

        setPath: (state, action: PayloadAction<{ path: ShapePath }>) => {
            const { path } = action.payload;
            state.paths[path.id] = path;
        },

        setPathItem: (state, action: PayloadAction<{ 
            pathId: string;
            itemIndex: number;
            item: ShapePathItem;
        }>) => {
            const { pathId, item: newItem, itemIndex } = action.payload;
            const path = state.paths[pathId];
            if (!path) return;
            
            path.items = path.items.map((item, i) => 
                i === itemIndex ? newItem : item
            );
        },

        insertPathItem: (state, action: PayloadAction<{
            pathId: string;
            insertIndex: number;
            item: ShapePathItem;
        }>) => {
            const { pathId, item, insertIndex } = action.payload;
            const path = state.paths[pathId];
            if (!path) return;

            path.items.splice(insertIndex, 0, item);
        },

        setPathItemPart: (state, action: PayloadAction<{
            pathId: string;
            itemIndex: number;
            which: "left" | "right";
            part: ShapePathItem["right"];
        }>) => {
            const { pathId, itemIndex, which, part } = action.payload;
            const path = state.paths[pathId];
            if (!path) return;

            const item = path.items[itemIndex];
            if (!item) return;

            item[which] = part;
        },

        removePath: (state, action: PayloadAction<{ pathId: string }>) => {
            const { pathId } = action.payload;
            delete state.paths[pathId];
        },

        removePathItem: (state, action: PayloadAction<{
            pathId: string;
            itemIndex: number;
        }>) => {
            const { pathId, itemIndex } = action.payload;
            const path = state.paths[pathId];
            if (!path) return;

            path.items.splice(itemIndex, 1);
        },

        setPathItemControlPointId: (state, action: PayloadAction<{
            pathId: string;
            which: "left" | "right";
            itemIndex: number;
            controlPointId: string;
        }>) => {
            const { pathId, which, itemIndex, controlPointId } = action.payload;
            const path = state.paths[pathId];
            if (!path) return;

            const item = path.items[itemIndex];
            if (!item) return;

            if (item[which]) {
                item[which]!.controlPointId = controlPointId;
            }
        },

        appendPathItem: (state, action: PayloadAction<{
            pathId: string;
            item: ShapePathItem;
            direction: "left" | "right";
        }>) => {
            const { pathId, item, direction } = action.payload;
            const path = state.paths[pathId];
            if (!path) return;

            if (direction === "right") {
                path.items.push(item);
            } else {
                path.items.unshift(item);
            }
        },
    },
});

export const shapeActions = shapeSlice.actions;
export const shapeReducer = shapeSlice.reducer; 
