import { Action } from '~/types';
import { createHistorySlice } from './historySlice';

// Création du slice d'historique de l'application
export const appHistorySlice = createHistorySlice(
    "appHistory",
    null, // initialState sera géré par le reducer spécifique
    (state, action: Action) => {
        // Le reducer sera géré par les différents slices de l'application
        return state;
    }
);

// Export des actions
export const { 
    moveHistoryIndex, 
    startAction, 
    dispatchToAction, 
    dispatchBatchToAction, 
    submitAction, 
    cancelAction 
} = appHistorySlice.actions;

// Export du reducer
export const appHistoryReducer = appHistorySlice.reducer; 
