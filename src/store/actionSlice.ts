import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActionState } from './store-types';

const initialState: ActionState = {
    ids: [],
    entities: {},
    temporaryAction: null,
    status: 'idle',
    error: null
};

const actionSlice = createSlice({
    name: 'action',
    initialState,
    reducers: {
        setTemporaryAction: (state, action: PayloadAction<any>) => {
            state.temporaryAction = action.payload;
        },
        clearTemporaryAction: (state) => {
            state.temporaryAction = null;
        },
        setStatus: (state, action: PayloadAction<'idle' | 'loading' | 'succeeded' | 'failed'>) => {
            state.status = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    }
});

export const { setTemporaryAction, clearTemporaryAction, setStatus, setError } = actionSlice.actions;
export default actionSlice.reducer; 
