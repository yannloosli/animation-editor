import { ActionCreators } from 'redux-undo';
import { addListener } from '~/listener/addListener';
import { isKeyDown } from '~/listener/keyboard';
import { store } from './store-init';
import { UndoableAction } from './store-types';

// Actions pour undo/redo
export const undoAction = () => {
  const state = store.getState();
  
  // On vérifie si on peut faire un undo sur l'état principal (flowState)
  if (state.flowState.past && state.flowState.past.length > 0) {
    store.dispatch(ActionCreators.undo() as UndoableAction);
  }
};

export const redoAction = () => {
  const state = store.getState();
  
  // On vérifie si on peut faire un redo sur l'état principal (flowState)
  if (state.flowState.future && state.flowState.future.length > 0) {
    store.dispatch(ActionCreators.redo() as UndoableAction);
  }
};

// Fonction pour initialiser les raccourcis clavier
export const initUndoRedoKeyboardShortcuts = () => {
  // Ctrl/Cmd + Z pour Undo
  addListener.keyboardOnce('Z', 'keydown', (e: KeyboardEvent) => {
    if (isKeyDown(e, ['Control', 'Meta']) && !e.shiftKey) {
      e.preventDefault();
      undoAction();
    }
  });

  // Ctrl/Cmd + Shift + Z pour Redo
  addListener.keyboardOnce('Z', 'keydown', (e: KeyboardEvent) => {
    if (isKeyDown(e, ['Control', 'Meta']) && e.shiftKey) {
      e.preventDefault();
      redoAction();
    }
  });
}; 
