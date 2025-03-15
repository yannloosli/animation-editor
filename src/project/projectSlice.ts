import { PayloadAction } from '@reduxjs/toolkit';
import { Composition } from "~/composition/compositionTypes";
import { createUndoableSlice } from "~/state/undoConfig";
import { Vec2 } from "~/util/math/vec2";

export interface ProjectState {
    compositions: { [compositionId: string]: Composition };
    dragComp: null | {
        compositionId: string;
        position: Vec2;
    };
    playback: null | {
        compositionId: number;
        frameIndex: number;
    };
    selectedCompositionId: string | null;
}

export const initialState: ProjectState = {
    compositions: {},
    dragComp: null,
    playback: null,
    selectedCompositionId: null
};

export { initialState as initialProjectState };

const reducers = {
    addComposition: (state: ProjectState, action: PayloadAction<{ composition: Composition }>) => {
        const { composition } = action.payload;
        state.compositions[composition.id] = composition;
    },
    removeComposition: (state: ProjectState, action: PayloadAction<{ compositionId: string }>) => {
        const { compositionId } = action.payload;
        delete state.compositions[compositionId];
        if (state.selectedCompositionId === compositionId) {
            state.selectedCompositionId = null;
        }
    },
    updateComposition: (state: ProjectState, action: PayloadAction<{ compositionId: string; updates: Partial<Composition> }>) => {
        const { compositionId, updates } = action.payload;
        if (state.compositions[compositionId]) {
            state.compositions[compositionId] = {
                ...state.compositions[compositionId],
                ...updates
            };
        }
    },
    setDragComposition: (state: ProjectState, action: PayloadAction<{ compositionId: string; position: Vec2 }>) => {
        const { compositionId, position } = action.payload;
        state.dragComp = {
            compositionId,
            position
        };
    },
    clearDragComposition: (state: ProjectState) => {
        state.dragComp = null;
    },
    setPlayback: (state: ProjectState, action: PayloadAction<{ compositionId: number; frameIndex: number } | null>) => {
        state.playback = action.payload;
    },
    setSelectedComposition: (state: ProjectState, action: PayloadAction<string | null>) => {
        state.selectedCompositionId = action.payload;
    },
    renameComposition: (state: ProjectState, action: PayloadAction<{ compositionId: string; name: string }>) => {
        const { compositionId, name } = action.payload;
        if (state.compositions[compositionId]) {
            state.compositions[compositionId].name = name;
        }
    }
};

export const projectSlice = createUndoableSlice(
    'project',
    initialState,
    reducers
);

// Export des actions
export const {
    addComposition,
    removeComposition,
    updateComposition,
    setDragComposition,
    clearDragComposition,
    setPlayback,
    setSelectedComposition,
    renameComposition
} = projectSlice.actions;

// Export du reducer
export const projectReducer = projectSlice.reducer;

// Sélecteurs
export const selectComposition = (state: { project: ProjectState }, compositionId: string) =>
    state.project.compositions[compositionId];

export const selectAllCompositions = (state: { project: ProjectState }) =>
    state.project.compositions;

export const selectSelectedCompositionId = (state: { project: ProjectState }) =>
    state.project.selectedCompositionId;

export const selectDragComp = (state: { project: ProjectState }) =>
    state.project.dragComp;

export const selectPlayback = (state: { project: ProjectState }) =>
    state.project.playback;
