import { areaInitialStates } from "~/area/state/areaInitialStates";
import { dispatchToAreaState } from "~/area/state/areaSlice";
import { dragOpenArea } from "~/area/util/dragOpenArea";
import * as selectionActions from "~/composition/compositionSelectionSlice";
import {
    moveLayers,
    moveModifier,
    setFrameIndex,
    setLayerCollapsed,
    setLayerGraphId,
    setLayerParentLayerId,
    setPropertyGraphId,
    setPropertyMaintainProportions,
    setPropertyTimelineId,
    setPropertyValue
} from "~/composition/compositionSlice";
import { CompoundProperty, Layer, Property } from "~/composition/compositionTypes";
import {
    getTimelineIdsReferencedByComposition,
    reduceLayerPropertiesAndGroups,
} from "~/composition/compositionUtils";
import {
    compSelectionFromState,
    didCompSelectionChange,
} from "~/composition/util/compSelectionUtils";
import {
    AreaType,
    TIMELINE_BETWEEN_LAYERS,
    TIMELINE_LAYER_HEIGHT
} from "~/constants";
import { FlowGraph, FlowNode, FlowNodeType } from "~/flow/flowTypes";
import { createArrayModifierFlowGraph, createLayerFlowGraph } from "~/flow/graph/createFlowGraph";
import {
    setGraph,
    setNode,
    updateNodeState,
} from "~/flow/state/flowSlice";
import { isKeyDown } from "~/listener/keyboard";
import {
    requestAction,
    RequestActionParams,
    ShouldAddToStackFn
} from "~/listener/requestAction";
import { createOperation } from "~/state/operation";
import { getActionState, getAreaActionState } from "~/state/stateUtils";
import { timelineOperations } from "~/timeline/operations/timelineOperations";
import { setFields, setPanY, setViewBounds } from "~/timeline/timelineAreaSlice";
import { createTimelineContextMenu } from "~/timeline/timelineContextMenu";
import {
    addKeyframesToSelection,
    clearTimelineSelection
} from "~/timeline/timelineSelectionSlice";
import {
    removeTimeline,
    setTimeline
} from "~/timeline/timelineSlice";
import {
    createTimelineForLayerProperty,
    getTimelineValueAtIndex,
    graphEditorGlobalToNormal,
} from "~/timeline/timelineUtils";
import {
    getTimelineTrackYPositions
} from "~/trackEditor/trackEditorUtils";
import { PropertyGroupName } from "~/types";
import { Area } from "~/types/areaTypes";
import { mouseDownMoveAction } from "~/util/action/mouseDownMoveAction";
import { animate } from "~/util/animation/animate";
import { capToRange, interpolate } from "~/util/math";
import { Vec2 } from "~/util/math/vec2";
import { parseWheelEvent } from "~/util/wheelEvent";

const ZOOM_FAC = 0.4;

interface TimelineActionParams extends RequestActionParams {
    compositionId: string;
    layerId: string;
    type?: "above" | "below";
}

const handleLayerMove = (params: TimelineActionParams) => {
    const { compositionId, layerId, type } = params;
    const action = selectionActions.addLayerToSelection({
        compositionId,
        layerId
    });
    params.dispatch(action);

    if (type) {
        const moveAction = moveLayers({
            compositionId,
            moveInfo: {
                layerId,
                type
            },
            selectionState: getActionState().compositionSelectionState
        });
        params.dispatch(moveAction);
    }
};

const handleLayerSelect = (params: TimelineActionParams) => {
    const { compositionId, layerId } = params;
    const action = selectionActions.addLayerToSelection({
        compositionId,
        layerId
    });
    params.dispatch(action);
};

const handleLayerDeselect = (params: TimelineActionParams) => {
    const { compositionId, layerId } = params;
    const action = selectionActions.removeLayersFromSelection({
        compositionId,
        layerIds: [layerId]
    });
    params.dispatch(action);
};

const clearCompositionSelection = (params: TimelineActionParams) => {
    const { compositionId } = params;
    const { compositionState } = getActionState();

    const action = selectionActions.clearCompositionSelection({
        compositionId
    });
    params.dispatch(action);

    const timelineIds = getTimelineIdsReferencedByComposition(
        compositionId,
        compositionState,
    );
    const clearActions = timelineIds.map(timelineId => clearTimelineSelection({ timelineId }));
    params.dispatch(clearActions);
};

const deselectLayerProperties = (params: TimelineActionParams) => {
    const { compositionId, layerId } = params;
    const { compositionState, compositionSelectionState } = getActionState();
    const compositionSelection = compSelectionFromState(compositionId, compositionSelectionState);

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

    const action = selectionActions.removePropertiesFromSelection({
        compositionId,
        propertyIds
    });
    params.dispatch(action);

    const timelineActions = timelineIds.map((timelineId) => clearTimelineSelection({ timelineId }));
    params.dispatch(timelineActions);
};

export const timelineHandlers = {
    onScrubMouseDown: (
        e: React.MouseEvent,
        options: {
            compositionId: string;
            viewBounds: [number, number];
            viewport: Rect;
            compositionLength: number;
        },
    ): void => {
        const { compositionId } = options;

        const composition = getActionState().compositionState.compositions[compositionId];
        const initialPosition = Vec2.fromEvent(e.nativeEvent);

        let frameIndex = composition.frameIndex;

        requestAction({ history: true }, (params) => {
            const onMove = (e?: MouseEvent | KeyboardEvent) => {
                if (!e || !(e instanceof MouseEvent)) return;
                const pos = Vec2.fromEvent(e);
                const x = graphEditorGlobalToNormal(pos.x, options);
                frameIndex = capToRange(0, composition.length - 1, Math.round(x));
                params.dispatch(setFrameIndex({
                    compositionId: composition.id,
                    frameIndex
                }));
                params.performDiff((diff) => diff.frameIndex(compositionId, frameIndex));
            };
            params.addListener.repeated("mousemove", onMove);
            onMove();

            params.addListener.once("mouseup", () => {
                params.addDiff((diff) => diff.frameIndex(compositionId, frameIndex));
                params.submitAction("Move scrubber");
            });
        });
    },

    onZoomClick: (
        e: React.MouseEvent,
        areaId: string,
        options: {
            viewBounds: [number, number];
            width: number;
            x: number;
        },
    ): void => {
        const { viewBounds, width, x } = options;

        const mousePos = Vec2.fromEvent(e.nativeEvent).subX(x);
        const t = mousePos.x / width;

        let newBounds: [number, number];

        if (isKeyDown("Alt")) {
            const add = Math.abs(viewBounds[0] - viewBounds[1]) * ZOOM_FAC;
            newBounds = [
                capToRange(0, 1, viewBounds[0] - add * t),
                capToRange(0, 1, viewBounds[1] + add * (1 - t)),
            ];
        } else {
            const remove = Math.abs(viewBounds[0] - viewBounds[1]) * ZOOM_FAC;
            newBounds = [viewBounds[0] + remove * t, viewBounds[1] - remove * (1 - t)];
        }

        requestAction({ history: false }, ({ dispatch, submitAction }) => {
            animate({ duration: 0 }, (t) => {
                dispatch(
                    dispatchToAreaState({
                        areaId,
                        action: setViewBounds([
                            interpolate(viewBounds[0], newBounds[0], t),
                            interpolate(viewBounds[1], newBounds[1], t),
                        ]),
                    }),
                );
            }).then(() => submitAction());
        });
    },

    onWheelPan: (
        e: React.WheelEvent,
        areaId: string,
        options: {
            compositionId: string;
            compositionLength: number;
            viewBounds: [number, number];
            viewport: Rect;
            lockY: boolean;
            panY: number;
        },
    ): void => {
        const { viewBounds, viewport, lockY, panY } = options;

        requestAction({ history: false }, ({ dispatch, submitAction }) => {
            const parsed = parseWheelEvent(e.nativeEvent);

            if (!lockY) {
                const yPan = panY + (parsed.type === "pinch_zoom" ? parsed.delta : parsed.deltaY);
                dispatch(
                    dispatchToAreaState({
                        areaId,
                        action: setPanY(yPan),
                    }),
                );
            }

            if (parsed.type !== "pinch_zoom") {
                const viewBoundsDiff = viewBounds[1] - viewBounds[0];
                const newBounds: [number, number] = [
                    viewBounds[0] + (parsed.deltaX / viewport.width) * viewBoundsDiff,
                    viewBounds[1] + (parsed.deltaX / viewport.width) * viewBoundsDiff,
                ];

                dispatch(
                    dispatchToAreaState({
                        areaId,
                        action: setViewBounds(newBounds),
                    }),
                );
            }

            submitAction();
        });
    },

    onWheelZoom: (
        e: React.WheelEvent,
        areaId: string,
        impact = 1,
        options: { viewBounds: [number, number]; width: number; left: number },
    ): void => {
        const { deltaY } = e;

        const fac = interpolate(1, -deltaY < 0 ? 1.15 : 0.85, capToRange(0, 2, impact));

        const { viewBounds, width, left } = options;

        const mousePos = Vec2.new(e.clientX, e.clientY).subX(left);
        const t = mousePos.x / width;

        if (t < 0) {
            // User is pinch zooming on layer list. We just ignore this.
            return;
        }

        const remove = Math.abs(viewBounds[0] - viewBounds[1]) * (1 - fac);
        let newBounds: [number, number] = [
            viewBounds[0] + remove * t,
            viewBounds[1] - remove * (1 - t),
        ];

        if (newBounds[0] < 0 && newBounds[1] > 1) {
            newBounds = [0, 1];
        } else if (newBounds[0] < 0) {
            newBounds[1] = Math.min(1, newBounds[1] + Math.abs(newBounds[0]));
            newBounds[0] = 0;
        } else if (newBounds[1] > 1) {
            newBounds[0] = Math.max(0, newBounds[0] - (newBounds[1] - 1));
            newBounds[1] = 1;
        }

        requestAction({ history: false }, ({ dispatch, submitAction }) => {
            dispatch(
                dispatchToAreaState({
                    areaId,
                    action: setViewBounds(newBounds),
                }),
            );
            submitAction();
        });
    },

    /**
     * When the user Space + Mouse drags the timeline around
     */
    onPan: (
        e: React.MouseEvent,
        areaId: string,
        options: {
            compositionId: string;
            compositionLength: number;
            viewBounds: [number, number];
            viewport: Rect;
            lockY: boolean;
            panY: number;
        },
    ): void => {
        const { viewBounds, viewport, lockY, panY } = options;
        const initialPosition = Vec2.fromEvent(e.nativeEvent);

        requestAction({ history: false }, ({ dispatch, submitAction, addListener }) => {
            const onMove = (e?: MouseEvent | KeyboardEvent) => {
                if (!e || !(e instanceof MouseEvent)) return;

                const pos = Vec2.fromEvent(e);
                const diff = pos.sub(initialPosition);

                if (!lockY) {
                    const yPan = panY - diff.y;
                    dispatch(
                        dispatchToAreaState({
                            areaId,
                            action: setPanY(yPan),
                        }),
                    );
                }

                const viewBoundsDiff = viewBounds[1] - viewBounds[0];
                const newBounds: [number, number] = [
                    viewBounds[0] - (diff.x / viewport.width) * viewBoundsDiff,
                    viewBounds[1] - (diff.x / viewport.width) * viewBoundsDiff,
                ];

                dispatch(
                    dispatchToAreaState({
                        areaId,
                        action: setViewBounds(newBounds),
                    }),
                );
            };

            addListener.repeated("mousemove", onMove);
            addListener.once("mouseup", () => submitAction());
        });
    },

    onCompoundPropertyKeyframeIconMouseDown: (e: React.MouseEvent, compoundPropertyId: string) => {
        e.stopPropagation();

        const {
            compositionState,
            timelineState,
            timelineSelectionState: timelineSelection,
        } = getActionState();

        const property = compositionState.properties[compoundPropertyId] as CompoundProperty;
        const composition = compositionState.compositions[property.compositionId];
        const layer = compositionState.layers[property.layerId];

        const properties = property.properties.map(
            (id) => compositionState.properties[id],
        ) as Property[];

        let anyHasTimeline = false;

        for (const property of properties) {
            if (property.timelineId) {
                anyHasTimeline = true;
                break;
            }
        }

        requestAction({ history: true }, (params) => {
            const { submitAction } = params;
            const op = createOperation(params);
            op.addDiff((diff) => diff.propertyStructure(layer.id));

            for (const property of properties) {
                if (anyHasTimeline) {
                    if (!property.timelineId) {
                        continue;
                    }

                    const timeline = timelineState[property.timelineId];
                    const value = getTimelineValueAtIndex({
                        timeline,
                        frameIndex: composition.frameIndex,
                        layerIndex: layer.index,
                        selection: timelineSelection[timeline.id],
                    });

                    op.add(
                        removeTimeline({ timelineId: property.timelineId }),
                        setPropertyValue({
                            propertyId: property.id,
                            value
                        }),
                        setPropertyTimelineId({
                            propertyId: property.id,
                            timelineId: ""
                        }),
                    );
                    continue;
                }

                const timeline = createTimelineForLayerProperty(
                    property.value,
                    composition.frameIndex,
                );
                op.add(
                    setTimeline({ timelineId: timeline.id, timeline }),
                    setPropertyTimelineId({
                        propertyId: property.id,
                        timelineId: timeline.id
                    }),
                );
            }

            op.submit();

            if (anyHasTimeline) {
                submitAction("Remove timelines from properties");
            } else {
                submitAction("Add timelines to properties");
            }
        });
    },

    onPropertyKeyframeIconMouseDown: (e: React.MouseEvent, propertyId: string): void => {
        e.stopPropagation();

        const { compositionState } = getActionState();

        const property = compositionState.properties[propertyId] as Property;
        const { timelineId } = property;

        if (timelineId) {
            // Delete timeline and make the value of the timeline at the current time
            // the value of the property

            requestAction({ history: true }, (params) => {
                const op = createOperation(params);
                timelineOperations.removeTimelineFromProperty(op, propertyId);
                op.submit();
                params.addDiff((diff) => diff.propertyStructure(property.layerId));
                params.submitAction("Remove timeline from property");
            });
            return;
        }

        // Create timeline with a single keyframe at the current time
        requestAction({ history: true }, (params) => {
            const op = createOperation(params);
            timelineOperations.addTimelineToProperty(op, propertyId);
            op.submit();
            params.addDiff((diff) => diff.propertyStructure(property.layerId));
            params.submitAction("Add timeline to property");
        });
    },

    onMouseDownOut: (compositionId: string): void => {
        requestAction(
            { history: true, shouldAddToStack: didCompSelectionChange(compositionId) },
            (params) => {
                const { compositionState } = getActionState();

                params.dispatch(selectionActions.clearCompositionSelection({
                    compositionId
                }));

                const timelineIds = getTimelineIdsReferencedByComposition(
                    compositionId,
                    compositionState,
                );
                params.dispatch(
                    timelineIds.map((timelineId) => clearTimelineSelection({ timelineId })),
                );
                params.addDiff((diff) => diff.compositionSelection(compositionId));
                params.submitAction("Clear timeline selection");
            },
        );
    },

    onRightClickOut: (e: React.MouseEvent, compositionId: string): void => {
        const position = Vec2.fromEvent(e.nativeEvent);
        createTimelineContextMenu(position, { compositionId });
    },

    onLayerRightClick: (e: React.MouseEvent, layer: Layer): void => {
        const position = Vec2.fromEvent(e.nativeEvent);
        createTimelineContextMenu(position, {
            compositionId: layer.compositionId,
            layerId: layer.id,
        });
    },

    onLayerNameMouseDown: (
        e: React.MouseEvent,
        areaId: string,
        compositionId: string,
        layerId: string,
        layerWrapper: React.RefObject<HTMLDivElement>,
    ): void => {
        e.stopPropagation();

        const areaState = getAreaActionState<AreaType.Timeline>(areaId);
        const { compositionState, compositionSelectionState } = getActionState();
        const composition = compositionState.compositions[compositionId];
        const compositionSelection = compSelectionFromState(compositionId, compositionSelectionState);
        const willBeSelected = !compositionSelection.layers[layerId];
        const additiveSelection = isKeyDown("Shift") || isKeyDown("Command");

        const rect = layerWrapper.current!.getBoundingClientRect();
        const yPosMap = getTimelineTrackYPositions(compositionId, compositionState, areaState.panY);

        const getInsertBelowLayerIndex = (
            mousePosGlobal: Vec2,
        ): { type: "above" | "below" | "invalid"; layerId: string } | null => {
            const compositionSelection = compSelectionFromState(
                compositionId,
                getActionState().compositionSelectionState,
            );

            const mousePos = mousePosGlobal.sub(Vec2.new(rect.left, rect.top));

            for (let i = 0; i < composition.layers.length; i += 1) {
                const l0y = yPosMap.layer[composition.layers[i]];
                const l1y = yPosMap.layer[composition.layers[i + 1]] ?? Infinity;

                if (mousePos.y < l0y || mousePos.y > l1y + TIMELINE_BETWEEN_LAYERS) {
                    continue;
                }

                const distl0 = mousePos.y - l0y;
                const distl1 = l1y - mousePos.y;

                let j = distl0 < distl1 ? i : i + 1;

                for (; j >= 0; j--) {
                    const layerId = composition.layers[j];
                    const l0y = yPosMap.layer[layerId];
                    const l1y = yPosMap.layer[composition.layers[j + 1]] ?? Infinity;

                    if (l0y < mousePos.y && mousePos.y < l1y + TIMELINE_BETWEEN_LAYERS) {
                        if (compositionSelection.layers[layerId]) {
                            return {
                                layerId,
                                type: "invalid",
                            };
                        }

                        const distl0 = mousePos.y - l0y;
                        const distl1 = yPosMap.layer[composition.layers[j + 1]]
                            ? l1y - mousePos.y
                            : l0y + TIMELINE_LAYER_HEIGHT - mousePos.y;

                        return {
                            layerId,
                            type: distl0 > distl1 ? "below" : "above",
                        };
                    }
                }
            }

            return { layerId: "", type: "below" }; // Insert at 0
        };

        const addLayerToSelection = (params: RequestActionParams) => {
            const action = selectionActions.addLayerToSelection({
                compositionId,
                layerId
            });
            params.dispatch(action);
        };

        const removeLayerFromSelection = (params: RequestActionParams) => {
            const action = selectionActions.removeLayersFromSelection({
                compositionId,
                layerIds: [layerId]
            });
            params.dispatch(action);
        };

        const didLayerOrderChange: ShouldAddToStackFn = (a, b) => {
            const layersA = a.compositionState.compositions[compositionId].layers;
            const layersB = b.compositionState.compositions[compositionId].layers;

            for (let i = 0; i < layersA.length; i += 1) {
                if (layersA[i] !== layersB[i]) {
                    return true;
                }
            }

            return false;
        };

        mouseDownMoveAction(e, {
            keys: [],
            shouldAddToStack: [didCompSelectionChange(compositionId), didLayerOrderChange],
            beforeMove: (params: RequestActionParams) => {
                const timelineParams: TimelineActionParams = {
                    ...params,
                    compositionId,
                    layerId
                };

                if (!additiveSelection && willBeSelected) {
                    clearCompositionSelection(timelineParams);
                    handleLayerSelect(timelineParams);
                    return;
                }

                if (additiveSelection && !willBeSelected) {
                    deselectLayerProperties(timelineParams);
                    handleLayerDeselect(timelineParams);
                }
            },
            mouseMove: (params, { mousePosition }) => {
                if (additiveSelection && !willBeSelected) {
                    return;
                }

                params.dispatchToAreaState(
                    areaId,
                    setFields({
                        moveLayers: getInsertBelowLayerIndex(mousePosition.global),
                    }),
                );
            },
            mouseUp: (params: RequestActionParams) => {
                const timelineParams: TimelineActionParams = {
                    ...params,
                    compositionId,
                    layerId
                };

                if (additiveSelection && !willBeSelected) {
                    params.submitAction("Remove layer from selection");
                    return;
                }

                const moveLayersState = getAreaActionState<AreaType.Timeline>(areaId).moveLayers;

                if (moveLayersState) {
                    params.dispatchToAreaState(
                        areaId,
                        setFields({ moveLayers: null }),
                    );

                    if (moveLayersState.type === "invalid") {
                        params.addDiff((diff) => diff.compositionSelection(compositionId));
                        params.submitAction("Add layer to selection");
                        return;
                    }

                    handleLayerMove({
                        ...timelineParams,
                        layerId: moveLayersState.layerId,
                        type: moveLayersState.type as "above" | "below"
                    });
                    params.submitAction("Move layers", { allowIndexShift: true });
                    return;
                }

                if (!additiveSelection) {
                    clearCompositionSelection(timelineParams);
                }

                handleLayerSelect(timelineParams);
                params.addDiff((diff) => diff.compositionSelection(compositionId));
                params.submitAction("Add layer to selection");
            },
        });
    },

    onPropertyGraphMouseDown: (e: React.MouseEvent, propertyId: string): void => {
        e.stopPropagation();

        const { flowState, compositionState } = getActionState();
        const property = compositionState.properties[propertyId];

        if (property.name !== PropertyGroupName.ArrayModifier) {
            throw new Error("Only ArrayModifier property groups may have an associated graph");
        }

        requestAction({ history: true }, (params) => {
            const { dispatch, submitAction } = params;

            // If graph exists, delete it. If not, create one.
            if (property.graphId) {
                dispatch(setPropertyGraphId({
                    propertyId,
                    graphId: ""
                }));
                dispatch(setGraph({ graph: {} as FlowGraph }));
                dispatch(setNode({ node: {} as FlowNode<FlowNodeType> }));
                dispatch(updateNodeState({ graphId: "", nodeId: "", state: {} }));
                submitAction("Remove array modifier graph");
                return;
            }

            const { graph, node } = createArrayModifierFlowGraph(propertyId, flowState);

            dispatch(
                setPropertyGraphId({
                    propertyId,
                    graphId: graph.id
                }),
                setGraph({ graph }),
                setNode({ node }),
                updateNodeState({ graphId: graph.id, nodeId: node.id, state: node.state }),
            );
            submitAction("Create array modifier graph");
        });
    },

    onLayerGraphMouseDown: (e: React.MouseEvent, layerId: string): void => {
        e.stopPropagation();

        const { flowState, compositionState } = getActionState();
        const layer = compositionState.layers[layerId];

        requestAction({ history: true }, (params) => {
            const { dispatch, submitAction } = params;

            // If graph exists, delete it. If not, create one.
            if (layer.graphId) {
                dispatch(setLayerGraphId({
                    layerId,
                    graphId: ""
                }));
                dispatch(setGraph({ graph: {} as FlowGraph }));
                dispatch(setNode({ node: {} as FlowNode<FlowNodeType> }));
                dispatch(updateNodeState({ graphId: "", nodeId: "", state: {} }));
                submitAction("Remove layer graph");
                return;
            }

            const { graph, node } = createLayerFlowGraph(layerId, flowState);

            dispatch(
                setLayerGraphId({
                    layerId,
                    graphId: graph.id
                }),
                setGraph({ graph }),
                setNode({ node }),
                updateNodeState({ graphId: graph.id, nodeId: node.id, state: node.state }),
            );
            submitAction("Create layer graph");
        });
    },

    onOpenGraphInAreaMouseDown: (e: React.MouseEvent, graphId: string): void => {
        const area: Area<AreaType.FlowEditor> = {
            type: AreaType.FlowEditor,
            state: { ...areaInitialStates[AreaType.FlowEditor], graphId },
        };
        dragOpenArea(e, { area });
    },

    onPropertyNameMouseDown: (
        e: React.MouseEvent,
        compositionId: string,
        propertyId: string,
    ): void => {
        e.stopPropagation();

        const { compositionState, compositionSelectionState, timelineState } = getActionState();
        const compositionSelection = compSelectionFromState(
            compositionId,
            compositionSelectionState,
        );
        const property = compositionState.properties[propertyId];

        const additiveSelection = isKeyDown("Command") || isKeyDown("Shift");

        requestAction(
            { history: true, shouldAddToStack: didCompSelectionChange(compositionId) },
            (params) => {
                const op = createOperation(params);

                if (!additiveSelection) {
                    // Clear other properties and timeline keyframes
                    op.add(selectionActions.clearCompositionSelection({
                        compositionId
                    }));

                    const timelineIds = getTimelineIdsReferencedByComposition(
                        compositionId,
                        compositionState,
                    );
                    op.add(...timelineIds.map((id) => clearTimelineSelection({ timelineId: id })));

                    if (property.type === "property" && property.timelineId) {
                        const timeline = timelineState[property.timelineId];
                        const keyframeIds = timeline.keyframes.map((k) => k.id);
                        op.add(addKeyframesToSelection({ timelineId: timeline.id, keyframeIds }));
                    } else if (property.type === "compound") {
                        for (const propertyId of property.properties) {
                            const p = compositionState.properties[propertyId] as Property;

                            if (!p.timelineId) {
                                continue;
                            }

                            const timeline = timelineState[p.timelineId];
                            const keyframeIds = timeline.keyframes.map((k) => k.id);
                            op.add(addKeyframesToSelection({ timelineId: timeline.id, keyframeIds }));
                        }
                    }
                } else {
                    // Add property and timeline keyframes to selection
                    op.add(selectionActions.addPropertyToSelection({
                        compositionId,
                        propertyId
                    }));
                    op.add(selectionActions.addLayerToSelection({
                        compositionId,
                        layerId: property.layerId
                    }));

                    if (property.type === "property" && property.timelineId) {
                        const timeline = timelineState[property.timelineId];
                        const keyframeIds = timeline.keyframes.map((k) => k.id);
                        op.add(addKeyframesToSelection({ timelineId: timeline.id, keyframeIds }));
                    } else if (property.type === "compound") {
                        for (const propertyId of property.properties) {
                            const p = compositionState.properties[propertyId] as Property;

                            if (!p.timelineId) {
                                continue;
                            }

                            const timeline = timelineState[p.timelineId];
                            const keyframeIds = timeline.keyframes.map((k) => k.id);
                            op.add(addKeyframesToSelection({ timelineId: timeline.id, keyframeIds }));
                        }
                    }
                }

                op.submit();
                params.addDiff((diff) => diff.compositionSelection(property.compositionId));
                params.submitAction("Select property");
            },
        );
    },

    moveModifierInList: (modifierPropertyId: string, moveBy: -1 | 1) => {
        requestAction({ history: true }, (params) => {
            const { compositionState } = getActionState();
            const property = compositionState.properties[modifierPropertyId];

            params.dispatch(moveModifier({
                modifierId: modifierPropertyId,
                moveBy
            }));
            params.addDiff((diff) => diff.modifierOrder(property.layerId));
            params.submitAction("Move modifier");
        });
    },

    toggleMaintainPropertyProportions: (propertyId: string) => {
        requestAction({ history: true }, (params) => {
            const { compositionState } = getActionState();
            const property = compositionState.properties[propertyId] as CompoundProperty;

            const maintainProportions = !property.maintainProportions;

            params.dispatch(
                setPropertyMaintainProportions({
                    propertyId,
                    maintainProportions
                }),
            );
            params.submitAction("Toggle maintain proportions");
        });
    },

    onLayerCollapsed: (e: React.MouseEvent, layerId: string): void => {
        e.stopPropagation();

        const { flowState, compositionState } = getActionState();
        const layer = compositionState.layers[layerId];

        requestAction({ history: true }, (params) => {
            const { dispatch, submitAction } = params;

            params.dispatch(setLayerCollapsed({
                layerId: layer.id,
                collapsed: !layer.collapsed
            }));

            if (layer.graphId) {
                dispatch(setLayerGraphId({
                    layerId,
                    graphId: ""
                }));
                dispatch(setGraph({ graph: {} as FlowGraph }));
                dispatch(setNode({ node: {} as FlowNode<FlowNodeType> }));
                dispatch(updateNodeState({ graphId: "", nodeId: "", state: {} }));
                submitAction("Remove layer graph");
                return;
            }

            const { graph, node } = createLayerFlowGraph(layerId, flowState);

            dispatch(
                setLayerGraphId({
                    layerId,
                    graphId: graph.id
                }),
                setGraph({ graph }),
                setNode({ node }),
                updateNodeState({ graphId: graph.id, nodeId: node.id, state: node.state }),
            );
            submitAction("Create layer graph");
        });
    },

    onLayerGraphId: (e: React.MouseEvent, layerId: string): void => {
        e.stopPropagation();

        const { flowState, compositionState } = getActionState();
        const layer = compositionState.layers[layerId];

        requestAction({ history: true }, (params) => {
            const { dispatch, submitAction } = params;

            // If graph exists, delete it. If not, create one.
            if (layer.graphId) {
                dispatch(setLayerGraphId({
                    layerId,
                    graphId: ""
                }));
                dispatch(setGraph({ graph: {} as FlowGraph }));
                dispatch(setNode({ node: {} as FlowNode<FlowNodeType> }));
                dispatch(updateNodeState({ graphId: "", nodeId: "", state: {} }));
                submitAction("Remove layer graph");
                return;
            }

            const { graph, node } = createLayerFlowGraph(layerId, flowState);

            dispatch(
                setLayerGraphId({
                    layerId,
                    graphId: graph.id
                }),
                setGraph({ graph }),
                setNode({ node }),
                updateNodeState({ graphId: graph.id, nodeId: node.id, state: node.state }),
            );
            submitAction("Create layer graph");
        });
    },

    onLayerParentLayerId: (e: React.MouseEvent, layerId: string): void => {
        e.stopPropagation();

        const { flowState, compositionState } = getActionState();
        const layer = compositionState.layers[layerId];

        requestAction({ history: true }, (params) => {
            const { dispatch, submitAction } = params;

            params.dispatch(setLayerParentLayerId({
                layerId: layer.id,
                parentLayerId: ""
            }));

            if (layer.graphId) {
                dispatch(setLayerGraphId({
                    layerId,
                    graphId: ""
                }));
                dispatch(setGraph({ graph: {} as FlowGraph }));
                dispatch(setNode({ node: {} as FlowNode<FlowNodeType> }));
                dispatch(updateNodeState({ graphId: "", nodeId: "", state: {} }));
                submitAction("Remove layer graph");
                return;
            }

            const { graph, node } = createLayerFlowGraph(layerId, flowState);

            dispatch(
                setLayerGraphId({
                    layerId,
                    graphId: graph.id
                }),
                setGraph({ graph }),
                setNode({ node }),
                updateNodeState({ graphId: graph.id, nodeId: node.id, state: node.state }),
            );
            submitAction("Create layer graph");
        });
    },

    onLayerPickWhipDrag: (
        e: React.MouseEvent,
        areaId: string,
        options: {
            layerId: string;
            compositionId: string;
            viewport: Rect;
            panY: number;
        },
    ): void => {
        const { layerId, compositionId, viewport, panY } = options;

        requestAction({ history: false }, ({ dispatch, submitAction }) => {
            dispatch(
                dispatchToAreaState({
                    areaId,
                    action: setFields({
                        pickWhipLayerParent: {
                            fromId: layerId,
                            to: Vec2.fromEvent(e.nativeEvent),
                        },
                    }),
                }),
            );
            submitAction();
        });
    },

    onLayerPickWhipDragEnd: (
        _e: React.MouseEvent,
        areaId: string,
        _options: {
            layerId: string;
            compositionId: string;
            viewport: Rect;
            panY: number;
        },
    ): void => {
        requestAction({ history: true }, ({ dispatch, submitAction }) => {
            dispatch(
                dispatchToAreaState({
                    areaId,
                    action: setFields({
                        pickWhipLayerParent: null,
                    }),
                }),
            );
            submitAction();
        });
    },
};
