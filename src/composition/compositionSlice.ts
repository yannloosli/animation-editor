import { PayloadAction } from "@reduxjs/toolkit";
import { createUndoableSlice } from "~/state/undoConfig";
import { LayerType, PropertyGroupName, RGBAColor, RGBColor, TransformBehavior } from "~/types";
import { Vec2 } from "~/util/math/vec2";
import { CompositionSelectionState } from "./compositionSelectionSlice";
import {
    Composition,
    CompoundProperty,
    Layer,
    Property,
    PropertyGroup
} from "./compositionTypes";
import { layerFactory } from "./factories/layerFactory";
import { modifierPropertyGroupFactory } from "./factories/modifierPropertyGroupFactory";
import { getLayerModifierPropertyGroupId } from "./util/compositionPropertyUtils";

export interface CompositionState {
    compositions: {
        [id: string]: {
            id: string;
            name: string;
            layers: string[];
            width: number;
            height: number;
            length: number;
            frameIndex: number;
        };
    };
    layers: {
        [id: string]: Layer;
    };
    properties: {
        [id: string]: Property | CompoundProperty | PropertyGroup;
    };
    compositionLayerIdToComposition: {
        [layerId: string]: string;
    };
}

export const initialState: CompositionState = {
    compositions: {},
    layers: {},
    properties: {},
    compositionLayerIdToComposition: {},
};

export { initialState as initialCompositionState };

interface CreateLayerOptions {
    compositionLayerReferenceId: string;
    insertLayerIndex: number;
}

const reducers = {
    setEllipseRadius: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
            radius: number;
        }>
    ) => {
        const { layerId, radius } = action.payload;
        if (state.layers[layerId]?.ellipse) {
            state.layers[layerId].ellipse!.radius = radius;
        }
    },

    setEllipseCenter: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
            center: Vec2;
        }>
    ) => {
        const { layerId, center } = action.payload;
        if (state.layers[layerId]?.ellipse) {
            state.layers[layerId].ellipse!.center = center;
        }
    },

    applyLayerIndexShift: (
        state: CompositionState,
        action: PayloadAction<{
            compositionId: string;
            layerIndexShift: number;
            selectionState: CompositionSelectionState;
        }>
    ) => {
        const { compositionId, layerIndexShift, selectionState } = action.payload;
        const layerIds = state.compositions[compositionId].layers;
        const selection = selectionState[compositionId] || { layers: {}, properties: {} };

        for (const layerId of layerIds) {
            if (!selection.layers[layerId]) {
                continue;
            }

            const layer = state.layers[layerId];
            state.layers[layerId] = {
                ...layer,
                index: Math.max(0, layer.index + layerIndexShift),
            };
        }
    },

    setLayerIndex: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
            index: number;
        }>
    ) => {
        const { layerId, index } = action.payload;
        if (state.layers[layerId]) {
            state.layers[layerId].index = index;
        }
    },

    setComposition: (
        state: CompositionState,
        action: PayloadAction<{
            composition: Composition;
        }>
    ) => {
        const { composition } = action.payload;
        if (!composition) {
            console.warn('No composition provided');
            return;
        }
        state.compositions[composition.id] = composition;
    },

    setCompositionName: (
        state: CompositionState,
        action: PayloadAction<{
            compositionId: string;
            name: string;
        }>
    ) => {
        const { compositionId, name } = action.payload;
        if (state.compositions[compositionId]) {
            state.compositions[compositionId].name = name;
        }
    },

    setCompositionDimension: (
        state: CompositionState,
        action: PayloadAction<{
            compositionId: string;
            which: "width" | "height";
            value: number;
        }>
    ) => {
        const { compositionId, which, value } = action.payload;
        if (state.compositions[compositionId]) {
            state.compositions[compositionId][which] = value;
        }
    },

    setCompositionLength: (
        state: CompositionState,
        action: PayloadAction<{
            compositionId: string;
            value: number;
        }>
    ) => {
        const { compositionId, value } = action.payload;
        if (state.compositions[compositionId]) {
            state.compositions[compositionId].length = value;
        }
    },

    removeComposition: (
        state: CompositionState,
        action: PayloadAction<{
            compositionId: string;
        }>
    ) => {
        const { compositionId } = action.payload;
        const composition = state.compositions[compositionId];
        if (!composition) return;

        // Trouver tous les CompositionLayers qui référencent la composition à supprimer
        const compLayerLayerIds = Object.entries(state.compositionLayerIdToComposition)
            .filter(([_, refCompId]) => refCompId === compositionId)
            .map(([layerId]) => layerId);

        // Tous les layers dans la composition à supprimer et tous les composition layers qui
        // référencent la composition à supprimer
        const layerIds = [...composition.layers, ...compLayerLayerIds];

        // Supprimer la composition
        delete state.compositions[compositionId];

        // Supprimer les layers
        layerIds.forEach(layerId => {
            delete state.layers[layerId];
            delete state.compositionLayerIdToComposition[layerId];
        });

        // Supprimer les propriétés associées
        Object.keys(state.properties).forEach(propertyId => {
            const property = state.properties[propertyId];
            if (layerIds.includes(property.layerId)) {
                delete state.properties[propertyId];
            }
        });

        // Mettre à jour les compositions qui référencent les layers supprimés
        Object.values(state.compositions).forEach(comp => {
            comp.layers = comp.layers.filter(id => !layerIds.includes(id));
        });
    },

    setFrameIndex: (
        state: CompositionState,
        action: PayloadAction<{
            compositionId: string;
            frameIndex: number;
        }>
    ) => {
        const { compositionId, frameIndex } = action.payload;
        if (state.compositions[compositionId]) {
            state.compositions[compositionId].frameIndex = frameIndex;
        }
    },

    setPropertyValue: (
        state: CompositionState,
        action: PayloadAction<{
            propertyId: string;
            value: number | RGBColor | RGBAColor | TransformBehavior;
        }>
    ) => {
        const { propertyId, value } = action.payload;
        const property = state.properties[propertyId];
        if (property && property.type === "property") {
            property.value = value;
        }
    },

    setPropertyValueAtTime: (
        state: CompositionState,
        action: PayloadAction<{
            propertyId: string;
            value: number | RGBColor | RGBAColor | TransformBehavior;
            time: number;
        }>
    ) => {
        const { propertyId, value, time } = action.payload;
        const property = state.properties[propertyId];
        if (property && property.type === "property") {
            property.value = value;
        }
    },

    setPropertyGroupCollapsed: (
        state: CompositionState,
        action: PayloadAction<{
            propertyId: string;
            collapsed: boolean;
        }>
    ) => {
        const { propertyId, collapsed } = action.payload;
        const property = state.properties[propertyId];
        if (property && property.type === "group") {
            property.collapsed = collapsed;
            property.viewProperties = [];
        }
    },

    setPropertyTimelineId: (
        state: CompositionState,
        action: PayloadAction<{
            propertyId: string;
            timelineId: string;
        }>
    ) => {
        const { propertyId, timelineId } = action.payload;
        const property = state.properties[propertyId];
        if (property && property.type === "property") {
            property.timelineId = timelineId;
        }
    },

    removeProperty: (
        state: CompositionState,
        action: PayloadAction<{
            propertyId: string;
        }>
    ) => {
        const { propertyId } = action.payload;
        delete state.properties[propertyId];
    },

    removePropertyFromGroup: (
        state: CompositionState,
        action: PayloadAction<{
            groupId: string;
            propertyId: string;
        }>
    ) => {
        const { groupId, propertyId } = action.payload;
        const group = state.properties[groupId];
        if (group && group.type === "group") {
            group.properties = group.properties.filter(id => id !== propertyId);
        }
    },

    setPropertyMaintainProportions: (
        state: CompositionState,
        action: PayloadAction<{
            propertyId: string;
            maintainProportions: boolean;
        }>
    ) => {
        const { propertyId, maintainProportions } = action.payload;
        const property = state.properties[propertyId];
        if (property && "maintainProportions" in property) {
            property.maintainProportions = maintainProportions;
        }
    },

    setPropertyGroupViewProperties: (
        state: CompositionState,
        action: PayloadAction<{
            groupId: string;
            propertyIds: string[];
        }>
    ) => {
        const { groupId, propertyIds } = action.payload;
        const group = state.properties[groupId];
        if (group && group.type === "group") {
            group.viewProperties = propertyIds;
        }
    },

    setCompoundPropertySeparated: (
        state: CompositionState,
        action: PayloadAction<{
            propertyId: string;
            separated: boolean;
        }>
    ) => {
        const { propertyId, separated } = action.payload;
        const property = state.properties[propertyId];
        if (property && property.type === "compound") {
            property.separated = separated;
        }
    },

    createLayer: (
        state: CompositionState,
        action: PayloadAction<{
            compositionId: string;
            type: LayerType;
            options?: Partial<CreateLayerOptions>;
        }>
    ) => {
        const { compositionId, type, options } = action.payload;
        const composition = state.compositions[compositionId];
        if (!composition) return;

        const { layer, propertiesToAdd } = layerFactory({
            compositionId,
            type,
            compositionState: state,
            ...(type === LayerType.Composition && options?.compositionLayerReferenceId
                ? { defaultName: state.compositions[options.compositionLayerReferenceId].name }
                : {}),
        });

        // Ajouter le layer à la composition
        const layers = [...composition.layers];
        layers.splice(options?.insertLayerIndex ?? 0, 0, layer.id);
        state.compositions[composition.id].layers = layers;

        // Ajouter le layer et ses propriétés
        state.layers[layer.id] = layer;
        propertiesToAdd.forEach(prop => {
            state.properties[prop.id] = prop;
        });

        // Gérer la référence de composition si nécessaire
        if (type === LayerType.Composition && options?.compositionLayerReferenceId) {
            state.compositionLayerIdToComposition[layer.id] = options.compositionLayerReferenceId;
        }
    },

    removeLayer: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
        }>
    ) => {
        const { layerId } = action.payload;
        const layer = state.layers[layerId];
        if (!layer) return;

        // Supprimer le layer de sa composition
        const comp = state.compositions[layer.compositionId];
        if (comp) {
            comp.layers = comp.layers.filter(id => id !== layerId);
        }

        // Supprimer les propriétés du layer
        layer.properties.forEach(propertyId => {
            delete state.properties[propertyId];
        });

        // Supprimer le layer
        delete state.layers[layerId];
        delete state.compositionLayerIdToComposition[layerId];
    },

    setLayerName: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
            name: string;
        }>
    ) => {
        const { layerId, name } = action.payload;
        if (state.layers[layerId]) {
            state.layers[layerId].name = name;
        }
    },

    moveLayers: (
        state: CompositionState,
        action: PayloadAction<{
            compositionId: string;
            moveInfo: { layerId: string; type: "above" | "below" };
            selectionState: CompositionSelectionState;
        }>
    ) => {
        const { compositionId, moveInfo, selectionState } = action.payload;
        const composition = state.compositions[compositionId];
        if (!composition) return;

        const selection = selectionState[compositionId] || { layers: {}, properties: {} };
        const selectedLayers = composition.layers.filter(id => selection.layers[id]);

        // Retirer les layers sélectionnés
        composition.layers = composition.layers.filter(id => !selection.layers[id]);

        // Trouver l'index d'insertion
        const targetIndex = composition.layers.indexOf(moveInfo.layerId);
        const insertIndex = moveInfo.type === "above" ? targetIndex : targetIndex + 1;

        // Insérer les layers sélectionnés à la nouvelle position
        composition.layers.splice(insertIndex, 0, ...selectedLayers);
    },

    setLayerPlaybackIndex: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
            index: number;
        }>
    ) => {
        const { layerId, index } = action.payload;
        if (state.layers[layerId]) {
            state.layers[layerId].playbackStartsAtIndex = index;
        }
    },

    setLayerIndexAndLength: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
            index: number;
            length: number;
        }>
    ) => {
        const { layerId, index, length } = action.payload;
        if (state.layers[layerId]) {
            state.layers[layerId].index = index;
            state.layers[layerId].length = length;
        }
    },

    setLayerCollapsed: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
            collapsed: boolean;
        }>
    ) => {
        const { layerId, collapsed } = action.payload;
        const layer = state.layers[layerId];
        if (!layer) return;

        // Mettre à jour le layer
        layer.collapsed = collapsed;
        layer.viewProperties = [];

        // Si on déploie le layer, pas besoin de nettoyer les groupes
        if (!collapsed) return;

        // Sinon, on nettoie les viewProperties de tous les groupes de propriétés
        layer.properties.forEach(propertyId => {
            const property = state.properties[propertyId];
            if (property && property.type === "group" && property.viewProperties.length > 0) {
                property.viewProperties = [];
                property.collapsed = true;
            }
        });
    },

    setLayerViewProperties: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
            propertyIds: string[];
        }>
    ) => {
        const { layerId, propertyIds } = action.payload;
        if (state.layers[layerId]) {
            state.layers[layerId].viewProperties = propertyIds;
        }
    },

    clearViewProperties: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
        }>
    ) => {
        const { layerId } = action.payload;
        if (state.layers[layerId]) {
            state.layers[layerId].viewProperties = [];
        }
    },

    setLayerParentLayerId: (state: CompositionState, action: PayloadAction<{ layerId: string, parentLayerId: string }>) => {
        const { layerId, parentLayerId } = action.payload;
        const layer = state.layers[layerId];
        if (layer) {
            layer.parentLayerId = parentLayerId;
        }
    },

    addModifierToLayer: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
            propertyId: string;
            propertiesToAdd: Array<Property | CompoundProperty | PropertyGroup>;
        }>
    ) => {
        const { layerId, propertyId, propertiesToAdd } = action.payload;
        const layer = state.layers[layerId];
        if (!layer) return;

        // Ajouter les nouvelles propriétés
        propertiesToAdd.forEach(prop => {
            state.properties[prop.id] = prop;
        });

        // Trouver ou créer le groupe de modificateurs
        const properties = layer.properties.map(id => state.properties[id]);
        const propertyNames = properties.map(p => p.type === "group" ? p.name : null);
        let groupIndex = propertyNames.indexOf(PropertyGroupName.Modifiers);

        if (groupIndex === -1) {
            // Créer un nouveau groupe de modificateurs
            const { group, properties: groupProperties } = modifierPropertyGroupFactory({
                compositionId: layer.compositionId,
                layerId,
                createId: () => crypto.randomUUID(),
            });

            // Ajouter le groupe et ses propriétés
            state.properties[group.id] = group;
            groupProperties.forEach(prop => {
                state.properties[prop.id] = prop;
            });

            // Ajouter le groupe au début des propriétés du layer
            layer.properties.unshift(group.id);
            groupIndex = 0;
        }

        // Ajouter la propriété au groupe de modificateurs
        const modifierGroup = state.properties[layer.properties[groupIndex]] as PropertyGroup;
        modifierGroup.properties.push(propertyId);
    },

    moveModifier: (
        state: CompositionState,
        action: PayloadAction<{
            modifierId: string;
            moveBy: -1 | 1;
        }>
    ) => {
        const { modifierId, moveBy } = action.payload;
        const modifier = state.properties[modifierId];
        if (!modifier) return;

        const layer = state.layers[modifier.layerId];
        if (!layer) return;

        // Trouver le groupe de modificateurs
        const modifierGroupId = getLayerModifierPropertyGroupId(layer.id, state);
        if (!modifierGroupId) return;

        const modifierGroup = state.properties[modifierGroupId] as PropertyGroup;
        const currentIndex = modifierGroup.properties.indexOf(modifierId);
        if (currentIndex === -1) return;

        const newIndex = currentIndex + moveBy;
        if (newIndex < 0 || newIndex >= modifierGroup.properties.length) return;

        // Échanger les positions
        const temp = modifierGroup.properties[currentIndex];
        modifierGroup.properties[currentIndex] = modifierGroup.properties[newIndex];
        modifierGroup.properties[newIndex] = temp;
    },

    setLayerGraphId: (
        state: CompositionState,
        action: PayloadAction<{
            layerId: string;
            graphId: string;
        }>
    ) => {
        const { layerId, graphId } = action.payload;
        const layer = state.layers[layerId];
        if (layer) {
            layer.graphId = graphId;
        }
    },

    setPropertyGraphId: (
        state: CompositionState,
        action: PayloadAction<{
            propertyId: string;
            graphId: string;
        }>
    ) => {
        const { propertyId, graphId } = action.payload;
        const property = state.properties[propertyId];
        if (property && property.type === "group") {
            property.graphId = graphId;
        }
    },
};

export const compositionSlice = createUndoableSlice(
    'composition',
    initialState,
    reducers
);

export const {
    setEllipseRadius,
    setEllipseCenter,
    applyLayerIndexShift,
    setLayerIndex,
    setComposition,
    setCompositionName,
    setCompositionDimension,
    setCompositionLength,
    removeComposition,
    setFrameIndex,
    setPropertyValue,
    setPropertyGroupCollapsed,
    setPropertyTimelineId,
    removeProperty,
    removePropertyFromGroup,
    setPropertyMaintainProportions,
    setPropertyGroupViewProperties,
    setCompoundPropertySeparated,
    createLayer,
    removeLayer,
    setLayerName,
    moveLayers,
    setPropertyValueAtTime,
    setLayerPlaybackIndex,
    setLayerIndexAndLength,
    setLayerCollapsed,
    setLayerViewProperties,
    clearViewProperties,
    setLayerParentLayerId,
    addModifierToLayer,
    moveModifier,
    setLayerGraphId,
    setPropertyGraphId
} = compositionSlice.actions;

export const compositionReducer = compositionSlice.reducer; 
