import { AnyAction, Dispatch, Middleware } from "@reduxjs/toolkit";
import { setEllipseCenter, setEllipseRadius } from "~/composition/compositionSlice";
import { Vec2 } from "~/util/math/vec2";
import { StoreType } from "./store-types";

// Type guard pour vérifier si une action est une AnyAction
const isAnyAction = (action: unknown): action is AnyAction => {
    return typeof action === 'object' && action !== null && 'type' in action;
};

// Liste des types d'actions à synchroniser
const SYNC_ACTION_TYPES = ["tool/", "contextMenu/", "area/"];

interface SetEllipseRadiusAction extends AnyAction {
    type: "comp/setEllipseRadius";
    payload: {
        layerId: string;
        radius: number;
    };
}

interface SetEllipseCenterAction extends AnyAction {
    type: "comp/setEllipseCenter";
    payload: {
        layerId: string;
        x: number;
        y: number;
    };
}

function isSetEllipseRadiusAction(action: unknown): action is SetEllipseRadiusAction {
    const isCorrectType = isAnyAction(action) && action.type === "comp/setEllipseRadius";
    console.log("[COMPAT] Checking if action is setEllipseRadius:", {
        action,
        isCorrectType,
        hasPayload: isCorrectType && action.payload !== undefined,
        payloadType: isCorrectType ? typeof action.payload : 'N/A'
    });
    return isCorrectType;
}

function isSetEllipseCenterAction(action: unknown): action is SetEllipseCenterAction {
    const isCorrectType = isAnyAction(action) && action.type === "comp/setEllipseCenter";
    console.log("[COMPAT] Checking if action is setEllipseCenter:", {
        action,
        isCorrectType,
        hasPayload: isCorrectType && action.payload !== undefined,
        payloadType: isCorrectType ? typeof action.payload : 'N/A'
    });
    return isCorrectType;
}

// Middleware pour synchroniser les actions entre les deux stores
export const createCompatibilityMiddleware = (oldStore: StoreType, rtkStore: StoreType): Middleware<Dispatch<AnyAction>, any, any> => {
    let isHandlingAction = false;
    let currentActionId: string | null = null;
    let actionQueue: { action: AnyAction; next: any }[] = [];
    const processingActions = new Set<string>();
    const pendingActions = new Map<string, AnyAction>();

    const shouldSyncAction = (action: AnyAction) => {
        return !action.type.startsWith('history/');
    };

    const getActionKey = (action: AnyAction) => {
        return `${action.type}-${action.payload?.actionId || ''}`;
    };

    const handleSyncAction = (action: AnyAction) => {
        if (!shouldSyncAction(action)) {
            return;
        }

        const actionKey = getActionKey(action);
        
        // Si l'action a skipHistory, ne pas la mettre en attente
        if (action.payload?.skipHistory) {
            console.log("[COMPAT] Processing skip-history action:", {
                type: action.type,
                payload: action.payload,
                timestamp: new Date().toISOString()
            });
            if (!processingActions.has(actionKey)) {
                processingActions.add(actionKey);
                try {
                    oldStore.dispatch(action);
                } finally {
                    processingActions.delete(actionKey);
                }
            }
            return;
        }

        // Si l'action n'a pas d'ID et qu'elle est dans la liste des actions en attente
        if (!action.payload?.actionId && pendingActions.has(action.type)) {
            console.log("[COMPAT] Action pending:", {
                type: action.type,
                timestamp: new Date().toISOString()
            });
            return;
        }

        // Si l'action a un ID et qu'elle était en attente, la supprimer de la liste
        if (action.payload?.actionId && pendingActions.has(action.type)) {
            console.log("[COMPAT] Processing pending action:", {
                type: action.type,
                actionId: action.payload.actionId,
                timestamp: new Date().toISOString()
            });
            pendingActions.delete(action.type);
        }

        if (!processingActions.has(actionKey)) {
            console.log("[COMPAT] Dispatching to old store:", {
                type: action.type,
                actionId: action.payload?.actionId,
                timestamp: new Date().toISOString()
            });
            processingActions.add(actionKey);
            try {
                oldStore.dispatch(action);
            } finally {
                processingActions.delete(actionKey);
            }
        }
    };

    const processQueuedActions = () => {
        while (actionQueue.length > 0 && !isHandlingAction) {
            console.log("[COMPAT] Processing queued action", {
                queueLength: actionQueue.length,
                timestamp: new Date().toISOString()
            });
            const { action, next } = actionQueue.shift()!;
            handleAction(action, next);
        }
    };

    const handleBatchAction = (action: AnyAction, next: any) => {
        if (!action.payload?.actionBatch || !Array.isArray(action.payload.actionBatch)) {
            return next(action);
        }

        console.log("[COMPAT] Processing batch action:", {
            batchSize: action.payload.actionBatch.length,
            actionId: action.payload.actionId,
            timestamp: new Date().toISOString()
        });

        // Si le batch contient des actions avec skipHistory, les traiter immédiatement
        const skipHistoryActions = action.payload.actionBatch.filter((a: AnyAction) => a.payload?.skipHistory);
        const normalActions = action.payload.actionBatch.filter((a: AnyAction) => !a.payload?.skipHistory);

        // Traiter d'abord les actions skipHistory
        skipHistoryActions.forEach((batchAction: AnyAction) => {
            if (shouldSyncAction(batchAction)) {
                const actionKey = getActionKey(batchAction);
                if (!processingActions.has(actionKey)) {
                    console.log("[COMPAT] Processing skip-history batch action:", {
                        type: batchAction.type,
                        timestamp: new Date().toISOString()
                    });
                    processingActions.add(actionKey);
                    try {
                        oldStore.dispatch(batchAction);
                    } finally {
                        processingActions.delete(actionKey);
                    }
                }
            }
        });

        // Ensuite traiter les actions normales avec l'ID du batch
        const batchActionId = action.payload.actionId;
        if (normalActions.length > 0 && !batchActionId) {
            console.warn("[COMPAT] Batch action without actionId:", action);
            return next(action);
        }

        // Appliquer l'action au store RTK
        const result = next(action);

        // Synchroniser avec l'ancien store
        if (shouldSyncAction(action)) {
            handleSyncAction(action);
        }

        return result;
    };

    const handleAction = (action: AnyAction, next: any) => {
        // Si l'action a skipHistory, la traiter immédiatement sans passer par l'historique
        if (action.payload?.skipHistory) {
            console.log("[COMPAT] Skip-history action:", {
                type: action.type,
                timestamp: new Date().toISOString()
            });
            const result = next(action);
            handleSyncAction(action);
            return result;
        }

        if (action.type.startsWith('history/')) {
            if (action.type === 'history/startAction') {
                if (isHandlingAction) {
                    console.log("[COMPAT] Queueing start action:", {
                        actionId: action.payload.actionId,
                        timestamp: new Date().toISOString()
                    });
                    actionQueue.push({ action, next });
                    return;
                }
                isHandlingAction = true;
                currentActionId = action.payload.actionId;
                pendingActions.clear();
            } else if (action.type === 'history/cancelAction' || action.type === 'history/submitAction') {
                console.log("[COMPAT] Ending action:", {
                    type: action.type,
                    actionId: action.payload.actionId,
                    timestamp: new Date().toISOString()
                });
                isHandlingAction = false;
                currentActionId = null;
                actionQueue = [];
                processingActions.clear();
                pendingActions.clear();
            } else if (action.type === 'history/dispatchBatchToAction') {
                return handleBatchAction(action, next);
            }
            return next(action);
        }

        // Pour les actions normales
        if (isHandlingAction && !action.payload?.actionId) {
            console.log("[COMPAT] Adding action to pending:", {
                type: action.type,
                currentActionId,
                timestamp: new Date().toISOString()
            });
            // Stocker l'action sans ID pour référence future
            pendingActions.set(action.type, action);
            
            action = {
                ...action,
                payload: {
                    ...action.payload,
                    actionId: currentActionId
                }
            };
        }

        const result = next(action);
        handleSyncAction(action);
        return result;
    };

    return () => (next) => (action: unknown) => {
        if (!isAnyAction(action)) {
            return next(action);
        }

        // Si l'action a skipHistory, la traiter immédiatement
        if (action.payload?.skipHistory) {
            return handleAction(action, next);
        }

        if (isHandlingAction && !action.type.startsWith('history/')) {
            console.log("[COMPAT] Queueing action:", {
                type: action.type,
                timestamp: new Date().toISOString()
            });
            actionQueue.push({ action, next });
            return;
        }

        const result = handleAction(action, next);

        if (!isHandlingAction) {
            processQueuedActions();
        }

        return result;
    };
};

export const compatibilityMiddleware: Middleware = store => next => action => {
    if (!isAnyAction(action)) {
        console.log("[COMPAT] Action is not an AnyAction:", action);
        return next(action);
    }

    // Ignorer les actions d'historique qui ne nécessitent pas de conversion
    if (action.type === 'history/SUBMIT_ACTION' || 
        action.type === 'history/START_ACTION' || 
        action.type === 'history/CANCEL_ACTION') {
        return next(action);
    }

    console.log("[COMPAT] Processing action:", {
        type: action.type,
        payload: action.payload,
        actionToDispatch: action.payload?.actionToDispatch,
        timestamp: new Date().toISOString()
    });

    // Si c'est une action d'historique DISPATCH_TO_ACTION, extraire l'action originale
    if (action.type === 'history/DISPATCH_TO_ACTION') {
        const originalAction = action.payload?.actionToDispatch;
        console.log("[COMPAT] Extracted original action:", originalAction);
        
        if (!originalAction) {
            console.log("[COMPAT] No original action found in payload");
            return next(action);
        }
        
        // Vérifier si l'action originale est une action à convertir
        if (originalAction.type === 'comp/setEllipseRadius') {
            console.log("[COMPAT] Converting setEllipseRadius action:", originalAction.payload);
            const { layerId, radius } = originalAction.payload;
            const newAction = setEllipseRadius({ layerId, radius });
            console.log("[COMPAT] Created new setEllipseRadius action:", newAction);
            return next({
                ...action,
                payload: {
                    ...action.payload,
                    actionToDispatch: newAction
                }
            });
        }

        if (originalAction.type === 'comp/setEllipseCenter') {
            console.log("[COMPAT] Converting setEllipseCenter action:", originalAction.payload);
            const { layerId, x, y } = originalAction.payload;
            // Créer un Vec2 temporaire pour l'action
            const center = Vec2.new(x, y);
            const newAction = setEllipseCenter({ layerId, center });
            console.log("[COMPAT] Created new setEllipseCenter action:", newAction);
            return next({
                ...action,
                payload: {
                    ...action.payload,
                    actionToDispatch: newAction
                }
            });
        }
    }

    // Pour les actions directes (non historiques)
    if (isSetEllipseRadiusAction(action)) {
        console.log("[COMPAT] Converting direct setEllipseRadius action:", action.payload);
        const { layerId, radius } = action.payload;
        const newAction = setEllipseRadius({ layerId, radius });
        console.log("[COMPAT] Created new direct setEllipseRadius action:", newAction);
        return next(newAction);
    }

    if (isSetEllipseCenterAction(action)) {
        console.log("[COMPAT] Converting direct setEllipseCenter action:", action.payload);
        const { layerId, x, y } = action.payload;
        // Créer un Vec2 temporaire pour l'action
        const center = Vec2.new(x, y);
        const newAction = setEllipseCenter({ layerId, center });
        console.log("[COMPAT] Created new direct setEllipseCenter action:", newAction);
        return next(newAction);
    }

    return next(action);
}; 
