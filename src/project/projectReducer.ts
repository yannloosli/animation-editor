import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Composition } from "~/composition/compositionTypes";
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
}

export const initialProjectState: ProjectState = {
	compositions: {},
	dragComp: null,
	playback: null,
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
		},
		setDragComposition: (state, action: PayloadAction<{ compositionId: string; position: Vec2 }>) => {
			const { compositionId, position } = action.payload;
			state.dragComp = { compositionId, position };
		},
		clearDragComposition: (state) => {
			state.dragComp = null;
		}
	}
});

export const projectActions = projectSlice.actions;
export const projectReducer = projectSlice.reducer;
