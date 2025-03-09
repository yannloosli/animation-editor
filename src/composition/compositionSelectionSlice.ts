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
        toggleLayerSelection: (
            state,
            action: PayloadAction<{
                compositionId: string;
                layerId: string;
            }>
        ) => {
            const { compositionId, layerId } = action.payload;
            const selection = state[compositionId] || createNewCompSelection();

            if (selection.layers[layerId]) {
                selection.layers = removeKeysFromMap(selection.layers, [layerId]);
            } else {
                selection.layers = {
                    ...selection.layers,
                    [layerId]: true,
                };
            }

            state[compositionId] = selection;
        },

        removeLayersFromSelection: (
            state,
            action: PayloadAction<{
                compositionId: string;
                layerIds: string[];
            }>
        ) => {
            const { compositionId, layerIds } = action.payload;
            const selection = state[compositionId] || createNewCompSelection();

            selection.layers = removeKeysFromMap(selection.layers, layerIds);
            state[compositionId] = selection;
        },

        removePropertiesFromSelection: (
            state,
            action: PayloadAction<{
                compositionId: string;
                propertyIds: string[];
            }>
        ) => {
            const { compositionId, propertyIds } = action.payload;
            const selection = state[compositionId] || createNewCompSelection();

            selection.properties = removeKeysFromMap(selection.properties, propertyIds);
            state[compositionId] = selection;
        },

        togglePropertySelection: (
            state,
            action: PayloadAction<{
                compositionId: string;
                propertyId: string;
            }>
        ) => {
            const { compositionId, propertyId } = action.payload;
            const selection = state[compositionId] || createNewCompSelection();

            if (selection.properties[propertyId]) {
                selection.properties = removeKeysFromMap(selection.properties, [propertyId]);
            } else {
                selection.properties = {
                    ...selection.properties,
                    [propertyId]: true,
                };
            }

            state[compositionId] = selection;
        },

        clearCompositionSelection: (
            state,
            action: PayloadAction<{
                compositionId: string;
            }>
        ) => {
            const { compositionId } = action.payload;
            state[compositionId] = createNewCompSelection();
        },

        addPropertyToSelection: (
            state,
            action: PayloadAction<{
                compositionId: string;
                propertyId: string;
            }>
        ) => {
            const { compositionId, propertyId } = action.payload;
            const selection = state[compositionId] || createNewCompSelection();

            selection.properties = {
                ...selection.properties,
                [propertyId]: true,
            };

            state[compositionId] = selection;
        },

        addLayerToSelection: (
            state,
            action: PayloadAction<{
                compositionId: string;
                layerId: string;
            }>
        ) => {
            const { compositionId, layerId } = action.payload;
            const selection = state[compositionId] || createNewCompSelection();

            selection.layers = {
                ...selection.layers,
                [layerId]: true,
            };

            state[compositionId] = selection;
        },
    },
});

export const {
    toggleLayerSelection,
    removeLayersFromSelection,
    removePropertiesFromSelection,
    togglePropertySelection,
    clearCompositionSelection,
    addPropertyToSelection,
    addLayerToSelection,
} = compositionSelectionSlice.actions;

export const compositionSelectionReducer = compositionSelectionSlice.reducer; 
