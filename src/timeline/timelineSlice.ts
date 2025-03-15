import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getInsertIndex } from '~/util/alg/getInsertIndex';
import { TimelineSelection } from './timelineSelectionTypes';
import { Timeline, TimelineKeyframe, TimelineKeyframeControlPoint } from './timelineTypes';
import { applyTimelineIndexAndValueShifts } from './timelineUtils';

export interface TimelineState {
    [timelineId: string]: Timeline;
}

const initialState: TimelineState = {};

export { initialState as initialTimelineState };

const timelineSlice = createSlice({
    name: 'timeline',
    initialState,
    reducers: {
        setTimeline: (state: TimelineState, action: PayloadAction<{ timelineId: string; timeline: Timeline }>) => {
            const { timelineId, timeline } = action.payload;
            state[timelineId] = timeline;
        },
        removeTimeline: (state: TimelineState, action: PayloadAction<{ timelineId: string }>) => {
            const { timelineId } = action.payload;
            delete state[timelineId];
        },
        setKeyframe: (state: TimelineState, action: PayloadAction<{ timelineId: string; keyframe: TimelineKeyframe }>) => {
            const { timelineId, keyframe } = action.payload;
            const timeline = state[timelineId];
            if (!timeline) return;

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
        removeKeyframes: (state: TimelineState, action: PayloadAction<{ timelineId: string; keyframeIds: string[] }>) => {
            const { timelineId, keyframeIds } = action.payload;
            const set = new Set(keyframeIds);
            const timeline = state[timelineId];
            if (timeline) {
                timeline.keyframes = timeline.keyframes.filter((k) => !set.has(k.id));
            }
        },
        setYPan: (state: TimelineState, action: PayloadAction<{ timelineId: string; yPan: number }>) => {
            const { timelineId, yPan } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline._yPan = yPan;
            }
        },
        setYBounds: (state: TimelineState, action: PayloadAction<{ timelineId: string; yBounds: [number, number] | null }>) => {
            const { timelineId, yBounds } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline._yBounds = yBounds;
            }
        },
        setIndexAndValueShift: (state: TimelineState, action: PayloadAction<{
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
        setControlPointShift: (state: TimelineState, action: PayloadAction<{
            timelineId: string;
            controlPointShift: {
                indexDiff: number;
                direction: "left" | "right";
                indexShift: number;
                valueShift: number;
                yFac: number;
                shiftDown: boolean
            } | null
        }>) => {
            const { timelineId, controlPointShift } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline._controlPointShift = controlPointShift;
            }
        },
        setNewControlPointShift: (state: TimelineState, action: PayloadAction<{
            timelineId: string;
            newControlPointShift: {
                indexShift: number;
                valueShift: number;
                keyframeIndex: number;
                direction: "left" | "right";
            } | null
        }>) => {
            const { timelineId, newControlPointShift } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline._newControlPointShift = newControlPointShift;
            }
        },
        setDragSelectRect: (state: TimelineState, action: PayloadAction<{
            timelineId: string;
            rect: Rect | null
        }>) => {
            const { timelineId, rect } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline._dragSelectRect = rect;
            }
        },
        submitDragSelectRect: (state: TimelineState, action: PayloadAction<{
            timelineId: string;
            additiveSelection: boolean
        }>) => {
            // Cette action sera gérée par un middleware ou un thunk
            // car elle nécessite d'accéder à d'autres parties de l'état
        },
        submitIndexAndValueShift: (state: TimelineState, action: PayloadAction<{
            timelineId: string;
            selection: TimelineSelection
        }>) => {
            const { timelineId } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                // Appliquer les décalages aux keyframes sélectionnés
                if (timeline._indexShift !== null || timeline._valueShift !== null) {
                    applyTimelineIndexAndValueShifts(timeline, action.payload.selection);
                    timeline._indexShift = null;
                    timeline._valueShift = null;
                }
            }
        },
        applyControlPointShift: (state: TimelineState, action: PayloadAction<{
            timelineId: string;
            selection: TimelineSelection | undefined
        }>) => {
            const { timelineId } = action.payload;
            const timeline = state[timelineId];
            if (timeline && timeline._controlPointShift) {
                // Logique pour appliquer le décalage des points de contrôle
                // Cette logique complexe sera restaurée dans un middleware ou un thunk
                timeline._controlPointShift = null;
            }
        },
        shiftTimelineIndex: (state: TimelineState, action: PayloadAction<{
            timelineId: string;
            shiftBy: number
        }>) => {
            const { timelineId, shiftBy } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                timeline.keyframes = timeline.keyframes.map(keyframe => ({
                    ...keyframe,
                    index: keyframe.index + shiftBy
                }));
            }
        },
        setKeyframeReflectControlPoints: (state: TimelineState, action: PayloadAction<{
            timelineId: string;
            keyframeIndex: number;
            reflectControlPoints: boolean
        }>) => {
            const { timelineId, keyframeIndex, reflectControlPoints } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                const keyframe = timeline.keyframes.find(k => k.index === keyframeIndex);
                if (keyframe) {
                    keyframe.reflectControlPoints = reflectControlPoints;
                }
            }
        },
        setKeyframeControlPoint: (state: TimelineState, action: PayloadAction<{
            timelineId: string;
            keyframeIndex: number;
            direction: "left" | "right";
            controlPoint: TimelineKeyframeControlPoint | null
        }>) => {
            const { timelineId, keyframeIndex, direction, controlPoint } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                const keyframe = timeline.keyframes.find(k => k.index === keyframeIndex);
                if (keyframe) {
                    if (direction === "left") {
                        keyframe.controlPointLeft = controlPoint;
                    } else {
                        keyframe.controlPointRight = controlPoint;
                    }
                }
            }
        },
        removeKeyframeControlPoint: (state: TimelineState, action: PayloadAction<{
            timelineId: string;
            keyframeIndex: number;
            direction: 'left' | 'right'
        }>) => {
            const { timelineId, keyframeIndex, direction } = action.payload;
            const timeline = state[timelineId];
            if (timeline) {
                const keyframe = timeline.keyframes[keyframeIndex];
                if (keyframe) {
                    if (direction === 'right') {
                        keyframe.controlPointRight = null;
                    } else {
                        keyframe.controlPointLeft = null;
                    }
                }
            }
        },
    }
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
    setDragSelectRect,
    submitDragSelectRect,
    submitIndexAndValueShift,
    applyControlPointShift,
    shiftTimelineIndex,
    setKeyframeReflectControlPoints,
    setKeyframeControlPoint,
    removeKeyframeControlPoint,
} = timelineSlice.actions;

export default timelineSlice.reducer;
