import { dispatchToAreaState } from "~/area/state/areaSlice";
import { keys } from "~/constants";
import { diffFactory, DiffFactoryFn } from "~/diff/diffFactory";
import { Diff } from "~/diff/diffs";
import { addListener as baseAddListener, removeListener } from "~/listener/addListener";
import { sendDiffsToSubscribers } from "~/listener/diffListener";
import { historyActions } from "~/state/history/historyActions";
import { getActionId, getActionState, getCurrentState } from "~/state/stateUtils";
import { store } from "~/state/store-init";
import { Action } from "~/types";

let _n = 0;

type Key = keyof typeof keys;
type MouseEventType = "mousedown" | "mouseup" | "mousemove";
type KeyboardEventType = "keydown" | "keyup" | "keypress";

export type ShouldAddToStackFn = (prevState: ActionState, nextState: ActionState) => boolean;

interface RequestActionOptions {
	history?: boolean;
	shouldAddToStack?: ShouldAddToStackFn | ShouldAddToStackFn[];
	beforeSubmit?: (params: RequestActionParams) => void;
}

interface SubmitOptions {
	allowIndexShift: boolean;
	shouldAddToStack?: ShouldAddToStackFn;
}

export interface RequestActionParams {
	dispatch: (action: Action | Action[], ...otherActions: Action[]) => void;
	dispatchToAreaState: (areaId: string, action: Action) => void;
	cancelAction: () => void;
	submitAction: (name?: string, options?: Partial<SubmitOptions>) => void;
	addListener: {
		once: (type: MouseEventType | KeyboardEventType, listenerFn: (e: MouseEvent | KeyboardEvent) => void) => string;
		repeated: (type: MouseEventType | KeyboardEventType, listenerFn: (e: MouseEvent | KeyboardEvent) => void) => string;
		keyboardOnce: (key: Key, type: KeyboardEventType, listenerFn: (e: KeyboardEvent) => void) => string;
		keydownLong: (key: Key, listenerFn: (e: KeyboardEvent) => void) => string;
	};
	removeListener: typeof removeListener;
	execOnComplete: (callback: () => void) => void;
	done: () => boolean;
	addDiff: (fn: DiffFactoryFn, options?: { perform: boolean }) => void;
	performDiff: (fn: DiffFactoryFn) => void;
	addReverseDiff: (fn: DiffFactoryFn) => void;
}

export interface RequestActionCallback {
	(params: RequestActionParams): void;
}

const performRequestedAction = (
	{ history = false, shouldAddToStack, beforeSubmit }: RequestActionOptions,
	callback: RequestActionCallback,
): void => {
	const actionId = (++_n).toString();
	const cancelTokens: string[] = [];

	const done = () => actionId !== getActionId();

	const wrappedAddListener = {
		once: <T extends MouseEventType | KeyboardEventType>(
			type: T,
			listenerFn: (e: T extends MouseEventType ? MouseEvent : KeyboardEvent) => void
		): string => {
			if (done()) return actionId;
			const cancelToken = baseAddListener.once(type, listenerFn as any);
			cancelTokens.push(cancelToken);
			return cancelToken;
		},
		repeated: <T extends MouseEventType | KeyboardEventType>(
			type: T,
			listenerFn: (e: T extends MouseEventType ? MouseEvent : KeyboardEvent) => void
		): string => {
			if (done()) return actionId;
			const cancelToken = baseAddListener.repeated(type, listenerFn as any);
			cancelTokens.push(cancelToken);
			return cancelToken;
		},
		keyboardOnce: (key: Key, type: KeyboardEventType, listenerFn: (e: KeyboardEvent) => void): string => {
			if (done()) return actionId;
			const cancelToken = baseAddListener.keyboardOnce(key, type, listenerFn);
			cancelTokens.push(cancelToken);
			return cancelToken;
		},
		keydownLong: (key: Key, listenerFn: (e: KeyboardEvent) => void): string => {
			if (done()) return actionId;
			const cancelToken = baseAddListener.keydownLong(key, listenerFn);
			cancelTokens.push(cancelToken);
			return cancelToken;
		},
	};

	let onCompleteCallback: (() => void) | null = null;

	const onComplete = () => {
		cancelTokens.forEach((cancelToken) => removeListener(cancelToken));

		if (onCompleteCallback) {
			onCompleteCallback();
		}
	};

	const diffs: Diff[] = [];
	const allDiffs: Diff[] = [];
	const addedButNotPerformedDiffs: Diff[] = [];
	const reverseDiffs: Diff[] = [];

	const cancelAction = () => {
		store.dispatch(historyActions.cancelAction(actionId));
		onComplete();

		const diffsToPerform = reverseDiffs.length ? reverseDiffs : [...allDiffs].reverse();
		sendDiffsToSubscribers(getActionState(), diffsToPerform, "backward");
	};

	store.dispatch(historyActions.startAction(actionId));

	const escToken = wrappedAddListener.keyboardOnce("Esc", "keydown", cancelAction);
	cancelTokens.push(escToken);

	const dispatch: RequestActionParams["dispatch"] = (action, ...args) => {

		// Si l'action ou une des actions du batch a skipHistory, dispatch directement
		const shouldSkipHistory = (a: Action) => a.payload?.skipHistory === true;

		if (Array.isArray(action)) {
			if (args.length) {
				console.warn(
					"Dispatch received an array as the first argument AND received additional arguments.",
				);
			}

			const actions = action;
			if (actions.some(shouldSkipHistory)) {
				// Dispatch chaque action individuellement
				actions.forEach(a => {
					if (shouldSkipHistory(a)) {
						store.dispatch(a);
					} else {
						store.dispatch(historyActions.dispatchToAction(actionId, a, history));
					}
				});
			} else {
				store.dispatch(historyActions.dispatchBatchToAction(actionId, actions, history));
			}
			return;
		}

		if (args.length) {
			const actions = [action, ...args];
			if (actions.some(shouldSkipHistory)) {
				// Dispatch chaque action individuellement
				actions.forEach(a => {
					if (shouldSkipHistory(a)) {
						store.dispatch(a);
					} else {
						store.dispatch(historyActions.dispatchToAction(actionId, a, history));
					}
				});
			} else {
				store.dispatch(historyActions.dispatchBatchToAction(actionId, actions, history));
			}
			return;
		}

		// Action unique
		if (shouldSkipHistory(action)) {
			store.dispatch(action);
		} else {
			store.dispatch(historyActions.dispatchToAction(actionId, action, history));
		}
	};

	const params: RequestActionParams = {
		done,
		dispatch,
		dispatchToAreaState: (areaId, action) => {
			dispatch(dispatchToAreaState({
				areaId,
				action
			}));
		},
		submitAction: (name = "Unknown action", options = {}) => {
			const { allowIndexShift = false } = options;

			if (!getActionId()) {
				console.warn("Attempted to submit an action that does not exist.");
				return;
			}

			if (getActionId() !== actionId) {
				console.warn("Attempted to submit with the wrong action id.");
				return;
			}

			const shouldAddToStackFns: ShouldAddToStackFn[] = [];

			if (Array.isArray(shouldAddToStack)) {
				shouldAddToStackFns.push(...shouldAddToStack);
			} else if (typeof shouldAddToStack === "function") {
				shouldAddToStackFns.push(shouldAddToStack);
			}

			if (options.shouldAddToStack) {
				shouldAddToStackFns.push(options.shouldAddToStack);
			}

			let addToStack = shouldAddToStackFns.length === 0;

			for (const shouldAddToStack of shouldAddToStackFns) {
				if (shouldAddToStack(getCurrentState(), getActionState())) {
					addToStack = true;
				}
			}

			if (!addToStack) {
				store.dispatch(historyActions.cancelAction(actionId));
				onComplete();
				return;
			}

			if (beforeSubmit) {
				beforeSubmit(params);
			}

			if (diffs.length) {
				sendDiffsToSubscribers(getActionState(), diffs);
			}

			store.dispatch(
				historyActions.submitAction(
					actionId,
					name,
					history,
					[],
					allowIndexShift,
					[...diffs, ...addedButNotPerformedDiffs],
				),
			);
			onComplete();
		},
		cancelAction,
		addListener: wrappedAddListener,
		removeListener,
		execOnComplete: (cb) => {
			onCompleteCallback = cb;
		},
		addDiff: (fn, options = { perform: true }) => {
			const result = fn(diffFactory);
			const diffsToAdd = Array.isArray(result) ? result : [result];

			if (options.perform) {
				diffs.push(...diffsToAdd);
				allDiffs.push(...diffsToAdd);
			} else {
				addedButNotPerformedDiffs.push(...diffsToAdd);
			}
		},
		performDiff: (fn) => {
			const result = fn(diffFactory);
			const diffsToPerform = Array.isArray(result) ? result : [result];
			allDiffs.push(...diffsToPerform);
			sendDiffsToSubscribers(getActionState(), diffsToPerform);
		},
		addReverseDiff: (fn) => {
			const result = fn(diffFactory);
			const diffsToAdd = Array.isArray(result) ? result : [result];
			reverseDiffs.push(...diffsToAdd);
		},
	};

	callback(params);
};

export const requestAction = (
	options: RequestActionOptions,
	callback: RequestActionCallback,
): void => {
	if (!getActionId()) {
		performRequestedAction(options, callback);
		return;
	}

	requestAnimationFrame(() => {
		if (!getActionId()) {
			performRequestedAction(options, callback);
			return;
		}
	});
};
