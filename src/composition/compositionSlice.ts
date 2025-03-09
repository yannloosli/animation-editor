import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { LayerType, PropertyGroupName, RGBAColor, RGBColor, TransformBehavior } from "~/types";
import { createGenMapIdFn } from "~/util/mapUtils";
import { Vec2 } from "~/util/math/vec2";
import { CompositionSelectionState } from "./compositionSelectionReducer";
import {
    Composition,
    CompoundProperty,
    Layer,
    Property,
    PropertyGroup
} from "./compositionTypes";
import { layerFactory } from "./factories/layerFactory";
import { modifierPropertyGroupFactory } from "./factories/modifierPropertyGroupFactory";

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

export const initialCompositionState: CompositionState = {
    compositions: {},
    layers: {},
    properties: {},
    compositionLayerIdToComposition: {},
};

interface CreateLayerOptions {
    compositionLayerReferenceId: string;
    insertLayerIndex: number;
}

export const compositionSlice = createSlice({
    name: "composition",
    initialState: initialCompositionState,
    reducers: {
        setEllipseRadius: (
            state,
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
            state,
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
            state,
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
            state,
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
            state,
            action: PayloadAction<{
                composition: Composition;
            }>
        ) => {
            const { composition } = action.payload;
            state.compositions[composition.id] = composition;
        },

        setCompositionName: (
            state,
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
            state,
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
            state,
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
            state,
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
            state,
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
            state,
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
            state,
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
            state,
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
            state,
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
            state,
            action: PayloadAction<{
                propertyId: string;
            }>
        ) => {
            const { propertyId } = action.payload;
            delete state.properties[propertyId];
        },

        removePropertyFromGroup: (
            state,
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
            state,
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
            state,
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
            state,
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

        createLayer: {
            reducer: (
                state,
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
            prepare: (payload: {
                compositionId: string;
                type: LayerType;
                options?: Partial<CreateLayerOptions>;
            }) => ({ payload })
        },

        removeLayer: (
            state,
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
            state,
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

        setLayerCollapsed: (
            state,
            action: PayloadAction<{
                layerId: string;
                collapsed: boolean;
            }>
        ) => {
            const { layerId, collapsed } = action.payload;
            const layer = state.layers[layerId];
            if (!layer) return;

            layer.collapsed = collapsed;
            layer.viewProperties = [];

            // Réinitialiser les propriétés de vue des groupes
            layer.properties.forEach(propertyId => {
                const property = state.properties[propertyId];
                if (property?.type === "group" && property.viewProperties.length) {
                    property.viewProperties = [];
                    property.collapsed = true;
                }
            });
        },

        setLayerGraphId: (
            state,
            action: PayloadAction<{
                layerId: string;
                graphId: string;
            }>
        ) => {
            const { layerId, graphId } = action.payload;
            if (state.layers[layerId]) {
                state.layers[layerId].graphId = graphId;
            }
        },

        setLayerParentLayerId: (
            state,
            action: PayloadAction<{
                layerId: string;
                parentLayerId: string;
            }>
        ) => {
            const { layerId, parentLayerId } = action.payload;
            if (state.layers[layerId]) {
                state.layers[layerId].parentLayerId = parentLayerId;
            }
        },

        setLayerViewProperties: (
            state,
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
            state,
            action: PayloadAction<{
                layerId: string;
            }>
        ) => {
            const { layerId } = action.payload;
            const layer = state.layers[layerId];
            if (!layer) return;

            // Réinitialiser les propriétés de vue du layer
            layer.viewProperties = [];
            layer.collapsed = true;

            // Réinitialiser les propriétés de vue des groupes
            layer.properties.forEach(propertyId => {
                const property = state.properties[propertyId];
                if (property?.type === "group" && property.viewProperties.length) {
                    property.viewProperties = [];
                    property.collapsed = true;
                }
            });
        },

        addModifierToLayer: (
            state,
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

            // Trouver ou créer le groupe de modifiers
            const properties = layer.properties.map(
                propertyId => state.properties[propertyId]
            );
            const propertyNames = properties.map(p => (p.type === "group" ? p.name : null));
            let groupIndex = propertyNames.indexOf(PropertyGroupName.Modifiers);

            if (groupIndex === -1) {
                const createId = createGenMapIdFn(state.properties);
                const { group, properties } = modifierPropertyGroupFactory({
                    compositionId: layer.compositionId,
                    layerId,
                    createId,
                });
                
                // Ajouter le groupe et ses propriétés
                state.properties[group.id] = group;
                properties.forEach(prop => {
                    state.properties[prop.id] = prop;
                });
                
                // Ajouter le groupe au layer
                layer.properties = [group.id, ...layer.properties];
                groupIndex = 0;
            }

            // Ajouter le modifier au groupe
            const modifierGroup = state.properties[layer.properties[groupIndex]] as PropertyGroup;
            modifierGroup.properties = [...modifierGroup.properties, propertyId];
        },

        moveModifier: (
            state,
            action: PayloadAction<{
                modifierId: string;
                moveBy: -1 | 1;
            }>
        ) => {
            const { modifierId, moveBy } = action.payload;
            const modifier = state.properties[modifierId];
            if (!modifier) return;

            // Trouver le groupe de modifiers
            const layer = state.layers[modifier.layerId];
            if (!layer) return;

            const modifierGroupId = layer.properties.find(propId => {
                const prop = state.properties[propId];
                return prop.type === "group" && prop.name === PropertyGroupName.Modifiers;
            });

            if (!modifierGroupId) return;

            const modifierGroup = state.properties[modifierGroupId] as PropertyGroup;
            const index = modifierGroup.properties.indexOf(modifierId);
            if (index === -1) return;

            // Déplacer le modifier
            const properties = [...modifierGroup.properties];
            properties.splice(index, 1);
            properties.splice(index + moveBy, 0, modifierId);
            modifierGroup.properties = properties;
        },

        addPropertyToPropertyGroup: (
            state,
            action: PayloadAction<{
                addToPropertyGroup: string;
                propertyId: string;
                propertiesToAdd: Array<Property | CompoundProperty | PropertyGroup>;
            }>
        ) => {
            const { addToPropertyGroup, propertyId, propertiesToAdd } = action.payload;
            
            // Ajouter les nouvelles propriétés
            propertiesToAdd.forEach(prop => {
                state.properties[prop.id] = prop;
            });

            // Ajouter la propriété au groupe
            const group = state.properties[addToPropertyGroup];
            if (group && group.type === "group") {
                group.properties = [...group.properties, propertyId];
            }
        },

        setPropertyGraphId: (
            state,
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

        moveLayers: (
            state,
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
            state,
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
            state,
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
        }
    }
});

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
    setLayerCollapsed,
    setLayerGraphId,
    setLayerParentLayerId,
    setLayerViewProperties,
    clearViewProperties,
    addModifierToLayer,
    moveModifier,
    addPropertyToPropertyGroup,
    setPropertyGraphId,
    moveLayers,
    setPropertyValueAtTime,
    setLayerPlaybackIndex,
    setLayerIndexAndLength
} = compositionSlice.actions;

export const compositionReducer = compositionSlice.reducer;
export default compositionSlice.reducer; 
