import { configureStore } from "@reduxjs/toolkit";
import { createStore, Store } from "redux";
import { initialState as initialAreaState } from "~/area/state/areaSlice";
import { initialCompositionState } from "~/composition/compositionReducer";
import { initialCompositionSelectionState } from "~/composition/compositionSelectionReducer";
import { contextMenuMiddleware } from "~/contextMenu/contextMenuMiddleware";
import { initialState as initialContextMenuState } from "~/contextMenu/contextMenuSlice";
import { initialFlowState } from "~/flow/state/flowReducers";
import { initialFlowSelectionState } from "~/flow/state/flowSelectionReducer";
import { initialProjectState } from "~/project/projectReducer";
import { initialShapeState } from "~/shape/shapeReducer";
import { initialShapeSelectionState } from "~/shape/shapeSelectionReducer";
import { createApplicationStateFromActionState } from "~/state/createApplicationStateFromActionState";
import rootReducer from "~/state/reducers";
import { getSavedActionState } from "~/state/saveState";
import { initialTimelineState } from "~/timeline/timelineReducer";
import { initialTimelineSelectionState } from "~/timeline/timelineSelectionReducer";
import { initialState as initialToolState } from "~/toolbar/toolSlice";
import { createCompatibilityMiddleware } from "./compatibilityMiddleware";
import { ApplicationState } from "./store-types";

// Récupérer l'état initial sauvegardé
let initialState: ApplicationState | undefined;
const savedActionState = getSavedActionState();
if (savedActionState) {
    initialState = createApplicationStateFromActionState(savedActionState);
} else {
    initialState = {
        area: { state: initialAreaState, action: null },
        compositionState: { 
            type: "normal", 
            list: [{ 
                state: initialCompositionState,
                modifiedRelated: false,
                name: "Initial state",
                allowIndexShift: false,
                diffs: []
            }], 
            index: 0, 
            indexDirection: 1, 
            action: null 
        },
        compositionSelectionState: { 
            type: "normal", 
            list: [{ 
                state: initialCompositionSelectionState,
                modifiedRelated: false,
                name: "Initial state",
                allowIndexShift: false,
                diffs: []
            }], 
            index: 0, 
            indexDirection: 1, 
            action: null 
        },
        flowState: { 
            type: "normal", 
            list: [{ 
                state: initialFlowState,
                modifiedRelated: false,
                name: "Initial state",
                allowIndexShift: false,
                diffs: []
            }], 
            index: 0, 
            indexDirection: 1, 
            action: null 
        },
        flowSelectionState: { 
            type: "normal", 
            list: [{ 
                state: initialFlowSelectionState,
                modifiedRelated: false,
                name: "Initial state",
                allowIndexShift: false,
                diffs: []
            }], 
            index: 0, 
            indexDirection: 1, 
            action: null 
        },
        contextMenu: { state: initialContextMenuState, action: null },
        project: { 
            type: "normal", 
            list: [{ 
                state: initialProjectState,
                modifiedRelated: false,
                name: "Initial state",
                allowIndexShift: false,
                diffs: []
            }], 
            index: 0, 
            indexDirection: 1, 
            action: null 
        },
        shapeState: { 
            type: "normal", 
            list: [{ 
                state: initialShapeState,
                modifiedRelated: false,
                name: "Initial state",
                allowIndexShift: false,
                diffs: []
            }], 
            index: 0, 
            indexDirection: 1, 
            action: null 
        },
        shapeSelectionState: { 
            type: "normal", 
            list: [{ 
                state: initialShapeSelectionState,
                modifiedRelated: false,
                name: "Initial state",
                allowIndexShift: false,
                diffs: []
            }], 
            index: 0, 
            indexDirection: 1, 
            action: null 
        },
        timelineState: { 
            type: "normal", 
            list: [{ 
                state: initialTimelineState,
                modifiedRelated: false,
                name: "Initial state",
                allowIndexShift: false,
                diffs: []
            }], 
            index: 0, 
            indexDirection: 1, 
            action: null 
        },
        timelineSelectionState: { 
            type: "normal", 
            list: [{ 
                state: initialTimelineSelectionState,
                modifiedRelated: false,
                name: "Initial state",
                allowIndexShift: false,
                diffs: []
            }], 
            index: 0, 
            indexDirection: 1, 
            action: null 
        },
        tool: { state: initialToolState, action: null }
    };
}

// Configuration commune pour la sérialisation
const serializableCheckConfig = {
    ignoredActions: [
        "history/RECORD_ACTION",
        "history/DISPATCH_TO_ACTION",
        "history/DISPATCH_BATCH_TO_ACTION",
        "history/SUBMIT_ACTION",
        "history/CANCEL_ACTION"
    ],
    ignoredPaths: [
        "history.diffs",
        "history.action",
        "history.list",
        "contextMenu.state.position"
    ]
};

// Créer l'ancien store
export const store: Store<ApplicationState> = createStore(rootReducer, initialState);

// Créer le store RTK sans middleware
const rtkStoreWithoutMiddleware = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: serializableCheckConfig
        })
});

// Créer le store RTK final avec le middleware de compatibilité
export const storeRTK = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) => {
        const middleware = getDefaultMiddleware({
            serializableCheck: {
                ...serializableCheckConfig,
                warnAfter: 128
            },
            immutableCheck: {
                warnAfter: 128
            }
        });

        return middleware
            .concat(createCompatibilityMiddleware(store, rtkStoreWithoutMiddleware))
            .concat(contextMenuMiddleware as any);
    }
});

// Synchroniser l'état initial entre les deux stores
store.dispatch({ type: "@@INIT" });
storeRTK.dispatch({ type: "@@INIT" });

// Types pour TypeScript
export type RootState = ReturnType<typeof storeRTK.getState>;
export type AppDispatch = typeof storeRTK.dispatch;
