import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CompositionSelection } from "~/composition/compositionTypes";
import { removeKeysFromMap } from "~/util/mapUtils";

export interface CompositionSelectionState {
    [compositionId: string]: CompositionSelection;
}

export const initialCompositionSelectionState: CompositionSelectionState = {};

const createNewCompSelection = (): CompositionSelection => ({
    layers: {},
    properties: {},
});

export const compositionSelectionSlice = createSlice({
    name: "compositionSelection",
    initialState: initialCompositionSelectionState,
    reducers: {
        toggleLayerSelection: {
            reducer: (state, action: PayloadAction<{ compositionId: string; layerId: string }>) => {
                const { compositionId, layerId } = action.payload;
                const selection = state[compositionId] || createNewCompSelection();

                if (!selection.layers[layerId]) {
                    if (!state[compositionId]) {
                        state[compositionId] = createNewCompSelection();
                    }
                    state[compositionId].layers[layerId] = true;
                } else {
                    delete state[compositionId].layers[layerId];
                }
            },
            prepare: (compositionId: string, layerId: string) => ({
                payload: { compositionId, layerId }
            })
        },
        removeLayersFromSelection: {
            reducer: (state, action: PayloadAction<{ compositionId: string; layerIds: string[] }>) => {
                const { compositionId, layerIds } = action.payload;
                if (!state[compositionId]) return;

                state[compositionId].layers = removeKeysFromMap(state[compositionId].layers, layerIds);
            },
            prepare: (compositionId: string, layerIds: string[]) => ({
                payload: { compositionId, layerIds }
            })
        },
        removePropertiesFromSelection: {
            reducer: (state, action: PayloadAction<{ compositionId: string; propertyIds: string[] }>) => {
                const { compositionId, propertyIds } = action.payload;
                if (!state[compositionId]) return;

                state[compositionId].properties = removeKeysFromMap(state[compositionId].properties, propertyIds);
            },
            prepare: (compositionId: string, propertyIds: string[]) => ({
                payload: { compositionId, propertyIds }
            })
        },
        togglePropertySelection: {
            reducer: (state, action: PayloadAction<{ compositionId: string; propertyId: string }>) => {
                const { compositionId, propertyId } = action.payload;
                const selection = state[compositionId] || createNewCompSelection();

                if (!selection.properties[propertyId]) {
                    if (!state[compositionId]) {
                        state[compositionId] = createNewCompSelection();
                    }
                    state[compositionId].properties[propertyId] = true;
                } else {
                    delete state[compositionId].properties[propertyId];
                }
            },
            prepare: (compositionId: string, propertyId: string) => ({
                payload: { compositionId, propertyId }
            })
        },
        clearCompositionSelection: {
            reducer: (state, action: PayloadAction<{ compositionId: string }>) => {
                const { compositionId } = action.payload;


                if (state[compositionId]) {
                    state[compositionId] = createNewCompSelection();
                }
            },
            prepare: (compositionId: string) => ({
                payload: { compositionId }
            })
        },
        addPropertyToSelection: {
            reducer: (state, action: PayloadAction<{ compositionId: string; propertyId: string }>) => {
                const { compositionId, propertyId } = action.payload;

                if (!state[compositionId]) {
                    state[compositionId] = createNewCompSelection();
                }
                state[compositionId].properties[propertyId] = true;
            },
            prepare: (compositionId: string, propertyId: string) => ({
                payload: { compositionId, propertyId }
            })
        },
        addLayerToSelection: {
            reducer: (state, action: PayloadAction<{ compositionId: string; layerId: string }>) => {
                const { compositionId, layerId } = action.payload;

                if (!state[compositionId]) {
                    state[compositionId] = createNewCompSelection();
                }
                state[compositionId].layers[layerId] = true;
            },
            prepare: (compositionId: string, layerId: string) => ({
                payload: { compositionId, layerId }
            })
        }
    }
});

export const {
    toggleLayerSelection,
    removeLayersFromSelection,
    removePropertiesFromSelection,
    togglePropertySelection,
    clearCompositionSelection,
    addPropertyToSelection,
    addLayerToSelection
} = compositionSelectionSlice.actions;

export const compositionSelectionReducer = compositionSelectionSlice.reducer; 
