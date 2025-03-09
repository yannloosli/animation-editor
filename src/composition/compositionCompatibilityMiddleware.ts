import { Middleware } from "redux";
import { Vec2 } from "~/util/math/vec2";
import { compositionSlice } from "./compositionSlice";

export const compositionCompatibilityMiddleware: Middleware = (store) => (next) => (action) => {
    // Conversion des anciennes actions en nouvelles actions RTK
    if (action.type === "comp/SET_ELLIPSE_RADIUS") {
        return next(compositionSlice.actions.setEllipseRadius({
            layerId: action.payload.layerId,
            radius: action.payload.radius
        }));
    }

    if (action.type === "comp/SET_ELLIPSE_CENTER") {
        return next(compositionSlice.actions.setEllipseCenter({
            layerId: action.payload.layerId,
            center: action.payload.center as Vec2
        }));
    }

    if (action.type === "comp/APPLY_LAYER_INDEX_SHIFT") {
        return next(compositionSlice.actions.applyLayerIndexShift({
            compositionId: action.payload.compositionId,
            layerIndexShift: action.payload.layerIndexShift,
            selectionState: action.payload.selectionState
        }));
    }

    if (action.type === "comp/SET_LAYER_INDEX") {
        return next(compositionSlice.actions.setLayerIndex({
            layerId: action.payload.layerId,
            index: action.payload.index
        }));
    }

    if (action.type === "comp/SET_COMPOSITION") {
        return next(compositionSlice.actions.setComposition({
            composition: action.payload.composition
        }));
    }

    if (action.type === "comp/SET_COMP_NAME") {
        return next(compositionSlice.actions.setCompositionName({
            compositionId: action.payload.compositionId,
            name: action.payload.name
        }));
    }

    if (action.type === "comp/SET_COMPOSITION_DIMENSIONS") {
        return next(compositionSlice.actions.setCompositionDimension({
            compositionId: action.payload.compositionId,
            which: action.payload.which,
            value: action.payload.value
        }));
    }

    if (action.type === "comp/SET_COMPOSITION_LENGTH") {
        return next(compositionSlice.actions.setCompositionLength({
            compositionId: action.payload.compositionId,
            value: action.payload.value
        }));
    }

    if (action.type === "comp/REMOVE_COMPOSITION") {
        return next(compositionSlice.actions.removeComposition({
            compositionId: action.payload.compositionId
        }));
    }

    if (action.type === "comp/SET_FRAME_INDEX") {
        return next(compositionSlice.actions.setFrameIndex({
            compositionId: action.payload.compositionId,
            frameIndex: action.payload.frameIndex
        }));
    }

    if (action.type === "comp/SET_PROPERTY_VALUE") {
        return next(compositionSlice.actions.setPropertyValue({
            propertyId: action.payload.propertyId,
            value: action.payload.value
        }));
    }

    if (action.type === "comp/SET_PROP_GROUP_COLLAPSED") {
        return next(compositionSlice.actions.setPropertyGroupCollapsed({
            propertyId: action.payload.propertyId,
            collapsed: action.payload.collapsed
        }));
    }

    if (action.type === "comp/SET_PROPERTY_TIMELINE_ID") {
        return next(compositionSlice.actions.setPropertyTimelineId({
            propertyId: action.payload.propertyId,
            timelineId: action.payload.timelineId
        }));
    }

    if (action.type === "comp/REMOVE_PROPERTY") {
        return next(compositionSlice.actions.removeProperty({
            propertyId: action.payload.propertyId
        }));
    }

    if (action.type === "comp/REMOVE_PROPERTY_FROM_GROUP") {
        return next(compositionSlice.actions.removePropertyFromGroup({
            groupId: action.payload.groupId,
            propertyId: action.payload.propertyId
        }));
    }

    if (action.type === "comp/SET_PROP_MAINTAIN_PROPORTIONS") {
        return next(compositionSlice.actions.setPropertyMaintainProportions({
            propertyId: action.payload.propertyId,
            maintainProportions: action.payload.maintainProportions
        }));
    }

    if (action.type === "comp/SET_GROUP_VIEW_PROPERTIES") {
        return next(compositionSlice.actions.setPropertyGroupViewProperties({
            groupId: action.payload.groupId,
            propertyIds: action.payload.propertyIds
        }));
    }

    if (action.type === "comp/SET_COMPOUND_SEPARATED") {
        return next(compositionSlice.actions.setCompoundPropertySeparated({
            propertyId: action.payload.propertyId,
            separated: action.payload.separated
        }));
    }

    if (action.type === "comp/CREATE_LAYER") {
        return next(compositionSlice.actions.createLayer({
            compositionId: action.payload.compositionId,
            type: action.payload.type,
            options: action.payload.options
        }));
    }

    if (action.type === "comp/DELETE_LAYER") {
        return next(compositionSlice.actions.removeLayer({
            layerId: action.payload.layerId
        }));
    }

    if (action.type === "comp/SET_LAYER_NAME") {
        return next(compositionSlice.actions.setLayerName({
            layerId: action.payload.layerId,
            name: action.payload.name
        }));
    }

    if (action.type === "comp/SET_LAYER_COLLAPSED") {
        return next(compositionSlice.actions.setLayerCollapsed({
            layerId: action.payload.layerId,
            collapsed: action.payload.collapsed
        }));
    }

    if (action.type === "comp/SET_LAYER_GRAPH_ID") {
        return next(compositionSlice.actions.setLayerGraphId({
            layerId: action.payload.layerId,
            graphId: action.payload.graphId
        }));
    }

    if (action.type === "comp/SET_LAYER_PARENT_LAYER_ID") {
        return next(compositionSlice.actions.setLayerParentLayerId({
            layerId: action.payload.layerId,
            parentLayerId: action.payload.parentLayerId
        }));
    }

    if (action.type === "comp/SET_LAYER_VIEW_PROPERTIES") {
        return next(compositionSlice.actions.setLayerViewProperties({
            layerId: action.payload.layerId,
            propertyIds: action.payload.propertyIds
        }));
    }

    if (action.type === "comp/CLEAR_VIEW_PROPERTIES") {
        return next(compositionSlice.actions.clearViewProperties({
            layerId: action.payload.layerId
        }));
    }

    if (action.type === "comp/ADD_MODIFIER_TO_LAYER") {
        return next(compositionSlice.actions.addModifierToLayer({
            layerId: action.payload.layerId,
            propertyId: action.payload.propertyId,
            propertiesToAdd: action.payload.propertiesToAdd
        }));
    }

    if (action.type === "comp/MOVE_MODIFIER") {
        return next(compositionSlice.actions.moveModifier({
            modifierId: action.payload.modifierId,
            moveBy: action.payload.moveBy
        }));
    }

    if (action.type === "comp/ADD_PROPERTY_TO_PROPERTY_GROUP") {
        return next(compositionSlice.actions.addPropertyToPropertyGroup({
            addToPropertyGroup: action.payload.addToPropertyGroup,
            propertyId: action.payload.propertyId,
            propertiesToAdd: action.payload.propertiesToAdd
        }));
    }

    return next(action);
}; 
