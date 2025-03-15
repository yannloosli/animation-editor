import { PayloadAction } from "@reduxjs/toolkit";
import {
    ShapeControlPoint,
    ShapeEdge,
    ShapeGraph,
    ShapeNode,
    ShapePath,
    ShapePathItem,
} from "~/shape/shapeTypes";
import { createUndoableSlice } from "~/state/undoConfig";
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

export const initialState: ShapeState = {
    shapes: {},
    nodes: {},
    edges: {},
    controlPoints: {},
    paths: {},
};

const reducers = {
    setState: (state: ShapeState, action: PayloadAction<{ state: ShapeState }>) => {
        return action.payload.state;
    },

    setShape: (state: ShapeState, action: PayloadAction<{ shape: ShapeGraph }>) => {
        const { shape } = action.payload;
        state.shapes[shape.id] = shape;
    },

    removeShape: (state: ShapeState, action: PayloadAction<{ shapeId: string }>) => {
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

    setPath: (state: ShapeState, action: PayloadAction<{ path: ShapePath }>) => {
        const { path } = action.payload;
        state.paths[path.id] = path;
    },

    setPathItem: (state: ShapeState, action: PayloadAction<{
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

    insertPathItem: (state: ShapeState, action: PayloadAction<{
        pathId: string;
        insertIndex: number;
        item: ShapePathItem;
    }>) => {
        const { pathId, item, insertIndex } = action.payload;
        const path = state.paths[pathId];
        if (!path) return;

        path.items.splice(insertIndex, 0, item);
    },

    setPathItemPart: (state: ShapeState, action: PayloadAction<{
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

    removePath: (state: ShapeState, action: PayloadAction<{ pathId: string }>) => {
        const { pathId } = action.payload;
        delete state.paths[pathId];
    },

    removePathItem: (state: ShapeState, action: PayloadAction<{
        pathId: string;
        itemIndex: number;
    }>) => {
        const { pathId, itemIndex } = action.payload;
        const path = state.paths[pathId];
        if (!path) return;

        path.items.splice(itemIndex, 1);
    },

    setPathItemControlPointId: (state: ShapeState, action: PayloadAction<{
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

    appendPathItem: (state: ShapeState, action: PayloadAction<{
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

    setEdge: (state: ShapeState, action: PayloadAction<{ edge: ShapeEdge }>) => {
        const { edge } = action.payload;
        state.edges[edge.id] = edge;
    },

    setEdgeNodeId: (state: ShapeState, action: PayloadAction<{ edgeId: string; nodeId: string }>) => {
        const { edgeId, nodeId } = action.payload;
        const edge = state.edges[edgeId];
        if (!edge) return;

        edge.n0 = nodeId;
    },

    setEdgeControlPointId: (state: ShapeState, action: PayloadAction<{ edgeId: string; controlPointId: string }>) => {
        const { edgeId, controlPointId } = action.payload;
        const edge = state.edges[edgeId];
        if (!edge) return;

        edge.cp0 = controlPointId;
    },

    removeEdge: (state: ShapeState, action: PayloadAction<{ edgeId: string }>) => {
        const { edgeId } = action.payload;
        delete state.edges[edgeId];
    },

    addNode: (state: ShapeState, action: PayloadAction<{ shapeId: string; node: ShapeNode }>) => {
        const { shapeId, node } = action.payload;
        const shape = state.shapes[shapeId];
        if (!shape) return;

        state.nodes[node.id] = node;
        shape.nodes.push(node.id);
    },

    removeNode: (state: ShapeState, action: PayloadAction<{ shapeId: string; nodeId: string }>) => {
        const { shapeId, nodeId } = action.payload;
        const shape = state.shapes[shapeId];
        if (!shape) return;

        shape.nodes = shape.nodes.filter(id => id !== nodeId);
    },

    setControlPoint: (state: ShapeState, action: PayloadAction<{ controlPoint: ShapeControlPoint }>) => {
        const { controlPoint } = action.payload;
        state.controlPoints[controlPoint.id] = controlPoint;
    },

    removeControlPoint: (state: ShapeState, action: PayloadAction<{ controlPointId: string }>) => {
        const { controlPointId } = action.payload;
        delete state.controlPoints[controlPointId];
    },

    addObjects: (state: ShapeState, action: PayloadAction<{ fields: Partial<ShapeState> }>) => {
        const { fields } = action.payload;
        if (fields.shapes) Object.assign(state.shapes, fields.shapes);
        if (fields.edges) Object.assign(state.edges, fields.edges);
        if (fields.nodes) Object.assign(state.nodes, fields.nodes);
        if (fields.controlPoints) Object.assign(state.controlPoints, fields.controlPoints);
        if (fields.paths) Object.assign(state.paths, fields.paths);
    },
};

export const shapeSlice = createUndoableSlice(
    'shape',
    initialState,
    reducers
);

export const shapeActions = shapeSlice.actions;
export const shapeReducer = shapeSlice.reducer; 
