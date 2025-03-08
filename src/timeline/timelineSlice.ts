import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getInsertIndex } from '~/util/alg/getInsertIndex';
import { TimelineSelection } from './timelineSelectionReducer';
import { Timeline, TimelineKeyframe, TimelineKeyframeControlPoint } from './timelineTypes';
import { applyTimelineIndexAndValueShifts } from './timelineUtils';

export interface TimelineState {
    [timelineId: string]: Timeline;
}

const initialState: TimelineState = {};

const timelineSlice = createSlice({
    name: 'timeline',
    initialState,
    reducers: {
        setTimeline: (state, action: PayloadAction<{ timelineId: string; timeline: Timeline }>) => {
            const { timelineId, timeline } = action.payload;
            if (!timeline) {
                console.warn('setTimeline action missing timeline:', action);
                return;
            }
            state[timelineId] = timeline;
        },

        removeTimeline: (state, action: PayloadAction<{ timelineId: string }>) => {
            const { timelineId } = action.payload;
            delete state[timelineId];
        },

        setKeyframe: (state, action: PayloadAction<{ timelineId: string; keyframe: TimelineKeyframe }>) => {
            const { timelineId, keyframe } = action.payload;
            if (!keyframe) {
                console.warn('setKeyframe action missing keyframe:', action);
                return;
            }

            const timeline = state[timelineId];
            if (!timeline) {
                console.warn('Timeline not found:', timelineId);
                return;
            }

            const keyframes = [...timeline.keyframes];
            const keyframeIds = keyframes.map((k) => k.id);

            const currentIndex = keyframeIds.indexOf(keyframe.id);
            if (currentIndex !== -1) {
                keyframes.splice(currentIndex, 1);
            }

            const indexOfKeyframeAtIndex = keyframes.map((k) => k.index).indexOf(keyframe.index);
            if (indexOfKeyframeAtIndex !== -1) {
                keyframes.splice(indexOfKeyframeAtIndex, 1);
            }

            const insertIndex = getInsertIndex(keyframes, keyframe, (a, b) => a.index - b.index);
            keyframes.splice(insertIndex, 0, keyframe);

            timeline.keyframes = keyframes;
        },

        removeKeyframes: (state, action: PayloadAction<{ timelineId: string; keyframeIds: string[] }>) => {
            const { timelineId, keyframeIds } = action.payload;
            const set = new Set(keyframeIds);
            const timeline = state[timelineId];
            if (timeline) {
                timeline.keyframes = timeline.keyframes.filter((k) => !set.has(k.id));
            }
        },

        setYPan: (state, action: PayloadAction<{ timelineId: string; yPan: number }>) => {
            const { timelineId, yPan } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline._yPan = yPan;
            }
        },

        setYBounds: (state, action: PayloadAction<{ timelineId: string; yBounds: [number, number] | null }>) => {
            const { timelineId, yBounds } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline._yBounds = yBounds;
            }
        },

        setIndexAndValueShift: (state, action: PayloadAction<{ 
            timelineId: string; 
            indexShift: number; 
            valueShift: number 
        }>) => {
            const { timelineId, indexShift, valueShift } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline._indexShift = indexShift;
                timeline._valueShift = valueShift;
            }
        },

        setControlPointShift: (state, action: PayloadAction<{ 
            timelineId: string; 
            controlPointShift: Timeline['_controlPointShift'] 
        }>) => {
            const { timelineId, controlPointShift } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline._controlPointShift = controlPointShift;
            }
        },

        setNewControlPointShift: (state, action: PayloadAction<{ 
            timelineId: string; 
            newControlPointShift: Timeline['_newControlPointShift'] 
        }>) => {
            const { timelineId, newControlPointShift } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline._newControlPointShift = newControlPointShift;
            }
        },

        applyControlPointShift: (state, action: PayloadAction<{ 
            timelineId: string; 
            selection: TimelineSelection | undefined 
        }>) => {
            const { timelineId, selection } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                const updatedTimeline = applyTimelineIndexAndValueShifts(timeline, selection);
                state[timelineId] = updatedTimeline;
            }
        },

        submitIndexAndValueShift: (state, action: PayloadAction<{ 
            timelineId: string; 
            selection: TimelineSelection 
        }>) => {
            const { timelineId, selection } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                const updatedTimeline = applyTimelineIndexAndValueShifts(timeline, selection);
                state[timelineId] = updatedTimeline;
            }
        },

        shiftTimelineIndex: (state, action: PayloadAction<{ timelineId: string; shiftBy: number }>) => {
            const { timelineId, shiftBy } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline.keyframes = timeline.keyframes.map((k) => ({
                    ...k,
                    index: k.index + shiftBy,
                }));
            }
        },

        setKeyframeReflectControlPoints: (state, action: PayloadAction<{ 
            timelineId: string; 
            keyframeIndex: number; 
            reflectControlPoints: boolean 
        }>) => {
            const { timelineId, keyframeIndex, reflectControlPoints } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline.keyframes = timeline.keyframes.map((keyframe, index) => {
                    if (keyframeIndex !== index) {
                        return keyframe;
                    }
                    return { ...keyframe, reflectControlPoints };
                });
            }
        },

        setKeyframeControlPoint: (state, action: PayloadAction<{ 
            timelineId: string; 
            keyframeIndex: number; 
            direction: 'left' | 'right'; 
            controlPoint: TimelineKeyframeControlPoint | null 
        }>) => {
            const { timelineId, keyframeIndex, direction, controlPoint } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                const keyframe = timeline.keyframes[keyframeIndex];
                if (keyframe) {
                    if (direction === 'right') {
                        keyframe.controlPointRight = controlPoint;
                    } else {
                        keyframe.controlPointLeft = controlPoint;
                    }
                }
            }
        },
    },
});

export const { 
    setTimeline,
    removeTimeline,
    setKeyframe,
    removeKeyframes,
    setYPan,
    setYBounds,
    setIndexAndValueShift,
    setControlPointShift,
    setNewControlPointShift,
    applyControlPointShift,
    submitIndexAndValueShift,
    shiftTimelineIndex,
    setKeyframeReflectControlPoints,
    setKeyframeControlPoint,
} = timelineSlice.actions;

export default timelineSlice.reducer; 
