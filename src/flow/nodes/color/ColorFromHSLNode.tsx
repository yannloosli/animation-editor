import React from "react";
import { FlowNodeState } from "~/flow/flowNodeState";
import { FlowNodeInput, FlowNodeProps, FlowNodeType } from "~/flow/flowTypes";
import NodeStyles from "~/flow/nodes/Node.styles";
import { NodeInputCircle } from "~/flow/nodes/NodeInputCircle";
import { NodeOutputs } from "~/flow/nodes/NodeOutputs";
import { connectActionState } from "~/state/stateUtils";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(NodeStyles);

const Container: React.FC<{ index: number; nodeId: string; input: FlowNodeInput }> = (props) => {
	const { index, children, input, nodeId } = props;
	return (
		<div className={s("input", { noPadding: !input.pointer })}>
			<NodeInputCircle nodeId={nodeId} valueType={input.type} index={index} />
			{input.pointer ? <div className={s("input__name")}>{input.name}</div> : children}
		</div>
	);
};

type OwnProps = FlowNodeProps;
interface StateProps {
	state: FlowNodeState<FlowNodeType.color_from_hsl_factors>;
	inputs: FlowNodeInput[];
}
type Props = OwnProps & StateProps;

const ColorFromHSLNodeComponent: React.FC<Props> = (props) => {
	const { nodeId, inputs } = props;

	return (
		<>
			{inputs.map((input, index) => (
				<div className={s("input")} key={index}>
					<NodeInputCircle nodeId={nodeId} valueType={input.type} index={index} />
					<div className={s("input__name")}>{input.name}</div>
				</div>
			))}
			<NodeOutputs nodeId={nodeId} />
		</>
	);
};

const mapStateToProps: MapActionState<StateProps, OwnProps> = ({ flowState, timelineArea }, { nodeId }) => {
	const node = flowState.nodes[nodeId];
	return {
		state: node.state as StateProps["state"],
		inputs: node.inputs,
	};
};

export const ColorFromHSLNode = connectActionState(mapStateToProps)(ColorFromHSLNodeComponent);
