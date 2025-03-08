import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Vec2 } from "~/util/math/vec2";
import { WorkspaceAreaState, initialCompositionWorkspaceAreaState } from "./workspaceAreaReducer";

const workspaceSlice = createSlice({
    name: "workspace",
    initialState: {
        ...initialCompositionWorkspaceAreaState,
        pan: { x: initialCompositionWorkspaceAreaState.pan.x, y: initialCompositionWorkspaceAreaState.pan.y }
    },
    reducers: {
        setFields: (state, action: PayloadAction<Partial<WorkspaceAreaState>>) => {
            const payload = { ...action.payload };
            
            // Convertir le Vec2 en objet simple si présent
            if (payload.pan instanceof Vec2) {
                payload.pan = { x: payload.pan.x, y: payload.pan.y };
            }

            return { ...state, ...payload };
        }
    }
});

export const { setFields } = workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;
export default workspaceSlice; 
