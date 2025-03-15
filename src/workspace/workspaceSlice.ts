import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SerializableVec2 } from "~/util/math/types";
import { Vec2 } from "~/util/math/vec2";
import { WorkspaceAreaState, initialWorkspaceState } from "./workspaceTypes";

export interface WorkspaceStateWithTemp extends WorkspaceAreaState {
    temporaryAction: null | {
        id: string;
        state: WorkspaceAreaState;
    };
}

const initialState: WorkspaceStateWithTemp = {
    ...initialWorkspaceState,
    temporaryAction: null
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setFields: (state, action: PayloadAction<Partial<WorkspaceAreaState>>) => {
            const payload = { ...action.payload };

            // Convertir le Vec2 en objet simple si présent
            if (payload.pan instanceof Vec2) {
                payload.pan = { x: payload.pan.x, y: payload.pan.y };
            }

            return { ...state, ...payload };
        },
        setPan: (state, action: PayloadAction<Vec2 | SerializableVec2>) => {
            const pan = action.payload instanceof Vec2
                ? { x: action.payload.x, y: action.payload.y }
                : action.payload;
            state.pan = pan;
        },
        setScale: (state, action: PayloadAction<number>) => {
            state.scale = action.payload;
        },
        setCompositionId: (state, action: PayloadAction<string>) => {
            state.compositionId = action.payload;
        },
        setSelectionRect: (state, action: PayloadAction<Rect | null>) => {
            state.selectionRect = action.payload;
        },
        clearSelectionRect: (state) => {
            state.selectionRect = null;
        },
        resetView: (state) => {
            state.pan = { x: 0, y: 0 };
            state.scale = 1;
        },
        startTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (!state.temporaryAction) {
                state.temporaryAction = {
                    id: action.payload.actionId,
                    state: {
                        compositionId: state.compositionId,
                        pan: { ...state.pan },
                        scale: state.scale,
                        selectionRect: state.selectionRect ? { ...state.selectionRect } : null
                    }
                };
            }
        },
        commitTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (state.temporaryAction && state.temporaryAction.id === action.payload.actionId) {
                const { state: tempState } = state.temporaryAction;
                state.compositionId = tempState.compositionId;
                state.pan = tempState.pan;
                state.scale = tempState.scale;
                state.selectionRect = tempState.selectionRect;
                state.temporaryAction = null;
            }
        },
        cancelTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (state.temporaryAction && state.temporaryAction.id === action.payload.actionId) {
                state.temporaryAction = null;
            }
        }
    }
});

export const {
    setFields,
    setPan,
    setScale,
    setCompositionId,
    setSelectionRect,
    clearSelectionRect,
    resetView,
    startTemporaryAction,
    commitTemporaryAction,
    cancelTemporaryAction
} = workspaceSlice.actions;

export const workspaceReducer = workspaceSlice.reducer;
export default workspaceSlice; 
