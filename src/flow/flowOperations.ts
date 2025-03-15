import { flowSelectionFromState } from "~/flow/flowUtils";
import {
    getValueTypeCanConvertToValueTypes,
    getValueTypesThatCanConvertToValueType,
} from "~/flow/flowValueConversion";
import { setSelectedNodesInGraph } from "~/flow/state/flowSelectionSlice";
import {
    connectInputToOutput as connectInputToOutputAction,
    removeGraph as removeGraphAction,
    removeInputPointer as removeInputPointerAction,
    removeNode as removeNodeAction,
    setNodeInputType as setNodeInputTypeAction,
    setNodeOutputType as setNodeOutputTypeAction,
} from "~/flow/state/flowSlice";
import { Operation, ValueType } from "~/types";

function selectNode(op: Operation, nodeId: string): void {
	const { flowState, flowSelectionState } = op.state;
	const node = flowState.nodes[nodeId];

	const selection = flowSelectionFromState(node.graphId, flowSelectionState);

	// If the node is selected, do nothing.
	if (!selection.nodes[nodeId]) {
		op.add(setSelectedNodesInGraph(node.graphId, [nodeId]));
	}
}

const removeSelectedNodesInGraph = (op: Operation, graphId: string): void => {
	const { compositionState, flowState, flowSelectionState } = op.state;

	const graph = flowState.graphs[graphId];
	const selection = flowSelectionFromState(graphId, flowSelectionState);
	const nodeIds = graph.nodes;

	for (const nodeId of nodeIds) {
		if (selection.nodes[nodeId]) {
			op.add(removeNodeAction({ nodeId }));
		}
	}

	switch (graph.type) {
		case "layer_graph": {
			op.addDiff((diff) => diff.propertyStructure(graph.layerId));
			break;
		}
		case "array_modifier_graph": {
			const property = compositionState.properties[graph.propertyId];
			op.addDiff((diff) => diff.propertyStructure(property.layerId));
			break;
		}
		default:
			throw new Error(`Unexpected graph type '${graph.type}'.`);
	}
};

const removeGraph = (op: Operation, graphId: string): void => {
	op.add(removeGraphAction({ graphId }));
};

const connectOutputToInput = (
	op: Operation,
	outputNodeId: string,
	outputIndex: number,
	inputNodeId: string,
	inputIndex: number,
): void => {
	op.add(connectInputToOutputAction({ outputNodeId, outputIndex, inputNodeId, inputIndex }));
	op.addDiff((diff) => diff.updateNodeConnection([outputNodeId, inputNodeId]));
};

const removeInputPointer = (op: Operation, inputNodeId: string, inputIndex: number): void => {
	const { flowState } = op.state;
	const node = flowState.nodes[inputNodeId];
	const { nodeId: outputNodeId } = node.inputs[inputIndex].pointer!;

	op.add(removeInputPointerAction({ nodeId: inputNodeId, inputIndex }));
	op.addDiff((diff) => diff.updateNodeConnection([outputNodeId, inputNodeId]));
};

const setInputValueType = (
	op: Operation,
	inputNodeId: string,
	inputIndex: number,
	valueType: ValueType,
): void => {
	const { flowState } = op.state;
	const node = flowState.nodes[inputNodeId];

	const affectedNodeIds = [inputNodeId];
	const compatibleOutputValueTypes = getValueTypesThatCanConvertToValueType(valueType);

	const pointer = node.inputs[inputIndex].pointer;
	if (pointer) {
		const output = flowState.nodes[pointer.nodeId].outputs[pointer.outputIndex];
		if (!compatibleOutputValueTypes.has(output.type)) {
			op.add(removeInputPointerAction({ nodeId: inputNodeId, inputIndex }));
			affectedNodeIds.push(pointer.nodeId);
		}
	}

	op.add(setNodeInputTypeAction({ nodeId: inputNodeId, inputIndex, valueType }));
	op.addDiff((diff) => diff.updateNodeConnection(affectedNodeIds));
};

const setOutputValueType = (
	op: Operation,
	outputNodeId: string,
	outputIndex: number,
	valueType: ValueType,
): void => {
	const { flowState } = op.state;
	const node = flowState.nodes[outputNodeId];
	const graph = flowState.graphs[node.graphId];

	const affectedNodeIds = [outputNodeId];
	const compatibleInputValueTypes = getValueTypeCanConvertToValueTypes(valueType);

	for (const nodeId of graph.nodes) {
		const node = flowState.nodes[nodeId];

		for (const [inputIndex, input] of node.inputs.entries()) {
			if (
				!input.pointer ||
				input.pointer.nodeId !== outputNodeId ||
				input.pointer.outputIndex !== outputIndex
			) {
				continue;
			}

			if (compatibleInputValueTypes.has(input.type)) {
				continue;
			}

			op.add(removeInputPointerAction({ nodeId, inputIndex }));
			affectedNodeIds.push(nodeId);
		}
	}

	op.add(setNodeOutputTypeAction({ nodeId: outputNodeId, outputIndex, valueType }));
	op.addDiff((diff) => diff.updateNodeConnection(affectedNodeIds));
};

export const flowOperations = {
	selectNode,
	removeSelectedNodesInGraph,
	removeGraph,
	connectOutputToInput,
	removeInputPointer,
	setInputValueType,
	setOutputValueType,
};
