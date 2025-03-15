import type { MouseEvent as ReactMouseEvent } from "react";
import {
    addLayerToSelection,
    addPropertyToSelection,
    clearCompositionSelection
} from "~/composition/compositionSelectionSlice";
import { compositionSlice } from "~/composition/compositionSlice";
import { PropertyGroup } from "~/composition/compositionTypes";
import { reduceLayerPropertiesAndGroups } from "~/composition/compositionUtils";
import { compSelectionFromState } from "~/composition/util/compSelectionUtils";
import { isKeyDown } from "~/listener/keyboard";
import { requestAction, RequestActionParams } from "~/listener/requestAction";
import { addControlPointToSelection, addNodeToSelection, clearShapeSelection } from "~/shape/shapeSelectionSlice";
import { shapeActions } from "~/shape/shapeSlice";
import { ShapeControlPoint, ShapeEdge, ShapeGraph, ShapeNode, ShapePath } from "~/shape/shapeTypes";
import { getLayerPathPropertyId, getShapeContinuePathFrom, getShapeLayerDirectlySelectedPaths, getShapeLayerPathIds, getShapeLayerSelectedPathIds, getShapePathClosePathNodeId } from "~/shape/shapeUtils";
import { getActionState } from "~/state/stateUtils";
import { store } from "~/state/store-init";
import { setFields } from "~/timeline/timelineAreaSlice";
import { LayerType, PropertyGroupName, PropertyName } from "~/types";
import { Rect } from "~/types/rect";
import { mouseDownMoveAction } from "~/util/action/mouseDownMoveAction";
import { createMapNumberId } from "~/util/mapUtils";
import { isVecInRect, projectVecTo45DegAngle, rectOfTwoVecs } from "~/util/math";
import { Vec2 } from "~/util/math/vec2";
import { constructPenToolContext, PenToolContext } from "./penToolContext";
import { penToolSlice } from "./penToolSlice";

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface PenToolHandlers {
    moveToolMouseDown: (e: ReactMouseEvent<Element>, layerId: string, areaId: string, viewport: Rect) => void;
    nodeMouseDown: (ctx: PenToolContext, pathId: string, nodeId: string, options: { fromMoveTool: boolean }) => void;
    removeNode: (ctx: PenToolContext, nodeId: string) => void;
    nodeDragNewControlPoints: (ctx: PenToolContext, pathId: string, nodeId: string) => void;
    completePath: (ctx: PenToolContext, pathId: string) => void;
    moveToolMouseDownPathSelection: (ctx: PenToolContext) => void;
    controlPointMouseDown: (ctx: PenToolContext, cpId: string) => void;
    moveToolMouseDownShapeSelection: (ctx: PenToolContext) => void;
    onMouseDown: (e: ReactMouseEvent<Element>, areaId: string, viewport: Rect) => void;
    onShapeLayerMouseDown: (ctx: PenToolContext) => void;
    mouseDownCreateShapeLayer: (e: ReactMouseEvent<Element>, areaId: string, viewport: Rect) => void;
}

export const penToolHandlers: PenToolHandlers = {
    moveToolMouseDown: (e: ReactMouseEvent<Element>, layerId: string, areaId: string, viewport: Rect) => {
        const ctx = constructPenToolContext(Vec2.new(e.clientX, e.clientY), layerId, areaId, viewport);
        const { compositionState, compositionSelectionState } = getActionState();

        const selectedPathIds = getShapeLayerSelectedPathIds(
            layerId,
            compositionState,
            compositionSelectionState,
        );

        const directlySelectedPathIds = getShapeLayerDirectlySelectedPaths(
            layerId,
            compositionState,
            compositionSelectionState,
        );

        // Dispatch l'action de démarrage de l'opération
        store.dispatch(penToolSlice.actions.startOperation({
            type: "move_node",
            position: ctx.mousePosition.normal,
            initialPosition: ctx.mousePosition.normal
        }));

        mouseDownMoveAction(ctx.mousePosition.global, {
            baseDiff: (diff) => diff.modifyLayer(layerId),
            keys: ["Shift"],
            translate: ctx.globalToNormal,
            beforeMove: (params) => {
                // Logique existante...
            },
            mouseMove: (params, { moveVector, keyDown }) => {
                let toUse = moveVector.normal;

                if (keyDown.Shift) {
                    toUse = projectVecTo45DegAngle(toUse);
                }

                // Mettre à jour la position de la souris dans le state
                store.dispatch(penToolSlice.actions.updateMousePosition(ctx.mousePosition.normal.add(toUse)));

                // Logique existante de déplacement...
            },
            mouseUp: (params, hasMoved) => {
                // Terminer l'opération
                store.dispatch(penToolSlice.actions.endOperation());

                if (hasMoved) {
                    params.submitAction("Move selected objects in shape", {
                        allowIndexShift: true,
                    });
                }
            },
        });
    },

    nodeMouseDown: (
        ctx: PenToolContext,
        pathId: string,
        nodeId: string,
        { fromMoveTool }: { fromMoveTool: boolean },
    ) => {
        if (isKeyDown("Alt")) {
            penToolHandlers.removeNode(ctx, nodeId);
            return;
        }

        if (isKeyDown("Command")) {
            penToolHandlers.nodeDragNewControlPoints(ctx, pathId, nodeId);
            return;
        }

        const { layerId, shapeState, shapeSelectionState } = ctx;
        const { compositionState } = getActionState();

        const compositionId = compositionState.layers[layerId].compositionId;
        const node = shapeState.nodes[nodeId];
        const shapeId = node.shapeId;

        if (!fromMoveTool) {
            // Check if a single node is selected and the hit node is the close path node.
            const pathIds = getShapeLayerPathIds(layerId, compositionState);
            const continueFrom = getShapeContinuePathFrom(pathIds, shapeState, shapeSelectionState);

            if (continueFrom) {
                const closePathNodeId = getShapePathClosePathNodeId(continueFrom, shapeState);

                if (nodeId === closePathNodeId) {
                    penToolHandlers.completePath(ctx, pathId);
                    return;
                }
            }
        }

        // Dispatch l'action de démarrage de l'opération
        store.dispatch(penToolSlice.actions.startOperation({
            type: "move_node",
            nodeId,
            pathId,
            position: ctx.mousePosition.normal,
            initialPosition: ctx.mousePosition.normal
        }));

        // Ajouter le noeud temporaire
        store.dispatch(penToolSlice.actions.addTemporaryNode({
            id: nodeId,
            node: {
                ...node,
                position: ctx.mousePosition.normal
            }
        }));

        mouseDownMoveAction(ctx.mousePosition.global, {
            baseDiff: (diff) => diff.modifyLayer(layerId),
            keys: ["Shift"],
            translate: ctx.globalToNormal,
            beforeMove: (params) => {
                // Add path property to selection
                let pathPropertyId = getLayerPathPropertyId(layerId, pathId, compositionState);
                params.dispatch(addPropertyToSelection(compositionId, pathPropertyId!));
            },
            mouseMove: (params, { moveVector, keyDown }) => {
                let toUse = moveVector.normal;

                if (keyDown.Shift) {
                    toUse = projectVecTo45DegAngle(toUse);
                }

                // Mettre à jour la position de la souris et du noeud temporaire
                const newPosition = ctx.mousePosition.normal.add(toUse);
                store.dispatch(penToolSlice.actions.updateMousePosition(newPosition));
                store.dispatch(penToolSlice.actions.updateTemporaryNode({
                    id: nodeId,
                    updates: {
                        position: newPosition
                    }
                }));
            },
            mouseUp: (params, hasMoved) => {
                // Terminer l'opération
                store.dispatch(penToolSlice.actions.endOperation());

                if (hasMoved) {
                    params.submitAction("Move node", {
                        allowIndexShift: true,
                    });
                }
            },
        });
    },

    removeNode: (ctx: PenToolContext, nodeId: string) => {
        requestAction({ history: true }, (params: RequestActionParams) => {
            const { shapeState } = ctx;
            const node = shapeState.nodes[nodeId];
            const { shapeId } = node;

            // Dispatch l'action de démarrage de l'opération
            store.dispatch(penToolSlice.actions.startOperation({
                type: "remove_node",
                nodeId,
                position: ctx.mousePosition.normal
            }));

            // Trouver tous les chemins qui référencent le noeud
            const pathIds = Object.keys(shapeState.paths);

            for (const pathId of pathIds) {
                const path = shapeState.paths[pathId];
                if (path.shapeId !== shapeId) {
                    continue;
                }

                const pathNodeIds = path.items.map((item) => item.nodeId);
                const itemIndex = pathNodeIds.indexOf(nodeId);
                if (itemIndex === -1) {
                    continue;
                }

                // Si c'est le seul noeud dans le chemin, supprimer le chemin
                if (path.items.length === 1) {
                    params.dispatch(shapeActions.removePath({ pathId }));
                    params.dispatch(shapeActions.removeShape({ shapeId }));
                    params.dispatch(shapeActions.removeNode({ shapeId, nodeId }));
                    continue;
                }

                // Si c'est le premier ou le dernier noeud
                if (itemIndex === 0 || itemIndex === path.items.length - 1) {
                    params.dispatch(shapeActions.removePathItem({ pathId, itemIndex }));
                    continue;
                }

                // Noeud au milieu du chemin
                const prevItem = path.items[itemIndex - 1];
                const nextItem = path.items[itemIndex + 1];

                // Connecter les noeuds adjacents
                if (prevItem.right && nextItem.left) {
                    const edge = {
                        id: createMapNumberId(shapeState.edges),
                        shapeId,
                        n0: prevItem.nodeId,
                        n1: nextItem.nodeId,
                        cp0: prevItem.right.controlPointId,
                        cp1: nextItem.left.controlPointId
                    };

                    params.dispatch(shapeActions.setEdge({ edge }));
                    params.dispatch(shapeActions.removePathItem({ pathId, itemIndex }));
                }
            }

            // Supprimer le noeud
            params.dispatch(shapeActions.removeNode({ shapeId, nodeId }));

            // Terminer l'opération
            store.dispatch(penToolSlice.actions.endOperation());

            params.addDiff((diff) => diff.modifyLayer(ctx.layerId));
            params.submitAction("Remove node");
        });
    },

    nodeDragNewControlPoints: (ctx: PenToolContext, pathId: string, nodeId: string) => {
        const { shapeState } = ctx;
        const path = shapeState.paths[pathId];
        const { shapeId } = path;
        const itemIndex = path.items.map((item) => item.nodeId).indexOf(nodeId);
        let item = path.items[itemIndex];

        // Dispatch l'action de démarrage de l'opération
        store.dispatch(penToolSlice.actions.startOperation({
            type: "move_control_point",
            nodeId,
            pathId,
            position: ctx.mousePosition.normal,
            initialPosition: ctx.mousePosition.normal
        }));

        mouseDownMoveAction(ctx.mousePosition.global, {
            baseDiff: (diff) => diff.modifyLayer(ctx.layerId),
            keys: ["Shift"],
            translate: ctx.globalToNormal,
            beforeMove: (params) => {
                // Créer les points de contrôle s'ils n'existent pas
                if (!item.left || !item.left.controlPointId) {
                    const cpId = createMapNumberId(shapeState.controlPoints);
                    const cp: ShapeControlPoint = {
                        id: cpId,
                        edgeId: item.left?.edgeId || createMapNumberId(shapeState.edges),
                        position: Vec2.new(0, 0)
                    };
                    store.dispatch(penToolSlice.actions.addTemporaryControlPoint({ id: cpId, controlPoint: cp }));
                    item = {
                        ...item,
                        left: {
                            ...item.left,
                            controlPointId: cpId,
                            edgeId: cp.edgeId
                        }
                    };
                }

                if (!item.right || !item.right.controlPointId) {
                    const cpId = createMapNumberId(shapeState.controlPoints);
                    const cp: ShapeControlPoint = {
                        id: cpId,
                        edgeId: item.right?.edgeId || createMapNumberId(shapeState.edges),
                        position: Vec2.new(0, 0)
                    };
                    store.dispatch(penToolSlice.actions.addTemporaryControlPoint({ id: cpId, controlPoint: cp }));
                    item = {
                        ...item,
                        right: {
                            ...item.right,
                            controlPointId: cpId,
                            edgeId: cp.edgeId
                        }
                    };
                }

                // Activer la réflexion des points de contrôle
                if (!item.reflectControlPoints) {
                    item = {
                        ...item,
                        reflectControlPoints: true
                    };
                }
            },
            mouseMove: (params, { moveVector, keyDown }) => {
                let toUse = moveVector.normal;

                if (keyDown.Shift) {
                    toUse = projectVecTo45DegAngle(toUse);
                }

                // Mettre à jour la position des points de contrôle
                if (item.left?.controlPointId) {
                    store.dispatch(penToolSlice.actions.updateTemporaryControlPoint({
                        id: item.left.controlPointId,
                        updates: {
                            position: toUse.scale(-1)
                        }
                    }));
                }

                if (item.right?.controlPointId) {
                    store.dispatch(penToolSlice.actions.updateTemporaryControlPoint({
                        id: item.right.controlPointId,
                        updates: {
                            position: toUse
                        }
                    }));
                }

                // Mettre à jour la position de la souris
                store.dispatch(penToolSlice.actions.updateMousePosition(ctx.mousePosition.normal.add(toUse)));
            },
            mouseUp: (params, hasMoved) => {
                // Terminer l'opération
                store.dispatch(penToolSlice.actions.endOperation());

                if (hasMoved) {
                    params.submitAction("Update control points", {
                        allowIndexShift: true,
                    });
                } else {
                    // Si pas de mouvement, supprimer les points de contrôle
                    if (item.left?.controlPointId) {
                        params.dispatch(shapeActions.removeControlPoint({ controlPointId: item.left.controlPointId }));
                    }
                    if (item.right?.controlPointId) {
                        params.dispatch(shapeActions.removeControlPoint({ controlPointId: item.right.controlPointId }));
                    }
                    params.submitAction("Remove control points");
                }
            },
        });
    },

    completePath: (ctx: PenToolContext, pathId: string) => {
        requestAction({ history: true }, (params: RequestActionParams) => {
            const { shapeState } = ctx;
            const path = shapeState.paths[pathId];
            const { shapeId } = path;

            // Dispatch l'action de démarrage de l'opération
            store.dispatch(penToolSlice.actions.startOperation({
                type: "edit_path",
                pathId,
                position: ctx.mousePosition.normal,
                initialPosition: ctx.mousePosition.normal
            }));

            // Récupérer le premier et le dernier item du chemin
            const firstItem = path.items[0];
            const lastItem = path.items[path.items.length - 1];

            // Créer un nouvel edge pour connecter le dernier nœud au premier
            const edgeId = createMapNumberId(shapeState.edges);
            const edge: ShapeEdge = {
                id: edgeId,
                shapeId,
                n0: lastItem.nodeId,
                n1: firstItem.nodeId,
                cp0: "",
                cp1: ""
            };

            // Mettre à jour les items pour connecter le chemin
            const updatedLastItem = {
                ...lastItem,
                right: {
                    edgeId,
                    controlPointId: ""
                }
            };

            const updatedFirstItem = {
                ...firstItem,
                left: {
                    edgeId,
                    controlPointId: ""
                }
            };

            // Dispatch les actions pour mettre à jour le chemin
            params.dispatch(shapeActions.setEdge({ edge }));
            params.dispatch(shapeActions.setPathItem({ pathId, itemIndex: 0, item: updatedFirstItem }));
            params.dispatch(shapeActions.setPathItem({ pathId, itemIndex: path.items.length - 1, item: updatedLastItem }));

            // Terminer l'opération
            store.dispatch(penToolSlice.actions.endOperation());

            // Soumettre l'action
            params.performDiff((diff) => diff.modifyLayer(ctx.layerId));
            params.submitAction("Complete path", { allowIndexShift: true });
        });
    },

    moveToolMouseDownPathSelection: (ctx: PenToolContext) => {
        const { shapeState, compositionState, compositionSelectionState } = getActionState();
        const { layerId } = ctx;

        const layer = compositionState.layers[layerId];
        const compositionId = layer.compositionId;
        const compositionSelection = compSelectionFromState(
            compositionId,
            compositionSelectionState,
        );

        let selectionRect: Rect | undefined;

        const additiveSelection = isKeyDown("Shift");

        // Démarrer l'opération de sélection
        store.dispatch(penToolSlice.actions.startOperation({
            type: "edit_path",
            pathId: "",
            position: ctx.mousePosition.normal,
            initialPosition: ctx.mousePosition.normal
        }));

        mouseDownMoveAction(ctx.mousePosition.global, {
            translate: ctx.globalToNormal,
            keys: [],
            beforeMove: () => { },
            mouseMove: (params, { mousePosition, initialMousePosition }) => {
                selectionRect = rectOfTwoVecs(mousePosition.normal, initialMousePosition.normal);
                if (selectionRect) {
                    // Mettre à jour la position de la souris et le rectangle de sélection
                    store.dispatch(penToolSlice.actions.updateMousePosition(mousePosition.normal));
                    params.dispatchToAreaState(ctx.areaId, setFields({ trackDragSelectRect: selectionRect }));
                }
            },
            mouseUp: (params, hasMoved) => {
                const pathIds = getShapeLayerSelectedPathIds(
                    layerId,
                    compositionState,
                    compositionSelectionState,
                );

                if (hasMoved) {
                    const rect = selectionRect!;
                    const toDispatch: any[] = [];

                    const directlySelected = getShapeLayerDirectlySelectedPaths(
                        layerId,
                        compositionState,
                        compositionSelectionState,
                    );

                    const _addedToDirectSelection = new Set<string>();
                    const addPathToDirectSelection = (pathId: string) => {
                        if (_addedToDirectSelection.has(pathId)) {
                            return;
                        }

                        const propertyId = getLayerPathPropertyId(
                            layerId,
                            pathId,
                            compositionState,
                        )!;
                        toDispatch.push(addPropertyToSelection(compositionId, propertyId));
                        _addedToDirectSelection.add(pathId);
                    };

                    for (const pathId of pathIds) {
                        const path = shapeState.paths[pathId];
                        const { shapeId } = path;

                        if (!additiveSelection) {
                            toDispatch.push(clearShapeSelection({ shapeId }));
                        }

                        const toPos = ctx.normalToViewport;

                        for (const { nodeId, left, right } of path.items) {
                            const node = shapeState.nodes[nodeId];

                            if (isVecInRect(node.position.apply(toPos), rect)) {
                                addPathToDirectSelection(pathId);
                                toDispatch.push(
                                    addNodeToSelection({ shapeId, nodeId }),
                                );

                                // Ajouter le nœud temporaire
                                store.dispatch(penToolSlice.actions.addTemporaryNode({
                                    id: nodeId,
                                    node: {
                                        ...node,
                                        position: node.position
                                    }
                                }));
                            }

                            if (directlySelected.has(pathId)) {
                                for (const part of [left, right]) {
                                    if (!part) {
                                        continue;
                                    }

                                    const cp = shapeState.controlPoints[part.controlPointId];

                                    if (!cp) {
                                        continue;
                                    }

                                    if (
                                        isVecInRect(
                                            node.position.add(cp.position).apply(toPos),
                                            rect,
                                        )
                                    ) {
                                        toDispatch.push(
                                            addControlPointToSelection({ shapeId, cpId: cp.id }),
                                        );

                                        // Ajouter le point de contrôle temporaire
                                        store.dispatch(penToolSlice.actions.addTemporaryControlPoint({
                                            id: cp.id,
                                            controlPoint: {
                                                ...cp,
                                                position: cp.position
                                            }
                                        }));
                                    }
                                }
                            }
                        }
                    }

                    params.dispatch(toDispatch);
                    params.dispatchToAreaState(ctx.areaId, setFields({ trackDragSelectRect: null }));
                    params.addDiff((diff) => diff.compositionSelection(compositionId));
                    params.submitAction("Modify selection");
                } else {
                    // Aucun objet n'a été touché
                    // Effacer toutes les sélections de formes et remonter la sélection de propriété de forme d'un niveau

                    const toDispatch: any[] = [];

                    for (const pathId of pathIds) {
                        const { shapeId } = shapeState.paths[pathId];
                        toDispatch.push(clearShapeSelection({ shapeId }));
                    }

                    const shapeGroupIds = reduceLayerPropertiesAndGroups<string[]>(
                        layerId,
                        compositionState,
                        (arr, property) => {
                            if (property.name === PropertyGroupName.Shape) {
                                arr.push(property.id);
                            }
                            return arr;
                        },
                        [],
                    );

                    for (const shapeGroupId of shapeGroupIds) {
                        const group = compositionState.properties[shapeGroupId] as PropertyGroup;

                        const propertyNames = group.properties.map(
                            (id) => compositionState.properties[id].name,
                        );

                        const pathIndex = propertyNames.indexOf(PropertyName.ShapeLayer_Path);

                        if (pathIndex === -1) {
                            continue;
                        }

                        const pathPropertyId = group.properties[pathIndex];
                        if (compositionSelection.properties[pathPropertyId]) {
                            toDispatch.push(
                                addPropertyToSelection(compositionId, pathPropertyId),
                                addPropertyToSelection(compositionId, shapeGroupId),
                            );
                        } else {
                            toDispatch.push(
                                addPropertyToSelection(compositionId, shapeGroupId),
                            );
                        }
                    }

                    params.dispatch(toDispatch);
                    params.addDiff((diff) => diff.compositionSelection(compositionId));
                    params.submitAction("Modify selection");
                }

                // Terminer l'opération
                store.dispatch(penToolSlice.actions.endOperation());
            },
        });
    },

    controlPointMouseDown: (ctx: PenToolContext, cpId: string) => {
        const { shapeSelectionState } = ctx;
        let shapeState = ctx.shapeState;

        const cp = shapeState.controlPoints[cpId]!;
        const edge = shapeState.edges[cp.edgeId];
        const node = shapeState.nodes[edge.cp0 === cpId ? edge.n0 : edge.n1];
        const shapeId = edge.shapeId;

        // Démarrer l'opération de déplacement du point de contrôle
        store.dispatch(penToolSlice.actions.startOperation({
            type: "move_control_point",
            controlPointId: cpId,
            position: ctx.mousePosition.normal,
            initialPosition: ctx.mousePosition.normal
        }));

        // Ajouter le point de contrôle temporaire
        store.dispatch(penToolSlice.actions.addTemporaryControlPoint({
            id: cpId,
            controlPoint: {
                ...cp,
                position: cp.position
            }
        }));

        const additiveSelection = isKeyDown("Shift") || isKeyDown("Command");
        const willBeSelected = additiveSelection ? !shapeSelectionState.controlPoints[cpId] : true;

        mouseDownMoveAction(ctx.mousePosition.global, {
            baseDiff: (diff) => diff.modifyLayer(ctx.layerId),
            keys: ["Shift"],
            translate: ctx.globalToNormal,
            beforeMove: (params) => {
                if (!additiveSelection) {
                    params.dispatch(clearShapeSelection({ shapeId }));
                }
                params.dispatch(addControlPointToSelection({ shapeId, cpId }));
            },
            mouseMove: (params, { moveVector, keyDown }) => {
                let toUse = moveVector.normal;

                if (keyDown.Shift) {
                    const cpPosViewport = ctx.normalToViewport(cp.position.add(node.position));
                    const nodePosViewport = ctx.normalToViewport(node.position);
                    let temp = cpPosViewport.sub(nodePosViewport).add(moveVector.viewport);
                    temp = projectVecTo45DegAngle(temp);
                    temp = temp.add(nodePosViewport);
                    temp = ctx.viewportToNormal(temp);
                    const nNormal = ctx.viewportToNormal(nodePosViewport);
                    toUse = temp.sub(nNormal).sub(cp.position);
                }

                // Mettre à jour la position du point de contrôle temporaire
                store.dispatch(penToolSlice.actions.updateTemporaryControlPoint({
                    id: cpId,
                    updates: {
                        position: cp.position.add(toUse)
                    }
                }));

                // Mettre à jour la position de la souris
                store.dispatch(penToolSlice.actions.updateMousePosition(ctx.mousePosition.normal.add(toUse)));
            },
            mouseUp: (params, hasMoved) => {
                // Terminer l'opération
                store.dispatch(penToolSlice.actions.endOperation());

                if (hasMoved) {
                    params.submitAction("Move control point", {
                        allowIndexShift: true,
                    });
                    return;
                }

                if (!additiveSelection) {
                    params.dispatch(clearShapeSelection({ shapeId }));
                }
                params.dispatch(addControlPointToSelection({ shapeId, cpId }));
                params.submitAction("Select control point");
            },
        });
    },

    moveToolMouseDownShapeSelection: (ctx: PenToolContext) => {
        const { compositionState, compositionSelectionState, shapeState } = getActionState();
        const { layerId, compositionId } = ctx;

        // Démarrer l'opération de sélection de forme
        store.dispatch(penToolSlice.actions.startOperation({
            type: "edit_path",
            pathId: "",
            position: ctx.mousePosition.normal,
            initialPosition: ctx.mousePosition.normal
        }));

        const pathIds = getShapeLayerPathIds(layerId, compositionState);
        let selectedPathId: string | undefined;

        // Trouver le chemin sous le curseur
        for (const pathId of pathIds) {
            const path = shapeState.paths[pathId];
            const { shapeId } = path;

            // Vérifier si le curseur est sur un nœud du chemin
            for (const item of path.items) {
                const node = shapeState.nodes[item.nodeId];
                if (isVecInRect(ctx.mousePosition.viewport, {
                    x: node.position.x - 5,
                    y: node.position.y - 5,
                    width: 10,
                    height: 10
                })) {
                    selectedPathId = pathId;
                    break;
                }
            }

            if (selectedPathId) break;
        }

        const additiveSelection = isKeyDown("Shift");

        mouseDownMoveAction(ctx.mousePosition.global, {
            baseDiff: (diff) => diff.modifyLayer(ctx.layerId),
            keys: ["Shift"],
            translate: ctx.globalToNormal,
            beforeMove: (params) => {
                if (!selectedPathId) {
                    // Aucun chemin sélectionné, nettoyer la sélection
                    params.dispatch(clearCompositionSelection(compositionId));
                    params.dispatch(addLayerToSelection(compositionId, layerId));
                    return;
                }

                // Sélectionner le chemin
                const propertyId = getLayerPathPropertyId(layerId, selectedPathId, compositionState);
                if (!propertyId) return;

                if (!additiveSelection) {
                    params.dispatch(clearCompositionSelection(compositionId));
                    params.dispatch(addLayerToSelection(compositionId, layerId));
                }
                params.dispatch(addPropertyToSelection(compositionId, propertyId));
            },
            mouseMove: (params, { moveVector, keyDown }) => {
                if (!selectedPathId) return;

                let toUse = moveVector.normal;
                if (keyDown.Shift) {
                    toUse = projectVecTo45DegAngle(toUse);
                }

                // Mettre à jour la position de la souris
                store.dispatch(penToolSlice.actions.updateMousePosition(ctx.mousePosition.normal.add(toUse)));

                // Déplacer le chemin sélectionné
                const path = shapeState.paths[selectedPathId];
                for (const item of path.items) {
                    const node = shapeState.nodes[item.nodeId];
                    store.dispatch(penToolSlice.actions.updateTemporaryNode({
                        id: item.nodeId,
                        updates: {
                            position: node.position.add(toUse)
                        }
                    }));
                }
            },
            mouseUp: (params, hasMoved) => {
                // Terminer l'opération
                store.dispatch(penToolSlice.actions.endOperation());

                if (hasMoved && selectedPathId) {
                    params.submitAction("Move shape", {
                        allowIndexShift: true,
                    });
                } else {
                    params.submitAction("Select shape");
                }
            },
        });
    },

    onMouseDown: (e: ReactMouseEvent<Element>, areaId: string, viewport: Rect) => {
        const { compositionState, compositionSelectionState } = getActionState();
        const compositions = Object.keys(compositionState.compositions);
        const compositionId = compositions[0];
        const selection = compSelectionFromState(compositionId, compositionSelectionState);
        const selectedLayers = Object.keys(selection.layers);

        // Filtrer pour ne garder que les calques de forme
        const selectedShapeLayers = selectedLayers.filter((layerId) => {
            const layer = compositionState.layers[layerId];
            return layer.type === LayerType.Shape;
        });

        // Si un seul calque de forme est sélectionné
        if (selectedShapeLayers.length === 1) {
            const ctx = constructPenToolContext(
                Vec2.new(e.clientX, e.clientY),
                selectedShapeLayers[0],
                areaId,
                viewport
            );

            // Démarrer l'opération
            store.dispatch(penToolSlice.actions.startOperation({
                type: "edit_path",
                pathId: "",
                position: ctx.mousePosition.normal,
                initialPosition: ctx.mousePosition.normal
            }));

            // Gérer le clic sur le calque de forme
            penToolHandlers.onShapeLayerMouseDown(ctx);
            return;
        }

        // Si plusieurs calques sont sélectionnés ou aucun, créer un nouveau calque de forme
        penToolHandlers.mouseDownCreateShapeLayer(e, areaId, viewport);
    },

    onShapeLayerMouseDown: (ctx: PenToolContext) => {
        const { shapeState, compositionState, compositionSelectionState } = getActionState();
        const { layerId } = ctx;

        const pathIds = getShapeLayerPathIds(layerId, compositionState);
        const selectedPathIds = getShapeLayerSelectedPathIds(
            layerId,
            compositionState,
            compositionSelectionState,
        );

        // Vérifier si on continue un chemin existant
        const continueFrom = getShapeContinuePathFrom(pathIds, shapeState, compositionSelectionState);
        if (continueFrom && typeof continueFrom === 'string') {
            const path = shapeState.paths[continueFrom];
            const { shapeId } = path;

            // Créer un nouveau nœud
            const nodeId = createMapNumberId(shapeState.nodes);
            const node = {
                id: nodeId,
                shapeId,
                position: ctx.mousePosition.normal,
            };

            // Créer un nouvel edge
            const edgeId = createMapNumberId(shapeState.edges);
            const lastItem = path.items[path.items.length - 1];
            const edge: ShapeEdge = {
                id: edgeId,
                shapeId,
                n0: lastItem.nodeId,
                n1: nodeId,
                cp0: "",
                cp1: "",
            };

            // Mettre à jour le dernier item et ajouter le nouveau
            const updatedLastItem = {
                ...lastItem,
                right: {
                    edgeId,
                    controlPointId: "",
                },
            };

            const newItem = {
                nodeId,
                left: {
                    edgeId,
                    controlPointId: "",
                },
                right: null,
                reflectControlPoints: false,
            };

            // Dispatch les actions
            requestAction({ history: true }, (params: RequestActionParams) => {
                params.dispatch(shapeActions.addNode({ shapeId: node.shapeId, node }));
                params.dispatch(shapeActions.setEdge({ edge }));
                params.dispatch(shapeActions.setPathItem({
                    pathId: path.id,
                    itemIndex: path.items.length - 1,
                    item: updatedLastItem
                }));
                params.dispatch(shapeActions.appendPathItem({
                    pathId: path.id,
                    item: newItem,
                    direction: "right"
                }));

                params.addDiff((diff) => diff.modifyLayer(ctx.layerId));
                params.submitAction("Add node to path", { allowIndexShift: true });
            });

            // Ajouter le nœud temporaire
            store.dispatch(penToolSlice.actions.addTemporaryNode({
                id: nodeId,
                node: {
                    ...node,
                    position: ctx.mousePosition.normal
                }
            }));

            // Gérer le déplacement du nœud
            mouseDownMoveAction(ctx.mousePosition.global, {
                baseDiff: (diff) => diff.modifyLayer(layerId),
                keys: ["Shift"],
                translate: ctx.globalToNormal,
                beforeMove: () => { },
                mouseMove: (params, { moveVector, keyDown }) => {
                    let toUse = moveVector.normal;
                    if (keyDown.Shift) {
                        toUse = projectVecTo45DegAngle(toUse);
                    }

                    // Mettre à jour la position du nœud temporaire
                    store.dispatch(penToolSlice.actions.updateTemporaryNode({
                        id: nodeId,
                        updates: {
                            position: ctx.mousePosition.normal.add(toUse)
                        }
                    }));

                    // Mettre à jour la position de la souris
                    store.dispatch(penToolSlice.actions.updateMousePosition(ctx.mousePosition.normal.add(toUse)));
                },
                mouseUp: (params, hasMoved) => {
                    // Terminer l'opération
                    store.dispatch(penToolSlice.actions.endOperation());

                    if (hasMoved) {
                        params.submitAction("Add and move node", {
                            allowIndexShift: true,
                        });
                    } else {
                        params.submitAction("Add node");
                    }
                },
            });
            return;
        }

        // Si on ne continue pas un chemin, créer un nouveau chemin
        requestAction({ history: true }, (params: RequestActionParams) => {
            const shapeId = createMapNumberId(shapeState.shapes);
            const pathId = createMapNumberId(shapeState.paths);
            const nodeId = createMapNumberId(shapeState.nodes);

            // Créer un nouveau nœud
            const node = {
                id: nodeId,
                shapeId,
                position: ctx.mousePosition.normal,
            };

            // Créer un nouveau chemin avec le nœud
            const path = {
                id: pathId,
                shapeId,
                items: [
                    {
                        nodeId,
                        left: null,
                        right: null,
                        reflectControlPoints: false,
                    },
                ],
            };

            // Créer une nouvelle forme
            const shape: ShapeGraph = {
                id: shapeId,
                nodes: [nodeId],
                edges: []
            };

            // Dispatch les actions
            params.dispatch([
                compositionSlice.actions.createLayer({
                    compositionId: Object.keys(compositionState.compositions)[0],
                    type: LayerType.Shape,
                    options: {
                        insertLayerIndex: 0,
                        compositionLayerReferenceId: ""
                    }
                }),
                shapeActions.addNode({ shapeId, node }),
                shapeActions.setPath({
                    path
                }),
                shapeActions.setShape({
                    shape
                })
            ]);

            params.addDiff((diff) => diff.modifyLayer(layerId));
            params.submitAction("Create new path");
        });
    },

    mouseDownCreateShapeLayer: (e: ReactMouseEvent<Element>, areaId: string, viewport: Rect) => {
        const { compositionState, shapeState } = getActionState();
        const ctx = constructPenToolContext(Vec2.new(e.clientX, e.clientY), "", areaId, viewport);

        // Démarrer l'opération
        store.dispatch(penToolSlice.actions.startOperation({
            type: "edit_path",
            pathId: "",
            position: ctx.mousePosition.normal,
            initialPosition: ctx.mousePosition.normal
        }));

        requestAction({ history: true }, (params) => {
            // Créer un nouveau calque de forme
            const layerId = createMapNumberId(compositionState.layers);
            const shapeId = createMapNumberId(shapeState.shapes);
            const pathId = createMapNumberId(shapeState.paths);
            const nodeId = createMapNumberId(shapeState.nodes);

            // Créer un nouveau nœud
            const node: ShapeNode = {
                id: nodeId,
                shapeId,
                position: ctx.mousePosition.normal,
            };

            // Créer un nouveau chemin avec le nœud
            const path: ShapePath = {
                id: pathId,
                shapeId,
                items: [
                    {
                        nodeId,
                        left: null,
                        right: null,
                        reflectControlPoints: false,
                    },
                ],
            };

            // Créer une nouvelle forme
            const shape: ShapeGraph = {
                id: shapeId,
                nodes: [nodeId],
                edges: []
            };

            // Ajouter le nœud au shape
            shape.nodes.push(nodeId);

            // Créer le calque
            params.dispatch([
                compositionSlice.actions.createLayer({
                    compositionId: Object.keys(compositionState.compositions)[0],
                    type: LayerType.Shape,
                    options: {
                        insertLayerIndex: 0,
                        compositionLayerReferenceId: ""
                    }
                }),
                shapeActions.addNode({ shapeId, node }),
                shapeActions.setPath({
                    path
                }),
                shapeActions.setShape({
                    shape
                })
            ]);

            params.addDiff((diff) => diff.modifyLayer(layerId));
            params.submitAction("Create shape layer");
        });
    },
}; 
