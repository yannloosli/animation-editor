import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Composition } from "~/composition/compositionTypes";
import { Vec2 } from "~/util/math/vec2";

export interface SerializableVec2 {
	x: number;
	y: number;
}

export interface ProjectState {
	compositions: { [compositionId: string]: Composition };
	dragComp: null | {
		compositionId: string;
		position: SerializableVec2;
	};
	playback: null | {
		compositionId: number;
		frameIndex: number;
	};
	selectedCompositionId: string | null;
}

export const initialProjectState: ProjectState = {
	compositions: {},
	dragComp: null,
	playback: null,
	selectedCompositionId: null
};

const projectSlice = createSlice({
	name: 'project',
	initialState: initialProjectState,
	reducers: {
		addComposition: (state, action: PayloadAction<{ composition: Composition }>) => {
			const { composition } = action.payload;
			state.compositions[composition.id] = composition;
		},
		removeComposition: (state, action: PayloadAction<{ compositionId: string }>) => {
			const { compositionId } = action.payload;
			delete state.compositions[compositionId];
			if (state.selectedCompositionId === compositionId) {
				state.selectedCompositionId = null;
			}
		},
		updateComposition: (state, action: PayloadAction<{ compositionId: string; updates: Partial<Composition> }>) => {
			const { compositionId, updates } = action.payload;
			if (state.compositions[compositionId]) {
				state.compositions[compositionId] = {
					...state.compositions[compositionId],
					...updates
				};
			}
		},
		setDragComposition: (state, action: PayloadAction<{ compositionId: string; position: Vec2 | SerializableVec2 }>) => {
			const { compositionId, position } = action.payload;
			state.dragComp = { 
				compositionId, 
				position: position instanceof Vec2 ? { x: position.x, y: position.y } : position 
			};
		},
		clearDragComposition: (state) => {
			state.dragComp = null;
		},
		setPlayback: (state, action: PayloadAction<{ compositionId: number; frameIndex: number } | null>) => {
			state.playback = action.payload;
		},
		setSelectedComposition: (state, action: PayloadAction<string | null>) => {
			state.selectedCompositionId = action.payload;
		},
		renameComposition: (state, action: PayloadAction<{ compositionId: string; name: string }>) => {
			const { compositionId, name } = action.payload;
			if (state.compositions[compositionId]) {
				state.compositions[compositionId].name = name;
			}
		}
	}
});

export const projectActions = projectSlice.actions;
export const projectReducer = projectSlice.reducer;

// Sélecteurs
export const selectCompositions = (state: { project: ProjectState }) => state.project.compositions;
export const selectComposition = (state: { project: ProjectState }, compositionId: string) => 
	state.project.compositions[compositionId];
export const selectSelectedComposition = (state: { project: ProjectState }) => 
	state.project.selectedCompositionId ? state.project.compositions[state.project.selectedCompositionId] : null;
