import { AnyAction, Dispatch, Middleware } from "@reduxjs/toolkit";
import { StoreType } from "./store-types";

// Type guard pour vérifier si une action est une AnyAction
const isAnyAction = (action: unknown): action is AnyAction => {
    return typeof action === 'object' && action !== null && 'type' in action;
};

// Middleware pour synchroniser les actions entre les deux stores
export const createCompatibilityMiddleware = (oldStore: StoreType, rtkStore: StoreType): Middleware<Dispatch<AnyAction>, any, any> => 
    () => (next) => (action: unknown) => {
        if (!isAnyAction(action)) {
            return next(action);
        }

        // Si l'action vient du store RTK, la dispatcher dans l'ancien store
        if (action.type.startsWith("toolkit/") || action.type.startsWith("tool/")) {
            oldStore.dispatch(action);
        }
        
        // Si l'action vient de l'ancien store, la dispatcher dans le store RTK
        if (!action.type.startsWith("toolkit/") && !action.type.startsWith("tool/")) {
            rtkStore.dispatch(action);
        }

        return next(action);
    }; 
