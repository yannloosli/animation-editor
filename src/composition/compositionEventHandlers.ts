import { store } from '~/state/store-init';
import { LayerType } from '~/types';

/**
 * Gestionnaire d'événement pour la création d'une composition
 */
export const handleCreateComposition = (
    name: string,
    width: number,
    height: number,
    length: number
) => {
    // Cette fonction devrait être implémentée en fonction de la logique de création de composition
    // dans votre application
};

/**
 * Gestionnaire d'événement pour la suppression d'une composition
 */
export const handleDeleteComposition = (
    compositionId: string
) => {
    // Cette fonction devrait être implémentée en fonction de la logique de suppression de composition
    // dans votre application
};

/**
 * Gestionnaire d'événement pour la création d'un calque
 */
export const handleCreateLayer = (
    compositionId: string,
    type: LayerType,
    options?: any
) => {
    store.dispatch({
        type: 'composition/createLayer',
        payload: {
            compositionId,
            type,
            options
        }
    });
};

/**
 * Gestionnaire d'événement pour la suppression d'un calque
 */
export const handleDeleteLayer = (
    layerId: string
) => {
    store.dispatch({
        type: 'composition/removeLayer',
        payload: {
            layerId
        }
    });
};

/**
 * Gestionnaire d'événement pour le renommage d'un calque
 */
export const handleRenameLayer = (
    layerId: string,
    name: string
) => {
    store.dispatch({
        type: 'composition/setLayerName',
        payload: {
            layerId,
            name
        }
    });
};

/**
 * Gestionnaire d'événement pour le renommage d'une composition
 */
export const handleRenameComposition = (
    compositionId: string,
    name: string
) => {
    store.dispatch({
        type: 'composition/setCompositionName',
        payload: {
            compositionId,
            name
        }
    });
};

/**
 * Gestionnaire d'événement pour le changement de dimensions d'une composition
 */
export const handleSetCompositionDimension = (
    compositionId: string,
    which: "width" | "height",
    value: number
) => {
    store.dispatch({
        type: 'composition/setCompositionDimension',
        payload: {
            compositionId,
            which,
            value
        }
    });
};

/**
 * Gestionnaire d'événement pour le changement de longueur d'une composition
 */
export const handleSetCompositionLength = (
    compositionId: string,
    value: number
) => {
    store.dispatch({
        type: 'composition/setCompositionLength',
        payload: {
            compositionId,
            value
        }
    });
};

/**
 * Gestionnaire d'événement pour le changement d'index de frame d'une composition
 */
export const handleSetFrameIndex = (
    compositionId: string,
    frameIndex: number
) => {
    store.dispatch({
        type: 'composition/setFrameIndex',
        payload: {
            compositionId,
            frameIndex
        }
    });
}; 
