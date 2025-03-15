import { Middleware } from 'redux';
import { ApplicationState } from '~/state/store-types';
import { CompositionSelectionState } from '../compositionSelectionSlice';
import { compSelectionFromState } from '../util/compSelectionUtils';

/**
 * Middleware pour gérer les actions complexes des compositions
 */
export const compositionMiddleware: Middleware<{}, ApplicationState> = store => next => action => {
    // Exécuter l'action normalement
    const result = next(action);

    // Traiter les actions spécifiques après leur exécution
    if (action.type === 'composition/applyLayerIndexShift') {
        const { compositionId, layerIndexShift, selectionState } = action.payload;
        const state = store.getState();

        // Logique pour appliquer le décalage d'index aux calques sélectionnés
        const selection = compSelectionFromState(compositionId, selectionState as CompositionSelectionState);

        // Appliquer le décalage d'index aux calques sélectionnés
        // Cette logique dépend de la structure exacte de votre état
    }
    else if (action.type === 'composition/moveLayers') {
        const { compositionId, moveInfo, selectionState } = action.payload;
        const state = store.getState();

        // Logique pour déplacer les calques sélectionnés
        const selection = compSelectionFromState(compositionId, selectionState as CompositionSelectionState);

        // Déplacer les calques sélectionnés
        // Cette logique dépend de la structure exacte de votre état
    }
    else if (action.type === 'composition/setFrameIndex') {
        // Logique pour mettre à jour l'affichage après le changement d'index de frame
        // Cette logique peut être utilisée pour synchroniser d'autres parties de l'application
        // lorsque l'index de frame change
    }

    return result;
};

/**
 * Enregistre le middleware composition dans le store
 */
export const registerCompositionMiddleware = (middlewares: Middleware[]) => {
    middlewares.push(compositionMiddleware);
    return middlewares;
}; 
