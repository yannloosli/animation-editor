import { action } from "typesafe-actions";
import { Diff } from "~/diff/diffs";

export const historyActions = {
	moveHistoryIndex: (index: number) => {
		console.log("[HISTORY] Moving index to:", index);
		return action("history/MOVE_INDEX", { index });
	},

	startAction: (actionId: string) => {
		console.log("[HISTORY] Starting action:", {
			actionId,
			timestamp: new Date().toISOString()
		});
		return action("history/START_ACTION", { actionId });
	},

	dispatchToAction: (actionId: string, actionToDispatch: any, modifiesHistory: boolean) => {
		console.log("[HISTORY] Dispatching action:", {
			actionId,
			actionType: actionToDispatch.type,
			payload: actionToDispatch.payload,
			modifiesHistory,
			timestamp: new Date().toISOString()
		});
		return action("history/DISPATCH_TO_ACTION", {
			actionId,
			actionToDispatch,
			modifiesHistory,
		});
	},

	dispatchBatchToAction: (actionId: string, actionBatch: any[], modifiesHistory: boolean) => {
		console.log("[HISTORY] Dispatching batch:", {
			actionId,
			actionTypes: actionBatch.map(a => a.type),
			payloads: actionBatch.map(a => a.payload),
			modifiesHistory,
			batchSize: actionBatch.length,
			timestamp: new Date().toISOString()
		});
		return action("history/DISPATCH_BATCH_TO_ACTION", {
			actionId,
			actionBatch,
			modifiesHistory,
		});
	},

	submitAction: (
		actionId: string,
		name: string,
		modifiesHistory: boolean,
		modifiedKeys: string[],
		allowIndexShift: boolean,
		diffs: Diff[],
	) => {
		console.log("[HISTORY] Submitting action:", {
			actionId,
			name,
			modifiesHistory,
			modifiedKeys,
			allowIndexShift,
			diffCount: diffs.length,
			timestamp: new Date().toISOString()
		});
		return action("history/SUBMIT_ACTION", {
			actionId,
			name,
			modifiesHistory,
			modifiedKeys,
			allowIndexShift,
			diffs,
		});
	},

	cancelAction: (actionId: string) => {
		console.log("[HISTORY] Cancelling action:", {
			actionId,
			timestamp: new Date().toISOString()
		});
		return action("history/CANCEL_ACTION", { actionId });
	},
};
