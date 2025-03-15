import {
    removeLayersFromSelection,
    removePropertiesFromSelection
} from "~/composition/compositionSelectionSlice";
import { addModifierToLayer, createLayer, removeLayer, setCompoundPropertySeparated } from "~/composition/compositionSlice";
import { CompoundProperty } from "~/composition/compositionTypes";
import { reduceLayerPropertiesAndGroups } from "~/composition/compositionUtils";
import { arrayModifierPropertiesFactory } from "~/composition/factories/arrayModifierPropertiesFactory";
import { getLayerTypeName } from "~/composition/layer/layerUtils";
import { closeContextMenu, ContextMenuActionOption, ContextMenuListOption, ContextMenuOption, openContextMenu, SerializableContextMenuOption, SerializablePosition } from "~/contextMenu/contextMenuSlice";
import { FlowNodeState } from "~/flow/flowNodeState";
import { FlowNodeType } from "~/flow/flowTypes";
import {
    removeGraph,
    removeReferencesToNodeInGraph,
    setNodeOutputs,
    updateNodeState
} from "~/flow/state/flowSlice";
import { layerOperations } from "~/layer/layerOperations";
import { requestAction } from "~/listener/requestAction";
import { clearShapeSelection } from "~/shape/shapeSelectionSlice";
import { shapeActions } from "~/shape/shapeSlice";
import { getShapeLayerPathIds } from "~/shape/shapeUtils";
import { createOperation } from "~/state/operation";
import { getActionState } from "~/state/stateUtils";
import { clearTimelineSelection } from "~/timeline/timelineSelectionSlice";
import { removeTimeline } from "~/timeline/timelineSlice";
import { LayerType, PropertyGroupName } from "~/types";
import { createGenMapIdFn, createMapNumberId } from "~/util/mapUtils";
import { Vec2 } from "~/util/math/vec2";

interface Options {
    compositionId: string;
    layerId?: string;
    propertyId?: string;
}

export const createTimelineContextMenu = (
    position: Vec2,
    { compositionId, layerId, propertyId }: Options,
): void => {
    requestAction({ history: true }, (params) => {
        const options: ContextMenuOption[] = [];

        if (!layerId && !propertyId) {
            const createAddLayerFn = (type: LayerType) => () => {
                const { compositionState } = getActionState();
                const expectedLayerId = createMapNumberId(compositionState.layers);
                params.dispatch(createLayer({ compositionId, type }));
                params.dispatch(closeContextMenu());
                params.addDiff((diff) => diff.addLayer(expectedLayerId));
                params.submitAction(`Add ${getLayerTypeName(type)}`);
            };

            const layerOptions: ContextMenuActionOption[] = [LayerType.Rect, LayerType.Ellipse, LayerType.Shape, LayerType.Line].map(
                (type) => ({
                    label: getLayerTypeName(type),
                    onSelect: createAddLayerFn(type),
                }),
            );

            const newLayerOption: ContextMenuListOption = {
                label: "New layer",
                options: layerOptions,
            };

            options.push(newLayerOption);
        }

        // Add modifier
        if (layerId) {
            options.push({
                label: "Add modifier",
                options: [
                    {
                        label: "Array",
                        onSelect: () => {
                            const { compositionState } = getActionState();

                            const { propertyId, propertiesToAdd } = arrayModifierPropertiesFactory({
                                compositionId,
                                layerId,
                                createId: createGenMapIdFn(compositionState.properties),
                            });

                            params.dispatch(
                                addModifierToLayer({
                                    layerId,
                                    propertyId,
                                    propertiesToAdd,
                                }),
                            );
                            params.dispatch(closeContextMenu());
                            params.addDiff((diff) => diff.propertyStructure(layerId));
                            params.submitAction("Add array modifier to layer");
                        },
                    },
                ],
            });
        }

        if (propertyId) {
            const { compositionState } = getActionState();

            let compoundProperty: CompoundProperty | null = null;

            const property = compositionState.properties[propertyId];

            if (property.name === PropertyGroupName.ArrayModifier) {
                options.push({
                    label: "Remove Array Modifier",
                    onSelect: () => {
                        const op = createOperation(params);
                        layerOperations.removeArrayModifier(op, propertyId);
                        op.submit();
                        params.dispatch(closeContextMenu());
                        params.submitAction("Remove array modifier");
                    },
                });
            }

            if (property.type === "compound") {
                compoundProperty = property;
            } else if (property.type === "property") {
                if (property.compoundPropertyId) {
                    compoundProperty = compositionState.properties[
                        property.compoundPropertyId
                    ] as CompoundProperty;
                }
            }

            if (compoundProperty) {
                const separated = !compoundProperty.separated;
                const label = compoundProperty.separated
                    ? "Join dimensions"
                    : "Separate dimensions";

                options.push({
                    label,
                    onSelect: () => {
                        params.dispatch(
                            setCompoundPropertySeparated({
                                propertyId: compoundProperty!.id,
                                separated,
                            }),
                        );
                        params.dispatch(closeContextMenu());
                        params.submitAction("Toggle separate dimensions");
                    },
                });
            }
        }

        // Remove layer
        if (layerId) {
            const removeLayerLocal = () => {
                const op = createOperation(params);

                const { compositionState, flowState, shapeState } = op.state;
                const layer = compositionState.layers[layerId];

                op.add(
                    removeLayer({ layerId: layer.id }),
                    closeContextMenu(),
                );

                // Clear layer selection and property selection
                const propertyIds = reduceLayerPropertiesAndGroups<string[]>(
                    layerId,
                    compositionState,
                    (acc, property) => {
                        acc.push(property.id);
                        return acc;
                    },
                    [],
                );
                op.add(
                    removeLayersFromSelection(compositionId, [layerId]),
                    removePropertiesFromSelection(compositionId, propertyIds)
                );

                // Remove all timelines referenced by properties of the deleted layer.
                //
                // In the future, timelines may be referenced in more ways than just by animated
                // properties. When that is the case we will have to check for other references to
                // the timelines we're deleting.
                const timelineIdsToRemove: string[] = [];

                function crawl(propertyId: string) {
                    const property = compositionState.properties[propertyId];

                    if (property.type === "group" || property.type === "compound") {
                        property.properties.forEach(crawl);
                        return;
                    }

                    if (property.timelineId) {
                        timelineIdsToRemove.push(property.timelineId);
                    }
                }
                layer.properties.forEach(crawl);

                timelineIdsToRemove.forEach((id) => {
                    op.add(
                        removeTimeline({ timelineId: id }),
                        clearTimelineSelection({ timelineId: id })
                    );
                });

                // Remove layer graph if it exists
                if (layer.graphId) {
                    op.add(removeGraph({ graphId: layer.graphId }));
                }

                // Remove references to layer in layer graphs in this composition
                const composition = compositionState.compositions[layer.compositionId];
                for (let i = 0; i < composition.layers.length; i += 1) {
                    const layerId = composition.layers[i];

                    if (layer.id === layerId) {
                        continue;
                    }

                    const graphId = compositionState.layers[layerId].graphId;
                    if (!graphId) {
                        continue;
                    }

                    const graph = flowState.graphs[graphId];
                    const nodeIds = graph.nodes;
                    for (let j = 0; j < nodeIds.length; j += 1) {
                        const node = flowState.nodes[nodeIds[j]];

                        if (node.type !== FlowNodeType.property_input) {
                            continue;
                        }

                        const state = node.state as FlowNodeState<FlowNodeType.property_input>;

                        if (state.layerId !== layer.id) {
                            continue;
                        }

                        // Node references layer.
                        //
                        // Reset node state/outputs and remove all references to it.
                        const removeNodeAction = removeReferencesToNodeInGraph({ nodeId: node.id });
                        const setOutputsAction = setNodeOutputs({ nodeId: node.id, outputs: [] });
                        const updateStateAction = updateNodeState({
                            graphId: graph.id,
                            nodeId: node.id,
                            state: { layerId: "", propertyId: "" }
                        });

                        op.add(removeNodeAction);
                        op.add(setOutputsAction);
                        op.add(updateStateAction);

                        // Remove timelines referenced by properties of the deleted layer
                        const timelineIdsToRemove: string[] = [];
                        layer.properties.forEach(propertyId => {
                            const property = compositionState.properties[propertyId];
                            if (property.type === "property" && property.timelineId) {
                                timelineIdsToRemove.push(property.timelineId);
                            }
                        });

                        timelineIdsToRemove.forEach(timelineId => {
                            op.add(
                                removeTimeline({ timelineId }),
                                clearTimelineSelection({ timelineId })
                            );
                        });
                    }
                }

                // If shape layer, remove all shapes and paths referenced by layer
                if (layer.type === LayerType.Shape) {
                    const pathIds = getShapeLayerPathIds(layerId, compositionState);
                    for (const pathId of pathIds) {
                        const shapeId = shapeState.paths[pathId].shapeId;
                        if (shapeId) {
                            op.add(shapeActions.removePath({ pathId }));
                            op.add(shapeActions.removeShape({ shapeId }));
                            op.add(clearShapeSelection({ shapeId }));
                        }
                    }
                }

                op.addDiff((diff) => diff.removeLayer(layerId));
                op.submit();
                params.submitAction("Delete layer");
            };

            options.push({
                label: "Delete layer",
                onSelect: removeLayerLocal,
            });
        }

        const serializableOptions: SerializableContextMenuOption[] = serializeOptions(options);

        params.dispatch(openContextMenu({
            name: "timeline",
            options: serializableOptions,
            position: { x: position.x, y: position.y } as SerializablePosition,
        }));
    });
};

const serializeOptions = (options: ContextMenuOption[]): SerializableContextMenuOption[] => {
    return options.map((option) => {
        if ("options" in option) {
            return {
                id: option.label,
                label: option.label,
                icon: option.icon,
                options: serializeOptions(option.options)
            };
        }
        return {
            id: option.label,
            label: option.label,
            icon: option.icon
        };
    });
};
