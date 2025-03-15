import {
    addLayerToSelection,
    clearCompositionSelection,
    removeLayersFromSelection,
    removePropertiesFromSelection
} from "~/composition/compositionSelectionSlice";
import {
    reduceLayerPropertiesAndGroups
} from "~/composition/compositionUtils";
import { compSelectionFromState } from "~/composition/util/compSelectionUtils";
import { getActionState } from "~/state/stateUtils";
import { clearTimelineSelection } from "~/timeline/timelineSelectionSlice";
import { Operation } from "~/types";

export const moveToolUtil = {
    addLayerToSelection: (op: Operation, layerId: string) => {
        const { compositionState } = getActionState();
        const layer = compositionState.layers[layerId];
        op.add(addLayerToSelection(layer.compositionId, layerId));
    },

    removeLayerFromSelection: (op: Operation, layerId: string) => {
        const { compositionState } = getActionState();
        const layer = compositionState.layers[layerId];
        op.add(removeLayersFromSelection(layer.compositionId, [layerId]));
    },

    clearCompositionSelection: (op: Operation, compositionId: string) => {
        // Clear composition selection
        op.add(clearCompositionSelection(compositionId));

        // Clear timeline selection
        op.add(clearTimelineSelection({ timelineId: compositionId }));
    },

    deselectLayerProperties: (op: Operation, layerId: string) => {
        const { compositionState, compositionSelectionState } = getActionState();
        const { compositionId } = compositionState.layers[layerId];
        const compositionSelection = compSelectionFromState(
            compositionId,
            compositionSelectionState,
        );

        // Deselect all properties and timeline keyframes
        const propertyIds = reduceLayerPropertiesAndGroups<string[]>(
            layerId,
            compositionState,
            (acc, property) => {
                acc.push(property.id);
                return acc;
            },
            [],
        ).filter((propertyId) => compositionSelection.properties[propertyId]);

        const timelineIds = propertyIds.reduce<string[]>((acc, propertyId) => {
            const property = compositionState.properties[propertyId];

            if (property.type === "property" && property.timelineId) {
                acc.push(property.timelineId);
            }

            return acc;
        }, []);

        op.add(
            removePropertiesFromSelection(compositionId, propertyIds),
            ...timelineIds.map((timelineId) => clearTimelineSelection({ timelineId })),
        );
    },
};
