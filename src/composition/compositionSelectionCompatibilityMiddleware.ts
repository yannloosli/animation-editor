import { Middleware } from "redux";
import { compositionSelectionSlice } from "./compositionSelectionSlice";

export const compositionSelectionCompatibilityMiddleware: Middleware = (store) => (next) => (action) => {
    // Conversion des anciennes actions en nouvelles actions RTK
    if (action.type === "comp/TOGGLE_LAYER_SELECTED") {
        return next(compositionSelectionSlice.actions.toggleLayerSelection({
            compositionId: action.payload.compositionId,
            layerId: action.payload.layerId
        }));
    }

    if (action.type === "comp/REMOVE_LAYERS") {
        return next(compositionSelectionSlice.actions.removeLayersFromSelection({
            compositionId: action.payload.compositionId,
            layerIds: action.payload.layerIds
        }));
    }

    if (action.type === "comp/REMOVE_PROPERTIES") {
        return next(compositionSelectionSlice.actions.removePropertiesFromSelection({
            compositionId: action.payload.compositionId,
            propertyIds: action.payload.propertyIds
        }));
    }

    if (action.type === "comp/TOGGLE_PROPERTY_SELECTED") {
        return next(compositionSelectionSlice.actions.togglePropertySelection({
            compositionId: action.payload.compositionId,
            propertyId: action.payload.propertyId
        }));
    }

    if (action.type === "comp/CLEAR_COMP_SELECTION") {
        return next(compositionSelectionSlice.actions.clearCompositionSelection({
            compositionId: action.payload.compositionId
        }));
    }

    if (action.type === "comp/ADD_PROP_TO_SELECTION") {
        return next(compositionSelectionSlice.actions.addPropertyToSelection({
            compositionId: action.payload.compositionId,
            propertyId: action.payload.propertyId
        }));
    }

    if (action.type === "comp/ADD_LAYER_TO_SELECTION") {
        return next(compositionSelectionSlice.actions.addLayerToSelection({
            compositionId: action.payload.compositionId,
            layerId: action.payload.layerId
        }));
    }

    return next(action);
}; 
