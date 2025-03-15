import React from "react";
import { cssVariables, cssZIndex } from "~/cssVariables";
import { FlowGraph } from "~/flow/flowTypes";
import { flowEditorPositionToViewport, flowSelectionFromState } from "~/flow/flowUtils";
import { FlowAreaState } from "~/flow/state/flowAreaSlice";
import { FlowGraphSelection } from "~/flow/state/flowSelectionSlice";
import { FlowState } from "~/flow/state/flowSlice";
import {
    calculateNodeInputPosition,
    calculateNodeOutputPosition,
} from "~/flow/util/flowNodeHeight";
import { connectActionState } from "~/state/stateUtils";
import { Vec2 } from "~/util/math/vec2";

const COLOR = cssVariables.red300;
const LINE_WIDTH = 1.5;

interface OwnProps {
	graphId: string;
	areaState: FlowAreaState;
	width: number;
	height: number;
	x: number;
	y: number;
}
interface StateProps {
	graph: FlowGraph;
	nodes: FlowState["nodes"];
	selection: FlowGraphSelection;
}
type Props = OwnProps & StateProps;

const FlowEditorConnectionsComponent: React.FC<Props> = (props) => {
	const { areaState, graph, width, height, x, y, nodes } = props;
	const { pan, scale } = areaState;
	const opts = { viewport: { width, height, x, y }, pan, scale };

	const lines: React.ReactNode[] = [];

	if (areaState.dragPreview) {
		const [p0, p1] = areaState.dragPreview.map((vec) =>
			flowEditorPositionToViewport(vec, opts),
		);

		const style = { stroke: COLOR, strokeWidth: LINE_WIDTH * areaState.scale };
		const key = "dragPreviw";
		lines.push(<line key={key} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} style={style} />);
	}

	const nodeIds = graph.nodes;
	for (let i = 0; i < nodeIds.length; i += 1) {
		const node = nodes[nodeIds[i]];

		for (let j = 0; j < node.inputs.length; j += 1) {
			const pointer = node.inputs[j].pointer;

			if (!pointer) {
				continue;
			}

			const targetNode = nodes[pointer.nodeId];

			const targetPos = calculateNodeOutputPosition(
				targetNode,
				pointer.outputIndex,
			).apply((vec: Vec2) => flowEditorPositionToViewport(vec, opts));

			const nodePos = calculateNodeInputPosition(node, j).apply((vec: Vec2) =>
				flowEditorPositionToViewport(vec, opts),
			);

			lines.push(
				<line
					key={`${node.id}-${j}`}
					x1={nodePos.x}
					y1={nodePos.y}
					x2={targetPos.x}
					y2={targetPos.y}
					style={{
						stroke: COLOR,
						strokeWidth: LINE_WIDTH * areaState.scale,
					}}
				/>,
			);
		}
	}

	return (
		<svg
			width={width}
			height={height}
			style={{
				zIndex: cssZIndex.flowEditor.connections,
				position: "absolute",
				top: 0,
				left: 0,
				pointerEvents: "none",
			}}
		>
			{lines}
		</svg>
	);
};

const mapStateToProps: MapActionState<StateProps, OwnProps> = (
	{ flowState, flowSelectionState },
	ownProps,
) => {
	const { nodes } = flowState;
	const graph = flowState.graphs[ownProps.graphId];
	const selection = flowSelectionFromState(ownProps.graphId, flowSelectionState);
	return {
		graph,
		nodes,
		selection,
	};
};

type ConnectedProps = OwnProps;

export const FlowEditorConnections = connectActionState<StateProps, OwnProps>(mapStateToProps)(
	FlowEditorConnectionsComponent
);
