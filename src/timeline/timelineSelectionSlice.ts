import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TimelineSelection } from './timelineSelectionTypes';

export const initialTimelineSelectionState: Record<string, TimelineSelection> = {};

// Exporter le type pour être utilisé dans d'autres fichiers
export type TimelineSelectionState = Record<string, TimelineSelection>;

const timelineSelectionSlice = createSlice({
    name: 'timelineSelection',
    initialState: initialTimelineSelectionState,
    reducers: {
        clearTimelineSelection: (state, action: PayloadAction<{ timelineId: string }>) => {
            const { timelineId } = action.payload;
            if (state[timelineId]) {
                state[timelineId] = { keyframes: {} };
            }
        },
        toggleKeyframeSelection: (state, action: PayloadAction<{ timelineId: string, keyframeId: string }>) => {
            const { timelineId, keyframeId } = action.payload;
            if (!state[timelineId]) {
                state[timelineId] = { keyframes: {} };
            }
            const selection = state[timelineId];
            if (selection.keyframes[keyframeId]) {
                delete selection.keyframes[keyframeId];
            } else {
                selection.keyframes[keyframeId] = true;
            }
        },
        addKeyframesToSelection: (state, action: PayloadAction<{ timelineId: string, keyframeIds: string[] }>) => {
            const { timelineId, keyframeIds } = action.payload;
            if (!state[timelineId]) {
                state[timelineId] = { keyframes: {} };
            }
            const selection = state[timelineId];
            keyframeIds.forEach(id => {
                selection.keyframes[id] = true;
            });
        },
        removeKeyframesFromSelection: (state, action: PayloadAction<{ timelineId: string, keyframeIds: string[] }>) => {
            const { timelineId, keyframeIds } = action.payload;
            if (!state[timelineId]) return;

            const selection = state[timelineId];
            keyframeIds.forEach(id => {
                delete selection.keyframes[id];
            });
        }
    }
});

export const {
    clearTimelineSelection,
    toggleKeyframeSelection,
    addKeyframesToSelection,
    removeKeyframesFromSelection
} = timelineSelectionSlice.actions;

export default timelineSelectionSlice.reducer; 
