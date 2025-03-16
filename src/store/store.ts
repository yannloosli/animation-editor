import { configureStore, Middleware } from "@reduxjs/toolkit";
import { registerAreaTypeHandlers } from "~/area/handlers/areaTypeHandlers";
import { registerCompositionMiddleware } from "~/composition/middleware";
import { contextMenuMiddleware } from "~/contextMenu/contextMenuMiddleware";
import { getSavedActionState } from "~/state/saveState";
import { registerTimelineMiddleware } from "~/timeline/timelineMiddleware";
import { defaultInitialState } from "./initialState";
import rootReducer from "./rootReducer";
import { ApplicationState } from "./types";

// Configuration du store avec Redux Toolkit
export const store = configureStore({
    reducer: rootReducer,
    preloadedState: getSavedActionState() || defaultInitialState,
    middleware: (getDefaultMiddleware) => {
        const middleware: Array<Middleware<{}, ApplicationState>> = [];

        // Middleware de débogage
        const debugMiddleware: Middleware<{}, ApplicationState> = (store) => (next) => (action) => {
            // Possibilité d'ajouter de la logique de débogage ici
            const result = next(action);
            return result;
        };

        middleware.push(debugMiddleware);
        middleware.push(contextMenuMiddleware as Middleware<{}, ApplicationState>);

        // Enregistrer les middlewares spécifiques
        registerTimelineMiddleware(middleware);
        registerCompositionMiddleware(middleware);

        return getDefaultMiddleware({
            serializableCheck: {
                // Configuration pour gérer les structures non-sérialisables
                ignoredActions: ["history/RECORD_ACTION"],
                ignoredPaths: ["history.diffs"],
            },
        }).concat(middleware);
    },
});

// Enregistrer les gestionnaires d'événements pour les types de zones
registerAreaTypeHandlers();

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks typés pour useSelector et useDispatch
export const getState = store.getState;
export const dispatch = store.dispatch; 
