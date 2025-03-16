import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import undoable from 'redux-undo';
import { v4 as uuidv4 } from 'uuid';

// Types pour les compositions
export interface Composition {
    id: string;
    name: string;
    layers: string[];
    width: number;
    height: number;
    length: number;
    frameIndex: number;
}

export interface Layer {
    id: string;
    name: string;
    properties: string[];
    parentId?: string;
    children: string[];
}

export interface Property {
    id: string;
    name: string;
    value: any;
    keyframes: Record<number, any>;
}

// Interface pour l'état des compositions
export interface CompositionState {
    compositions: Record<string, Composition>;
    layers: Record<string, Layer>;
    properties: Record<string, Property>;
    compositionLayerIdToComposition: Record<string, string>;
}

// État initial
const initialState: CompositionState = {
    compositions: {
        "default": {
            id: "default",
            name: "Default Composition",
            layers: [],
            width: 800,
            height: 600,
            length: 100,
            frameIndex: 0
        }
    },
    layers: {},
    properties: {},
    compositionLayerIdToComposition: {}
};

// Création du slice avec Redux Toolkit
const compositionSlice = createSlice({
    name: 'composition',
    initialState,
    reducers: {
        // Action pour ajouter une composition
        addComposition: (state, action: PayloadAction<Omit<Composition, 'id'>>) => {
            const id = uuidv4();
            state.compositions[id] = {
                ...action.payload,
                id
            };
        },

        // Action pour supprimer une composition
        removeComposition: (state, action: PayloadAction<string>) => {
            const compositionId = action.payload;
            delete state.compositions[compositionId];

            // Supprimer les layers associés
            Object.keys(state.layers).forEach(layerId => {
                if (state.compositionLayerIdToComposition[layerId] === compositionId) {
                    delete state.layers[layerId];
                    delete state.compositionLayerIdToComposition[layerId];
                }
            });
        },

        // Action pour mettre à jour une composition
        updateComposition: (state, action: PayloadAction<{ id: string, changes: Partial<Composition> }>) => {
            const { id, changes } = action.payload;
            if (state.compositions[id]) {
                state.compositions[id] = {
                    ...state.compositions[id],
                    ...changes
                };
            }
        },

        // Action pour ajouter un layer
        addLayer: (state, action: PayloadAction<{ compositionId: string, layer: Omit<Layer, 'id'> }>) => {
            const { compositionId, layer } = action.payload;
            const id = uuidv4();

            state.layers[id] = {
                ...layer,
                id
            };

            state.compositionLayerIdToComposition[id] = compositionId;
            state.compositions[compositionId].layers.push(id);

            // Si le layer a un parent, l'ajouter aux enfants du parent
            if (layer.parentId && state.layers[layer.parentId]) {
                state.layers[layer.parentId].children.push(id);
            }
        },

        // Action pour supprimer un layer
        removeLayer: (state, action: PayloadAction<string>) => {
            const layerId = action.payload;
            const compositionId = state.compositionLayerIdToComposition[layerId];

            if (compositionId && state.compositions[compositionId]) {
                // Retirer le layer de la composition
                state.compositions[compositionId].layers = state.compositions[compositionId].layers.filter(
                    id => id !== layerId
                );

                // Retirer le layer des enfants de son parent
                const parentId = state.layers[layerId]?.parentId;
                if (parentId && state.layers[parentId]) {
                    state.layers[parentId].children = state.layers[parentId].children.filter(
                        id => id !== layerId
                    );
                }

                // Supprimer les propriétés associées
                state.layers[layerId]?.properties.forEach(propertyId => {
                    delete state.properties[propertyId];
                });

                // Supprimer le layer et son association
                delete state.layers[layerId];
                delete state.compositionLayerIdToComposition[layerId];
            }
        }
    }
});

// Configuration pour redux-undo
const undoableConfig = {
    limit: 50, // Limite de l'historique
    filter: (action: any) => {
        // Filtrer les actions qui ne doivent pas être enregistrées dans l'historique
        return true; // Par défaut, toutes les actions sont enregistrées
    },
    groupBy: (action: any) => {
        // Grouper les actions par leur ID si disponible
        return action.payload?.actionId;
    },
    neverSkipReducer: true, // Toujours exécuter le reducer même pour les actions filtrées
};

// Export des actions
export const {
    addComposition,
    removeComposition,
    updateComposition,
    addLayer,
    removeLayer
} = compositionSlice.actions;

// Export de l'état initial
export { initialState };

// Export du reducer avec support d'historique
export default undoable(compositionSlice.reducer, undoableConfig); 
