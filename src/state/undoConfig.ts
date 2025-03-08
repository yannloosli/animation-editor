import { AnyAction } from 'redux';
import undoable, { StateWithHistory, excludeAction } from 'redux-undo';

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
export const createSelectionUndoableConfig = (selectionForKey: string) => ({
  ...baseUndoableConfig,
  filter: (action: AnyAction, currentState: any, previousHistory: any) => {
    // Filtrer les actions de sélection spécifiques
    if (action.payload?.modifiedKeys?.includes(selectionForKey)) {
      return true;
    }
    if (typeof baseUndoableConfig.filter === 'function') {
      return baseUndoableConfig.filter(action, currentState, previousHistory);
    }
    return true;
  },
});

export const createUndoableReducer = (reducer: any, options: any = {}) => {
  const config = {
    ...baseUndoableConfig,
    ...options,
  };

  return undoable(reducer, config);
};

// Type helper pour les états avec historique
export type UndoableState<T> = StateWithHistory<T>; 
