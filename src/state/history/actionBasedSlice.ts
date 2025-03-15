import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface ActionBasedState<S> {
    state: S;
    action: null | {
        id: string;
        state: S;
    };
}

export function createActionBasedSlice<S>(
    name: string,
    initialState: S,
    reducer: (state: any, action: any) => any
) {
    const initState: ActionBasedState<S> = {
        state: initialState,
        action: null,
    };

    return createSlice({
        name,
        initialState: initState,
        reducers: {
            startAction: (state, action: PayloadAction<{ actionId: string }>) => {
                if (state.action) {
                    console.warn("Attempted to start an action with another action in process.");
                    return;
                }

                const { actionId } = action.payload;

                state.action = {
                    id: actionId,
                    state: state.state,
                };
            },

            dispatchBatchToAction: (state, action: PayloadAction<{
                actionId: string;
                actionBatch: any[];
            }>) => {
                const { actionId, actionBatch } = action.payload;

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
                    newState = reducer(newState, actionBatch[i]);
                }

                if (newState === state.action.state) {
                    // State was not modified
                    return;
                }

                state.action.state = newState;
            },

            dispatchToAction: (state, action: PayloadAction<{
                actionId: string;
                actionToDispatch: any;
            }>) => {
                const { actionId, actionToDispatch } = action.payload;

                if (!state.action) {
                    console.warn("Attempted to dispatch to an action that does not exist.");
                    return;
                }

                if (state.action.id !== actionId) {
                    console.warn("Attempted to dispatch with the wrong action id.");
                    return;
                }

                const newState = reducer(state.action.state, actionToDispatch);

                if (newState === state.action.state) {
                    // State was not modified
                    return;
                }

                state.action.state = newState;
            },

            submitAction: (state, action: PayloadAction<{ actionId: string }>) => {
                const { actionId } = action.payload;

                if (!state.action) {
                    console.warn("Attempted to submit an action that does not exist.");
                    return;
                }

                if (state.action.id !== actionId) {
                    console.warn("Attempted to submit with the wrong action id.");
                    return;
                }

                state.state = state.action.state;
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

            // Gérer les actions non liées à l'historique
            handleNormalAction: (state, action: PayloadAction<any>) => {
                const newState = reducer(state.state, action.payload);
                if (newState === state.state) {
                    return;
                }

                state.state = newState;
                if (state.action) {
                    state.action.state = newState;
                }
            }
        },
    });
}

// Exemple d'utilisation :
// const actionBasedSlice = createActionBasedSlice("myActionBased", initialState, reducer);
// export const { startAction, dispatchToAction, dispatchBatchToAction, submitAction, cancelAction, handleNormalAction } = actionBasedSlice.actions;
// export const actionBasedReducer = actionBasedSlice.reducer; 
