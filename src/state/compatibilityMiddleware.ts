import { AnyAction, Dispatch, Middleware } from "@reduxjs/toolkit";
import { StoreType } from "./store-types";

// Type guard pour vérifier si une action est une AnyAction
const isAnyAction = (action: unknown): action is AnyAction => {
    return typeof action === 'object' && action !== null && 'type' in action;
};

// Liste des types d'actions à synchroniser
const SYNC_ACTION_TYPES = ["tool/", "contextMenu/", "area/"];

// Middleware pour synchroniser les actions entre les deux stores
export const createCompatibilityMiddleware = (oldStore: StoreType, rtkStore: StoreType): Middleware<Dispatch<AnyAction>, any, any> => {
    const processingActions = new Set<string>();
    let currentActionId: string | null = null;
    let isHandlingAction = false;
    let actionQueue: Array<{ action: AnyAction; next: any }> = [];
    let pendingActions = new Map<string, AnyAction>();

    const shouldSyncAction = (action: AnyAction): boolean => {
        return SYNC_ACTION_TYPES.some(prefix => action.type.startsWith(prefix));
    };

    const getActionKey = (action: AnyAction): string => {
        const actionId = action.payload?.actionId || 'default';
        return `${action.type}-${actionId}`;
    };

    const handleSyncAction = (action: AnyAction) => {
        if (!shouldSyncAction(action)) {
            return;
        }

        const actionKey = getActionKey(action);
        
        // Si l'action a skipHistory, ne pas la mettre en attente
        if (action.payload?.skipHistory) {
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
            // Ne pas dispatcher maintenant, elle sera gérée dans le batch
            return;
        }

        // Si l'action a un ID et qu'elle était en attente, la supprimer de la liste
        if (action.payload?.actionId && pendingActions.has(action.type)) {
            pendingActions.delete(action.type);
        }

        if (!processingActions.has(actionKey)) {
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
            const { action, next } = actionQueue.shift()!;
            handleAction(action, next);
        }
    };

    const handleBatchAction = (action: AnyAction, next: any) => {
        if (!action.payload?.actionBatch || !Array.isArray(action.payload.actionBatch)) {
            return next(action);
        }

        // Si le batch contient des actions avec skipHistory, les traiter immédiatement
        const skipHistoryActions = action.payload.actionBatch.filter((a: AnyAction) => a.payload?.skipHistory);
        const normalActions = action.payload.actionBatch.filter((a: AnyAction) => !a.payload?.skipHistory);

        // Traiter d'abord les actions skipHistory
        skipHistoryActions.forEach((batchAction: AnyAction) => {
            if (shouldSyncAction(batchAction)) {
                const actionKey = getActionKey(batchAction);
                if (!processingActions.has(actionKey)) {
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
            console.warn("Batch action without actionId:", action);
            return next(action);
        }

        // Appliquer l'action au store RTK
        const result = next(action);

        // Synchroniser les actions normales du batch avec l'ancien store
        normalActions.forEach((batchAction: AnyAction) => {
            if (shouldSyncAction(batchAction)) {
                const actionWithId = {
                    ...batchAction,
                    payload: {
                        ...batchAction.payload,
                        actionId: batchActionId
                    }
                };

                const actionKey = getActionKey(actionWithId);
                if (!processingActions.has(actionKey)) {
                    processingActions.add(actionKey);
                    try {
                        oldStore.dispatch(actionWithId);
                    } finally {
                        processingActions.delete(actionKey);
                    }
                }
            }
        });

        // Nettoyer les actions en attente après le traitement du batch
        pendingActions.clear();

        return result;
    };

    const handleAction = (action: AnyAction, next: any) => {
        // Si l'action a skipHistory, la traiter immédiatement sans passer par l'historique
        if (action.payload?.skipHistory) {
            const result = next(action);
            handleSyncAction(action);
            return result;
        }

        if (action.type.startsWith('history/')) {
            if (action.type === 'history/startAction') {
                if (isHandlingAction) {
                    actionQueue.push({ action, next });
                    return;
                }
                isHandlingAction = true;
                currentActionId = action.payload;
                pendingActions.clear();
            } else if (action.type === 'history/cancelAction' || action.type === 'history/submitAction') {
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
