import { createSlice, Reducer } from "@reduxjs/toolkit";
import { AnyAction } from 'redux';
import undoable, { excludeAction, StateWithHistory, UndoableOptions } from 'redux-undo';

// Configuration de base pour tous les reducers avec historique
const baseUndoableConfig = {
    limit: 50, // Limite de l'historique
    filter: excludeAction([
        'history/START_ACTION',
        'history/DISPATCH_TO_ACTION',
        'history/DISPATCH_BATCH_TO_ACTION',
        'history/CANCEL_ACTION'
    ]),
    groupBy: (action: AnyAction) => {
        // Grouper les actions par leur ID si disponible
        return action.payload?.actionId;
    },
    neverSkipReducer: true, // Toujours exécuter le reducer même pour les actions filtrées
    initTypes: ['@@INIT', '@@redux/INIT', '@@redux-undo/INIT'],
    clearHistoryType: ['@@redux-undo/CLEAR_HISTORY'],
    debug: false,
    ignoreInitialState: false
};

// Configuration spéciale pour les reducers de sélection
export const createSelectionUndoableConfig = (stateKey: string): Partial<UndoableOptions> => ({
    filter: (action: any) => {
        if (!action.payload) {
            return false;
        }

        const keys = action.payload.modifiedKeys;
        if (!keys) {
            return false;
        }

        return keys.indexOf(stateKey) !== -1;
    },
});

export const createUndoableReducer = <S>(
    reducer: Reducer<S>,
    config: Partial<UndoableOptions> = {},
): Reducer<UndoableState<S>> => {
    return undoable(reducer, {
        ...baseUndoableConfig,
        ...config,
    });
};

// Nouvel utilitaire pour créer un slice avec support d'historique
export const createUndoableSlice = <S>(
    name: string,
    initialState: S,
    reducers: any,
    config: Partial<UndoableOptions> = {},
) => {
    const slice = createSlice({
        name,
        initialState,
        reducers,
    });

    return {
        ...slice,
        reducer: createUndoableReducer(slice.reducer, config),
    };
};

// Type helper pour les états avec historique
export type UndoableState<T> = StateWithHistory<T>; 
