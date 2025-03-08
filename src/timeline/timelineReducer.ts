import { ActionType, getType } from "typesafe-actions";
import { timelineActions } from "~/timeline/timelineActions";
import { Timeline, TimelineKeyframe } from "~/timeline/timelineTypes";
import { applyTimelineIndexAndValueShifts } from "~/timeline/timelineUtils";
import { getInsertIndex } from "~/util/alg/getInsertIndex";
import { modifyItemsInMap } from "~/util/mapUtils";

type Action = ActionType<typeof timelineActions>;

export interface TimelineState {
	[timelineId: string]: Timeline;
}

export const initialTimelineState: TimelineState = {};

export const timelineReducer = (
	state = initialTimelineState,
	action?: Action | { type: string },
): TimelineState => {
	// Vérifier si l'action est définie
	if (!action) {
		return state;
	}

	// Gérer les actions redux-undo et autres actions sans payload
	if (!('payload' in action)) {
		return state;
	}

	// Vérifier que le timelineId est présent dans le payload
	if (!action.payload || !action.payload.timelineId) {
		console.warn('Timeline action missing timelineId:', action);
		return state;
	}

	switch (action.type) {
		case getType(timelineActions.addTimeline): {
			const { timeline, timelineId } = action.payload;
			if (!timeline) {
				console.warn('addTimeline action missing timeline:', action);
				return state;
			}
			return {
				...state,
				[timelineId]: timeline,
			};
		}

		case getType(timelineActions.removeTimeline): {
			const { timelineId } = action.payload;
			const newState = { ...state };
			delete newState[timelineId];
			return newState;
		}

		case getType(timelineActions.setTimeline): {
			const { timeline, timelineId } = action.payload;
			if (!timeline) {
				console.warn('setTimeline action missing timeline:', action);
				return state;
			}
			return {
				...state,
				[timelineId]: timeline,
			};
		}

		case getType(timelineActions.setKeyframe): {
			const { keyframe, timelineId } = action.payload;
			if (!keyframe) {
				console.warn('setKeyframe action missing keyframe:', action);
				return state;
			}

			const timeline = state[timelineId];
			if (!timeline) {
				console.warn('Timeline not found:', timelineId);
				return state;
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

			return {
				...state,
				[timelineId]: {
					...timeline,
					keyframes,
				},
			};
		}

		case getType(timelineActions.removeKeyframes): {
			const { timelineId, keyframeIds } = action.payload;
			const set = new Set(keyframeIds);
			return modifyItemsInMap(state, timelineId, (timeline) => ({
				...timeline,
				keyframes: timeline.keyframes.filter((k) => !set.has(k.id)),
			}));
		}

		case getType(timelineActions.setYPan): {
			const { timelineId, yPan } = action.payload;

			return {
				...state,
				[timelineId]: {
					...state[timelineId],
					_yPan: yPan,
				},
			};
		}

		case getType(timelineActions.setYBounds): {
			const { timelineId, yBounds } = action.payload;

			return {
				...state,
				[timelineId]: {
					...state[timelineId],
					_yBounds: yBounds,
				},
			};
		}

		case getType(timelineActions.setIndexAndValueShift): {
			const { timelineId, indexShift, valueShift } = action.payload;
			return {
				...state,
				[timelineId]: {
					...state[timelineId],
					_indexShift: indexShift,
					_valueShift: valueShift,
				},
			};
		}

		case getType(timelineActions.setControlPointShift): {
			const { timelineId, controlPointShift } = action.payload;
			return {
				...state,
				[timelineId]: {
					...state[timelineId],
					_controlPointShift: controlPointShift,
				},
			};
		}

		case getType(timelineActions.setNewControlPointShift): {
			const { timelineId, newControlPointShift } = action.payload;
			return {
				...state,
				[timelineId]: {
					...state[timelineId],
					_newControlPointShift: newControlPointShift,
				},
			};
		}

		case getType(timelineActions.applyControlPointShift): {
			const { timelineId, selection } = action.payload;
			return {
				...state,
				[timelineId]: applyTimelineIndexAndValueShifts(state[timelineId], selection),
			};
		}

		case getType(timelineActions.submitIndexAndValueShift): {
			const { timelineId, selection } = action.payload;
			const timeline = applyTimelineIndexAndValueShifts(state[timelineId], selection);
			return {
				...state,
				[timelineId]: timeline,
			};
		}

		case getType(timelineActions.shiftTimelineIndex): {
			const { timelineId, shiftBy } = action.payload;
			const timeline = state[timelineId];
			return {
				...state,
				[timelineId]: {
					...timeline,
					keyframes: timeline.keyframes.map((k) => ({
						...k,
						index: k.index + shiftBy,
					})),
				},
			};
		}

		case getType(timelineActions.setKeyframeReflectControlPoints): {
			const { timelineId, keyframeIndex, reflectControlPoints } = action.payload;

			const timeline = state[timelineId];

			return {
				...state,
				[timelineId]: {
					...timeline,
					keyframes: timeline.keyframes.map((keyframe, index) => {
						if (keyframeIndex !== index) {
							return keyframe;
						}

						return { ...keyframe, reflectControlPoints };
					}),
				},
			};
		}

		case getType(timelineActions.setKeyframeControlPoint): {
			const { timelineId, keyframeIndex, controlPoint, direction } = action.payload;
			const newKeyframe: TimelineKeyframe = { ...state[timelineId].keyframes[keyframeIndex] };

			if (direction === "right") {
				newKeyframe.controlPointRight = controlPoint;
			} else {
				newKeyframe.controlPointLeft = controlPoint;
			}

			const timeline = state[timelineId];

			return {
				...state,
				[timelineId]: {
					...timeline,
					keyframes: timeline.keyframes.map((keyframe, index) => {
						if (keyframeIndex !== index) {
							return keyframe;
						}

						return newKeyframe;
					}),
				},
			};
		}

		default:
			return state;
	}
};
