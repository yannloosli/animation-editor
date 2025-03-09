import { addListener } from "~/listener/addListener";
import { sendDiffsToSubscribers } from "~/listener/diffListener";
import { isKeyCodeOf, isKeyDown } from "~/listener/keyboard";
import { moveIndex } from "~/state/history/historySlice";
import { getActionStateFromApplicationState } from "~/state/stateUtils";
import { store } from "~/state/store-init";

const redo = () => {
	const state = store.getState();
	if (state.history.index === state.history.list.length - 1) {
		// Nothing to redo.
		return;
	}

	const nextIndex = state.history.index + 1;
	const nextActionState = getActionStateFromApplicationState(store.getState());
	const next = state.history.list[nextIndex];
	store.dispatch(moveIndex({ index: nextIndex }));
	sendDiffsToSubscribers(nextActionState, next.diffs, "forward");
};

const undo = () => {
	const state = store.getState();
	if (state.history.index === 0) {
		return;
	}

	const curr = state.history.list[state.history.index];
	const nextIndex = state.history.index - 1;
	const nextActionState = getActionStateFromApplicationState(store.getState());
	store.dispatch(moveIndex({ index: nextIndex }));
	sendDiffsToSubscribers(nextActionState, curr.diffs, "backward");
};

// Ajouter les écouteurs de clavier pour undo/redo
addListener.keyDown((e) => {
	if (isKeyDown("Control") && isKeyCodeOf("z")(e)) {
		if (isKeyDown("Shift")) {
			redo();
		} else {
			undo();
		}
	} else if (isKeyDown("Control") && isKeyCodeOf("y")(e)) {
		redo();
	}
});
