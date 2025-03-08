import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KeySelectionMap } from '~/types';

export interface TimelineSelection {
    keyframes: KeySelectionMap;
}

export type TimelineSelectionState = Partial<{
    [timelineId: string]: TimelineSelection;
}>;

const initialState: TimelineSelectionState = {};

const timelineSelectionSlice = createSlice({
    name: 'timelineSelection',
    initialState,
    reducers: {
        addKeyframesToSelection: (state, action: PayloadAction<{ 
            timelineId: string; 
            keyframeIds: string[] 
        }>) => {
            const { timelineId, keyframeIds } = action.payload;
            if (!timelineId || !keyframeIds) {
                console.warn('addKeyframesToSelection action missing required fields:', action);
                return;
            }

            const timelineSelection = state[timelineId] || {};
            const newSelection = { ...timelineSelection };
            keyframeIds.forEach((id) => {
                newSelection[id] = true;
            });
            state[timelineId] = newSelection;
        },

        removeKeyframesFromSelection: (state, action: PayloadAction<{ 
            timelineId: string; 
            keyframeIds: string[] 
        }>) => {
            const { timelineId, keyframeIds } = action.payload;
            if (!timelineId || !keyframeIds) {
                console.warn('removeKeyframesFromSelection action missing required fields:', action);
                return;
            }

            const timelineSelection = state[timelineId] || {};
            const newSelection = { ...timelineSelection };
            keyframeIds.forEach((id) => {
                delete newSelection[id];
            });
            state[timelineId] = newSelection;
        },

        toggleKeyframeSelection: (state, action: PayloadAction<{ 
            timelineId: string; 
            keyframeId: string 
        }>) => {
            const { timelineId, keyframeId } = action.payload;
            if (!timelineId || !keyframeId) {
                console.warn('toggleKeyframeSelection action missing required fields:', action);
                return;
            }

            const timelineSelection = state[timelineId] || {};
            state[timelineId] = {
                ...timelineSelection,
                [keyframeId]: !timelineSelection[keyframeId],
            };
        },

        clearTimelineSelection: (state, action: PayloadAction<{ timelineId: string }>) => {
            const { timelineId } = action.payload;
            if (!timelineId) {
                console.warn('clearTimelineSelection action missing timelineId:', action);
                return;
            }
            state[timelineId] = {};
        },
    },
});

export const {
    addKeyframesToSelection,
    removeKeyframesFromSelection,
    toggleKeyframeSelection,
    clearTimelineSelection,
} = timelineSelectionSlice.actions;

export default timelineSelectionSlice.reducer; 
