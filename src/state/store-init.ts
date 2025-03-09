import { configureStore } from "@reduxjs/toolkit";
import { registerAreaTypeHandlers } from "~/area/handlers/areaTypeHandlers";
import { initialState as initialAreaState } from "~/area/state/areaSlice";
import { initialCompositionState } from "~/composition/compositionReducer";
import { initialCompositionSelectionState } from "~/composition/compositionSelectionReducer";
import { contextMenuMiddleware } from "~/contextMenu/contextMenuMiddleware";
import { initialState as initialContextMenuState } from "~/contextMenu/contextMenuSlice";
import { initialFlowState } from "~/flow/state/flowReducers";
import { initialFlowSelectionState } from "~/flow/state/flowSelectionReducer";
import { initialShapeState } from "~/shape/shapeReducer";
import { initialShapeSelectionState } from "~/shape/shapeSelectionReducer";
import { createApplicationStateFromActionState } from "~/state/createApplicationStateFromActionState";
import rootReducer from "~/state/reducers";
import { getSavedActionState } from "~/state/saveState";
import { initialTimelineState } from "~/timeline/timelineReducer";
import { initialTimelineSelectionState } from "~/timeline/timelineSelectionReducer";
import { initialState as initialToolState } from "~/toolbar/toolSlice";
import { initialCompositionWorkspaceAreaState } from "~/workspace/workspaceAreaReducer";
import { workspaceMiddleware } from "~/workspace/workspaceMiddleware";
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
            past: [],
            present: initialCompositionState,
            future: [],
            _latestUnfiltered: initialCompositionState,
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
                playback: null
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
                playback: null
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
        }
    };
}

// Configuration commune pour la sérialisation
const serializableCheckConfig = {
    ignoredActions: [
        "history/START_ACTION",
        "history/DISPATCH_TO_ACTION",
        "history/DISPATCH_BATCH_TO_ACTION",
        "history/SUBMIT_ACTION",
        "history/CANCEL_ACTION"
    ],
    ignoredPaths: [
        "history.diffs",
        "history.action",
        "history.list",
        "contextMenu.state.position",
        "area.state.areaToOpen.position"
    ]
};

// Enregistrer les gestionnaires de type d'area
registerAreaTypeHandlers();

// Créer le store RTK avec le middleware de compatibilité
export const store = configureStore({
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

        return [
            contextMenuMiddleware as any,
            ...middleware,
            workspaceMiddleware as any
        ];
    }
});

// Vérification de l'état initial du store
console.log('Initial store state:', store.getState());

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
