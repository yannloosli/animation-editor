import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SerializableVec2 } from "~/util/math/types";
import { Vec2 } from "~/util/math/vec2";
import { WorkspaceAreaState, initialWorkspaceState } from "./workspaceTypes";

const workspaceSlice = createSlice({
    name: "workspace",
    initialState: initialWorkspaceState,
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
    resetView
} = workspaceSlice.actions;

export const workspaceReducer = workspaceSlice.reducer;
export default workspaceSlice; 
