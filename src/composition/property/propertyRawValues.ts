import { Property } from "~/composition/compositionTypes";
import { forEachLayerProperty } from "~/composition/compositionUtils";
import { PropertyStore } from "~/composition/manager/property/propertyStore";
import { getTimelineValueAtIndex } from "~/timeline/timelineUtils";

export const computeValueByPropertyIdForComposition = (
    actionState: ActionState,
    compositionId: string,
): Record<string, any> => {
    const rawValues: Record<string, any> = {};

    const { compositionState, timelineState, timelineSelectionState } = actionState;
    const composition = compositionState.compositions[compositionId];

    if (!composition) {
        console.warn(`No composition found with id ${compositionId}`);
        return rawValues;
    }

    for (const layerId of composition.layers) {
        const layer = compositionState.layers[layerId];
        if (!layer) {
            console.warn(`No layer found with id ${layerId}`);
            continue;
        }

        forEachLayerProperty(layer.id, actionState.compositionState, (property) => {
            const propertyComposition = compositionState.compositions[property.compositionId];
            if (!propertyComposition) {
                console.warn(`No composition found for property ${property.id}`);
                return;
            }

            const value = property.timelineId
                ? getTimelineValueAtIndex({
                    timeline: timelineState[property.timelineId],
                    selection: timelineSelectionState[property.timelineId],
                    frameIndex: propertyComposition.frameIndex,
                    layerIndex: layer.index,
                })
                : property.value;
            rawValues[property.id] = value;
        });
    }

    return rawValues;
};

export const updateRawValuesForPropertyIds = (
    actionState: ActionState,
    propertyIds: string[],
    propertyStore: PropertyStore,
    frameIndex?: number,
): void => {
    const { compositionState, timelineState, timelineSelectionState } = actionState;

    for (const propertyId of propertyIds) {
        const property = compositionState.properties[propertyId] as Property;
        if (!property) {
            console.warn(`No property found with id ${propertyId}`);
            continue;
        }

        const layer = compositionState.layers[property.layerId];
        if (!layer) {
            console.warn(`No layer found with id ${property.layerId}`);
            continue;
        }

        const composition = compositionState.compositions[layer.compositionId];
        if (!composition) {
            console.warn(`No composition found with id ${layer.compositionId}`);
            continue;
        }

        const value = property.timelineId
            ? getTimelineValueAtIndex({
                timeline: timelineState[property.timelineId],
                selection: timelineSelectionState[property.timelineId],
                frameIndex: frameIndex ?? composition.frameIndex,
                layerIndex: layer.index,
            })
            : property.value;
        propertyStore.setRawPropertyValue(property.id, value);
    }
};
