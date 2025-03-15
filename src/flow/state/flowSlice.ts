import { PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_FLOW_NODE_WIDTH } from "~/constants";
import { getFlowNodeDefaultInputs, getFlowNodeDefaultOutputs } from "~/flow/flowIO";
import { FlowNodeState, getFlowNodeDefaultState } from "~/flow/flowNodeState";
import {
    FlowGraph,
    FlowNode,
    FlowNodeInput,
    FlowNodeIO,
    FlowNodeOutput,
    FlowNodeType,
} from "~/flow/flowTypes";
import {
    getExpressionNodeInputDefaultValue,
    removeFlowNodeAndReferencesToIt,
    removeReferencesToFlowNode,
} from "~/flow/flowUtils";
import { createUndoableSlice } from "~/state/undoConfig";
import { ValueType } from "~/types";
import {
    createMapNumberId
} from "~/util/mapUtils";
import { Vec2 } from "~/util/math/vec2";

export interface FlowState {
    graphs: {
        [graphId: string]: FlowGraph;
    };
    nodes: {
        [nodeId: string]: FlowNode;
    };
}

export const initialState: FlowState = {
    graphs: {},
    nodes: {},
};

export { initialState as initialFlowState };

const reducers = {
    // Graph actions
    setGraph: (state: FlowState, action: PayloadAction<{ graph: FlowGraph }>) => {
        const { graph } = action.payload;
        state.graphs[graph.id] = graph;
    },
    removeGraph: (state: FlowState, action: PayloadAction<{ graphId: string }>) => {
        const { graphId } = action.payload;
        delete state.graphs[graphId];
    },

    // Node actions
    setNode: (state: FlowState, action: PayloadAction<{ node: FlowNode }>) => {
        const { node } = action.payload;
        state.nodes[node.id] = node;
    },
    setNodePosition: (state: FlowState, action: PayloadAction<{ nodeId: string; position: Vec2 }>) => {
        const { nodeId, position } = action.payload;
        state.nodes[nodeId].position = position;
    },
    setNodeWidth: (state: FlowState, action: PayloadAction<{ nodeId: string; graphId: string; width: number }>) => {
        const { nodeId, width } = action.payload;
        state.nodes[nodeId].width = width;
    },
    removeNode: (state: FlowState, action: PayloadAction<{ nodeId: string }>) => {
        const { nodeId } = action.payload;
        return removeFlowNodeAndReferencesToIt(nodeId, state);
    },
    removeReferencesToNodeInGraph: (state: FlowState, action: PayloadAction<{ nodeId: string }>) => {
        const { nodeId } = action.payload;
        return removeReferencesToFlowNode(nodeId, state);
    },

    // Add node actions
    startAddNode: (state: FlowState, action: PayloadAction<{ graphId: string; type: FlowNodeType; io?: FlowNodeIO }>) => {
        const { graphId, type, io } = action.payload;
        state.graphs[graphId]._addNodeOfTypeOnClick = { type, io };
    },
    submitAddNode: (state: FlowState, action: PayloadAction<{ graphId: string; position: Vec2 }>) => {
        const { graphId, position } = action.payload;
        const nodeId = createMapNumberId(state.nodes);
        const graph = state.graphs[graphId];
        const { type, io } = graph._addNodeOfTypeOnClick!;

        graph._addNodeOfTypeOnClick = null;
        graph.nodes.push(nodeId);

        state.nodes[nodeId] = {
            id: nodeId,
            graphId: graph.id,
            type,
            position,
            width: DEFAULT_FLOW_NODE_WIDTH,
            inputs: io?.inputs || getFlowNodeDefaultInputs(type),
            outputs: io?.outputs || getFlowNodeDefaultOutputs(type),
            state: getFlowNodeDefaultState(type),
        };
    },

    // Node state actions
    updateNodeState: (state: FlowState, action: PayloadAction<{ graphId: string; nodeId: string; state: Partial<FlowNodeState<any>> }>) => {
        const { nodeId, state: nodeState } = action.payload;
        Object.assign(state.nodes[nodeId].state, nodeState);
    },

    // Selection actions
    setDragSelectRect: (state: FlowState, action: PayloadAction<{ graphId: string; rect: Rect | null }>) => {
        const { graphId, rect } = action.payload;
        state.graphs[graphId]._dragSelectRect = rect;
    },

    // Connection actions
    connectInputToOutput: (state: FlowState, action: PayloadAction<{
        outputNodeId: string;
        outputIndex: number;
        inputNodeId: string;
        inputIndex: number;
    }>) => {
        const { outputNodeId, outputIndex, inputNodeId, inputIndex } = action.payload;
        state.nodes[inputNodeId].inputs[inputIndex].pointer = { nodeId: outputNodeId, outputIndex };
    },
    removeInputPointer: (state: FlowState, action: PayloadAction<{ nodeId: string; inputIndex: number }>) => {
        const { nodeId, inputIndex } = action.payload;
        state.nodes[nodeId].inputs[inputIndex].pointer = null;
    },

    // Node IO actions
    setNodeInputs: (state: FlowState, action: PayloadAction<{ nodeId: string; inputs: FlowNodeInput[] }>) => {
        const { nodeId, inputs } = action.payload;
        state.nodes[nodeId].inputs = inputs;
    },
    setNodeOutputs: (state: FlowState, action: PayloadAction<{ nodeId: string; outputs: FlowNodeOutput[] }>) => {
        const { nodeId, outputs } = action.payload;
        state.nodes[nodeId].outputs = outputs;
    },
    setNodeInputType: (state: FlowState, action: PayloadAction<{ nodeId: string; inputIndex: number; valueType: ValueType }>) => {
        const { nodeId, inputIndex, valueType } = action.payload;
        const input = state.nodes[nodeId].inputs[inputIndex];
        input.type = valueType;
        input.value = getExpressionNodeInputDefaultValue(valueType);
    },
    setNodeOutputType: (state: FlowState, action: PayloadAction<{ nodeId: string; outputIndex: number; valueType: ValueType }>) => {
        const { nodeId, outputIndex, valueType } = action.payload;
        state.nodes[nodeId].outputs[outputIndex].type = valueType;
    },
    addNodeInput: (state: FlowState, action: PayloadAction<{ nodeId: string; input: FlowNodeInput }>) => {
        const { nodeId, input } = action.payload;
        state.nodes[nodeId].inputs.push(input);
    },
    addNodeOutput: (state: FlowState, action: PayloadAction<{ nodeId: string; output: FlowNodeOutput }>) => {
        const { nodeId, output } = action.payload;
        state.nodes[nodeId].outputs.push(output);
    },
    removeNodeInputs: (state: FlowState, action: PayloadAction<{ nodeId: string; indices: number[] }>) => {
        const { nodeId, indices } = action.payload;
        state.nodes[nodeId].inputs = state.nodes[nodeId].inputs.filter((_, i) => !indices.includes(i));
    },
    removeNodeOutputs: (state: FlowState, action: PayloadAction<{ nodeId: string; indices: number[] }>) => {
        const { nodeId, indices } = action.payload;
        state.nodes[nodeId].outputs = state.nodes[nodeId].outputs.filter((_, i) => !indices.includes(i));
    },
    setNodeInputValue: (state: FlowState, action: PayloadAction<{ nodeId: string; inputIndex: number; value: any }>) => {
        const { nodeId, inputIndex, value } = action.payload;
        state.nodes[nodeId].inputs[inputIndex].value = value;
    },
};

export const flowSlice = createUndoableSlice(
    'flow',
    initialState,
    reducers
);

export const {
    setGraph,
    removeGraph,
    setNode,
    setNodePosition,
    setNodeWidth,
    removeNode,
    removeReferencesToNodeInGraph,
    startAddNode,
    submitAddNode,
    updateNodeState,
    setDragSelectRect,
    connectInputToOutput,
    removeInputPointer,
    setNodeInputs,
    setNodeOutputs,
    setNodeInputType,
    setNodeOutputType,
    addNodeInput,
    addNodeOutput,
    removeNodeInputs,
    removeNodeOutputs,
    setNodeInputValue,
} = flowSlice.actions;

export const flowReducer = flowSlice.reducer; 
