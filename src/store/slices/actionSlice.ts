import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interface pour l'état des actions
export interface ActionState {
    temporaryAction: any | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// État initial
const initialState: ActionState = {
    temporaryAction: null,
    status: 'idle',
    error: null
};

// Création du slice avec Redux Toolkit
const actionSlice = createSlice({
    name: 'action',
    initialState,
    reducers: {
        // Action pour définir une action temporaire
        setTemporaryAction: (state, action: PayloadAction<any>) => {
            state.temporaryAction = action.payload;
        },

        // Action pour effacer l'action temporaire
        clearTemporaryAction: (state) => {
            state.temporaryAction = null;
        },

        // Action pour définir le statut
        setStatus: (state, action: PayloadAction<'idle' | 'loading' | 'succeeded' | 'failed'>) => {
            state.status = action.payload;
        },

        // Action pour définir une erreur
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    }
});

// Export des actions
export const {
    setTemporaryAction,
    clearTemporaryAction,
    setStatus,
    setError
} = actionSlice.actions;

// Export du reducer
export default actionSlice.reducer; 
