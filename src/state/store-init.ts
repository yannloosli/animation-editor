import { configureStore, Middleware } from "@reduxjs/toolkit";
import { registerAreaTypeHandlers } from "~/area/handlers/areaTypeHandlers";
import { initialState as initialAreaState } from "~/area/state/areaSlice";
import { initialCompositionSelectionState } from "~/composition/compositionSelectionSlice";
import { registerCompositionMiddleware } from "~/composition/middleware";
import { contextMenuMiddleware } from "~/contextMenu/contextMenuMiddleware";
import { initialState as initialContextMenuState } from "~/contextMenu/contextMenuSlice";
import { initialFlowSelectionState } from "~/flow/state/flowSelectionSlice";
import { initialFlowState } from "~/flow/state/flowSlice";
import { initialShapeSelectionState } from "~/shape/shapeSelectionSlice";
import { initialState as initialShapeState } from "~/shape/shapeSlice";
import rootReducer from "~/state/reducers";
import { getSavedActionState } from "~/state/saveState";
import { initialState as initialTimelineAreaState } from "~/timeline/timelineAreaSlice";
import { registerTimelineMiddleware } from "~/timeline/timelineMiddleware";
import { initialTimelineSelectionState } from "~/timeline/timelineSelectionSlice";
import { initialTimelineState } from "~/timeline/timelineSlice";
import { initialState as initialToolState } from "~/toolbar/toolSlice";
import { initialCompositionWorkspaceAreaState } from "~/workspace/workspaceAreaReducer";
import type { ApplicationState } from "./store-types";

// État initial par défaut
const defaultInitialState: ApplicationState = {
    area: { state: initialAreaState, action: null },
    compositionState: {
        past: [],
        present: {
            compositions: {
                "default": {
                    id: "default",
                    name: "Default Composition",
                    layers: [],
                    width: 800,
                    height: 600,
                    length: 100,
                    frameIndex: 0
                }
            },
            layers: {},
            properties: {},
            compositionLayerIdToComposition: {}
        },
        future: [],
        _latestUnfiltered: {
            compositions: {
                "default": {
                    id: "default",
                    name: "Default Composition",
                    layers: [],
                    width: 800,
                    height: 600,
                    length: 100,
                    frameIndex: 0
                }
            },
            layers: {},
            properties: {},
            compositionLayerIdToComposition: {}
        },
        group: null,
        index: 0,
        limit: 50
    },
    compositionSelectionState: {
        past: [],
        present: initialCompositionSelectionState,
        future: [],
        _latestUnfiltered: initialCompositionSelectionState,
        group: null,
        index: 0,
        limit: 50
    },
    flowState: {
        past: [],
        present: initialFlowState,
        future: [],
        _latestUnfiltered: initialFlowState,
        group: null,
        index: 0,
        limit: 50
    },
    flowSelectionState: {
        past: [],
        present: initialFlowSelectionState,
        future: [],
        _latestUnfiltered: initialFlowSelectionState,
        group: null,
        index: 0,
        limit: 50
    },
    contextMenu: { state: initialContextMenuState, action: null },
    project: {
        past: [],
        present: {
            compositions: {
                default: {
                    id: "default",
                    name: "Default Composition",
                    layers: [],
                    width: 800,
                    height: 600,
                    length: 100,
                    frameIndex: 0
                }
            },
            dragComp: null,
            playback: null,
            selectedCompositionId: "default"
        },
        future: [],
        _latestUnfiltered: {
            compositions: {
                default: {
                    id: "default",
                    name: "Default Composition",
                    layers: [],
                    width: 800,
                    height: 600,
                    length: 100,
                    frameIndex: 0
                }
            },
            dragComp: null,
            playback: null,
            selectedCompositionId: "default"
        },
        group: null,
        index: 0,
        limit: 50
    },
    shapeState: {
        past: [],
        present: initialShapeState,
        future: [],
        _latestUnfiltered: initialShapeState,
        group: null,
        index: 0,
        limit: 50
    },
    shapeSelectionState: {
        past: [],
        present: initialShapeSelectionState,
        future: [],
        _latestUnfiltered: initialShapeSelectionState,
        group: null,
        index: 0,
        limit: 50
    },
    timelineState: {
        past: [],
        present: initialTimelineState,
        future: [],
        _latestUnfiltered: initialTimelineState,
        group: null,
        index: 0,
        limit: 50
    },
    timelineSelectionState: {
        past: [],
        present: initialTimelineSelectionState,
        future: [],
        _latestUnfiltered: initialTimelineSelectionState,
        group: null,
        index: 0,
        limit: 50
    },
    timelineArea: { state: initialTimelineAreaState, action: null },
    tool: { state: initialToolState, action: null },
    workspace: {
        state: {
            ...initialCompositionWorkspaceAreaState,
            pan: {
                x: initialCompositionWorkspaceAreaState.pan.x,
                y: initialCompositionWorkspaceAreaState.pan.y
            }
        },
        action: null
    },
    history: {
        type: "normal",
        list: [],
        index: -1,
        indexDirection: 1,
        action: null
    },
    penTool: {
        state: {},
        action: null
    }
};

// Configuration du store avec typage explicite
export const store = configureStore({
    reducer: rootReducer as any,
    preloadedState: getSavedActionState() || defaultInitialState,
    middleware: (getDefaultMiddleware) => {
        const middleware: Array<Middleware<{}, ApplicationState>> = [];

        // Middleware de débogage avec typage correct
        const debugMiddleware: Middleware<{}, ApplicationState> = (store) => (next) => (action) => {
            console.log('[DEBUG] Action reçue:', action);
            const result = next(action);
            console.log('[DEBUG] Nouvel état:', store.getState().contextMenu);
            return result;
        };

        middleware.push(debugMiddleware);
        middleware.push(contextMenuMiddleware as Middleware<{}, ApplicationState>);

        // Enregistrer le middleware timeline
        registerTimelineMiddleware(middleware);

        // Enregistrer le middleware composition
        registerCompositionMiddleware(middleware);

        return getDefaultMiddleware().concat(middleware);
    },
});

// Vérification de l'état initial du store
console.log('Initial store state:', store.getState());
console.log('Area state:', JSON.stringify(store.getState().area, null, 2));
console.log('Area layout:', JSON.stringify(store.getState().area.state?.layout, null, 2));
console.log('Area rootId:', store.getState().area.state?.rootId);
console.log('Area areas:', JSON.stringify(store.getState().area.state?.areas, null, 2));

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Enregistrer les gestionnaires d'événements pour les types de zones
registerAreaTypeHandlers();
