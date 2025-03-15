import { store } from "~/state/store-init";

// Cette fonction crée des actions de compatibilité pour un slice basé sur les actions
export function createActionBasedCompatibilityActions(sliceName: string) {
    const dispatch = store.dispatch;

    return {
        startAction: (actionId: string) => {
            dispatch({
                type: `${sliceName}/startAction`,
                payload: { actionId }
            });
        },

        dispatchToAction: (actionId: string, actionToDispatch: any) => {
            dispatch({
                type: `${sliceName}/dispatchToAction`,
                payload: { actionId, actionToDispatch }
            });
        },

        dispatchBatchToAction: (actionId: string, actionBatch: any[]) => {
            dispatch({
                type: `${sliceName}/dispatchBatchToAction`,
                payload: { actionId, actionBatch }
            });
        },

        submitAction: (actionId: string) => {
            dispatch({
                type: `${sliceName}/submitAction`,
                payload: { actionId }
            });
        },

        cancelAction: (actionId: string) => {
            dispatch({
                type: `${sliceName}/cancelAction`,
                payload: { actionId }
            });
        },

        handleNormalAction: (action: any) => {
            dispatch({
                type: `${sliceName}/handleNormalAction`,
                payload: action
            });
        }
    };
}

// Exemple d'utilisation :
// export const actionBasedActions = createActionBasedCompatibilityActions("myActionBased"); 
