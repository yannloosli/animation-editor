import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { Vec2 } from "~/util/math/vec2";
import { initialCompositionWorkspaceAreaState, WorkspaceAreaState } from "../workspaceAreaReducer";
import { workspaceMiddleware } from "../workspaceMiddleware";
import workspaceSlice from "../workspaceSlice";

interface TestState {
    workspace: WorkspaceAreaState;
}

describe("Workspace Slice", () => {
    let store: EnhancedStore<TestState>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                workspace: workspaceSlice.reducer
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(workspaceMiddleware as any)
        });
    });

    it("should handle initial state", () => {
        const state = store.getState().workspace;
        expect(state.pan).toEqual({
            x: initialCompositionWorkspaceAreaState.pan.x,
            y: initialCompositionWorkspaceAreaState.pan.y
        });
    });

    it("should handle setFields with Vec2", () => {
        const newPan = Vec2.new(100, 200);
        store.dispatch(workspaceSlice.actions.setFields({ pan: newPan }));
        
        const state = store.getState().workspace;
        expect(state.pan).toEqual({ x: 100, y: 200 });
    });

    it("should handle old typesafe-actions through middleware", () => {
        const newPan = Vec2.new(300, 400);
        store.dispatch({
            type: "workspaceArea/SET_FIELDS",
            payload: { fields: { pan: newPan } }
        });
        
        const state = store.getState().workspace;
        expect(state.pan).toEqual({ x: 300, y: 400 });
    });

    it("should handle multiple setFields calls", () => {
        const pan1 = Vec2.new(100, 200);
        const pan2 = Vec2.new(300, 400);
        
        store.dispatch(workspaceSlice.actions.setFields({ pan: pan1 }));
        store.dispatch(workspaceSlice.actions.setFields({ pan: pan2 }));
        
        const state = store.getState().workspace;
        expect(state.pan).toEqual({ x: 300, y: 400 });
    });

    it("should handle mixed old and new actions", () => {
        const pan1 = Vec2.new(100, 200);
        const pan2 = Vec2.new(300, 400);
        
        // Old action
        store.dispatch({
            type: "workspaceArea/SET_FIELDS",
            payload: { fields: { pan: pan1 } }
        });
        
        // New action
        store.dispatch(workspaceSlice.actions.setFields({ pan: pan2 }));
        
        const state = store.getState().workspace;
        expect(state.pan).toEqual({ x: 300, y: 400 });
    });
}); 
