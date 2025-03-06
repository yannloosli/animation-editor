import { Tool } from "~/constants";
import { RequestActionParams } from "~/listener/requestAction";
import { createOperation } from "~/state/operation";
import { setTool } from "~/toolbar/toolSlice";
import { Operation } from "~/types";

export const setToolOperation = (params: RequestActionParams, tool: Tool): Operation => {
	const op = createOperation(params);
	op.add(setTool({ tool }));
	return op;
};
