import { configureStore } from "@reduxjs/toolkit";
import { createStore, Store } from "redux";
import { initialAreaState } from "~/area/state/areaReducer";
import { initialState as initialContextMenuState } from "~/contextMenu/contextMenuSlice";
import { createApplicationStateFromActionState } from "~/state/createApplicationStateFromActionState";
import reducers from "~/state/reducers";
import { getSavedActionState } from "~/state/saveState";
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
        compositionState: { type: "normal", list: [], index: -1, indexDirection: 1, action: null },
        compositionSelectionState: { type: "normal", list: [], index: -1, indexDirection: 1, action: null },
        flowState: { type: "normal", list: [], index: -1, indexDirection: 1, action: null },
        flowSelectionState: { type: "normal", list: [], index: -1, indexDirection: 1, action: null },
        contextMenu: { state: initialContextMenuState, action: null },
        project: { type: "normal", list: [], index: -1, indexDirection: 1, action: null },
        shapeState: { type: "normal", list: [], index: -1, indexDirection: 1, action: null },
        shapeSelectionState: { type: "normal", list: [], index: -1, indexDirection: 1, action: null },
        timelineState: { type: "normal", list: [], index: -1, indexDirection: 1, action: null },
        timelineSelectionState: { type: "normal", list: [], index: -1, indexDirection: 1, action: null },
        tool: initialToolState
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
export const store: Store<ApplicationState> = createStore(reducers, initialState);

// Créer le store RTK sans middleware
const rtkStoreWithoutMiddleware = configureStore({
    reducer: reducers,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: serializableCheckConfig
        })
});

// Créer le store RTK final avec le middleware de compatibilité
export const storeRTK = configureStore({
    reducer: reducers,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: serializableCheckConfig
        }).concat(createCompatibilityMiddleware(store, rtkStoreWithoutMiddleware))
});

// Types pour TypeScript
export type RootState = ReturnType<typeof storeRTK.getState>;
export type AppDispatch = typeof storeRTK.dispatch;
