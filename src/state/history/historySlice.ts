import { Draft, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Diff } from '~/diff/diffs';

export interface HistoryState<S> {
    type: "normal" | "selection";
    list: Array<{
        state: S;
        name: string;
        modifiedRelated: boolean;
        allowIndexShift: boolean;
        diffs: Diff[];
    }>;
    index: number;
    indexDirection: -1 | 1;
    action: null | {
        id: string;
        state: S;
    };
}

interface Options {
    selectionForKey?: string;
}

export function createHistorySlice<S>(
    name: string,
    initialState: S,
    reducer: (state: Draft<S> | S, action: any) => Draft<S> | S,
    options: Options = {}
) {
    const { selectionForKey = "" } = options;

    const initialHistoryState: HistoryState<S> = {
        type: selectionForKey ? "selection" : "normal",
        list: [{ 
            state: initialState, 
            name: "Initial state", 
            modifiedRelated: false, 
            allowIndexShift: false, 
            diffs: [] 
        }],
        index: 0,
        indexDirection: 1,
        action: null,
    };

    return createSlice({
        name,
        initialState: initialHistoryState,
        reducers: {
            moveHistoryIndex: (state, action: PayloadAction<{ index: number }>) => {
                if (state.action) {
                    console.warn("Attempted to move history list index with an action in process.");
                    return;
                }

                const { index } = action.payload;
                state.index = index;
                state.indexDirection = index > state.index ? 1 : -1;
            },

            startAction: (state, action: PayloadAction<{ actionId: string }>) => {
                const { actionId } = action.payload;

                if (state.action) {
                    console.warn("Attempted to start an action while another is in progress.");
                    return;
                }

                const shiftForward =
                    state.type === "selection" &&
                    state.indexDirection === -1 &&
                    state.list[state.index + 1]?.modifiedRelated &&
                    state.list[state.index + 1]?.allowIndexShift;

                const currentState = state.list[state.index + (shiftForward ? 1 : 0)]?.state;
                if (!currentState) {
                    console.warn("No valid state found in history list");
                    return;
                }

                state.action = {
                    id: actionId,
                    state: currentState,
                };
            },

            dispatchToAction: (state, action: PayloadAction<{
                actionId: string;
                actionToDispatch: any;
                modifiesHistory: boolean;
            }>) => {
                const { actionId, actionToDispatch, modifiesHistory } = action.payload;

                if (!modifiesHistory) {
                    return;
                }

                if (!state.action) {
                    console.warn("Attempted to dispatch to an action that does not exist.");
                    return;
                }

                if (state.action.id !== actionId) {
                    console.warn("Attempted to dispatch with the wrong action id.");
                    return;
                }

                const newState = reducer(state.action.state, actionToDispatch) as S;
                if (!newState) {
                    console.warn("Reducer returned undefined state");
                    return;
                }

                if (newState === state.action.state) {
                    // State was not modified
                    return;
                }

                state.action.state = newState;
            },

            dispatchBatchToAction: (state, action: PayloadAction<{
                actionId: string;
                actionBatch: any[];
                modifiesHistory: boolean;
            }>) => {
                const { actionId, actionBatch, modifiesHistory } = action.payload;

                if (!modifiesHistory) {
                    return;
                }

                if (!state.action) {
                    console.warn("Attempted to dispatch to an action that does not exist.");
                    return;
                }

                if (state.action.id !== actionId) {
                    console.warn("Attempted to dispatch with the wrong action id.");
                    return;
                }

                let newState = state.action.state;

                for (let i = 0; i < actionBatch.length; i += 1) {
                    newState = reducer(newState, actionBatch[i]) as S;
                    if (!newState) {
                        console.warn("Reducer returned undefined state");
                        return;
                    }
                }

                if (newState === state.action.state) {
                    // State was not modified
                    return;
                }

                state.action.state = newState;
            },

            submitAction: (state, action: PayloadAction<{
                actionId: string;
                name: string;
                modifiesHistory: boolean;
                modifiedKeys: string[];
                allowIndexShift: boolean;
                diffs: Diff[];
            }>) => {
                const {
                    actionId,
                    name,
                    modifiesHistory,
                    modifiedKeys,
                    allowIndexShift,
                    diffs,
                } = action.payload;

                if (!modifiesHistory) {
                    state.action = null;
                    return;
                }

                if (!state.action) {
                    console.warn("Attempted to submit an action that does not exist.");
                    return;
                }

                if (state.action.id !== actionId) {
                    console.warn("Attempted to submit with the wrong action id.");
                    return;
                }

                state.list = [
                    ...state.list.slice(0, state.index + 1),
                    {
                        state: state.action.state,
                        name,
                        modifiedRelated: modifiedKeys.indexOf(selectionForKey) !== -1,
                        allowIndexShift,
                        diffs,
                    },
                ];
                state.index = state.index + 1;
                state.indexDirection = 1;
                state.action = null;
            },

            cancelAction: (state, action: PayloadAction<{ actionId: string }>) => {
                const { actionId } = action.payload;

                if (!state.action) {
                    console.warn("Attempted to cancel an action that does not exist.");
                    return;
                }

                if (state.action.id !== actionId) {
                    console.warn("Attempted to cancel with the wrong action id.");
                    return;
                }

                state.action = null;
            },
        },
    });
}

// Exemple d'utilisation :
// const historySlice = createHistorySlice("myHistory", initialState, reducer, { selectionForKey: "myKey" });
// export const { moveHistoryIndex, startAction, dispatchToAction, dispatchBatchToAction, submitAction, cancelAction } = historySlice.actions;
// export const historyReducer = historySlice.reducer; 
