import { PayloadAction, SliceCaseReducers, createSlice } from "@reduxjs/toolkit";

export interface TemporaryActionState<S> {
    current: S;
    temporary: null | {
        id: string;
        state: S;
    };
}

export function createTemporaryActionSlice<S>({
    name,
    initialState,
    reducers
}: {
    name: string;
    initialState: S;
    reducers: SliceCaseReducers<S>;
}) {
    const wrappedInitialState: TemporaryActionState<S> = {
        current: initialState,
        temporary: null
    };

    const slice = createSlice({
        name,
        initialState: wrappedInitialState,
        reducers: {
            ...Object.keys(reducers).reduce((acc, key) => ({
                ...acc,
                [key]: (state, action) => {
                    const result = reducers[key](state.current, action);
                    if (result) {
                        state.current = result;
                        if (state.temporary) {
                            state.temporary.state = result;
                        }
                    }
                }
            }), {}),
            startTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
                if (!state.temporary) {
                    state.temporary = {
                        id: action.payload.actionId,
                        state: state.current
                    };
                }
            },
            commitTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
                if (state.temporary && state.temporary.id === action.payload.actionId) {
                    state.current = state.temporary.state;
                    state.temporary = null;
                }
            },
            cancelTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
                if (state.temporary && state.temporary.id === action.payload.actionId) {
                    state.temporary = null;
                }
            }
        }
    });

    return {
        ...slice,
        getState: (state: TemporaryActionState<S>) => state.current,
        getTemporaryState: (state: TemporaryActionState<S>) => state.temporary?.state || state.current
    };
} 
