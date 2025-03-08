import { createAction } from "typesafe-actions";
import { store } from "~/state/store-init";
import { TimelineSelection } from "~/timeline/timelineSelectionReducer";
import { Timeline, TimelineKeyframe, TimelineKeyframeControlPoint } from "~/timeline/timelineTypes";
import * as timelineSelectionSlice from "./timelineSelectionSlice";
import * as timelineSlice from "./timelineSlice";

// Créer des wrappers pour les actions RTK qui correspondent à l'ancienne API
export const timelineActions = {
	setTimeline: createAction("timeline/SET_TIMELINE", (resolve) => {
		return (timelineId: string, timeline: Timeline) => {
			store.dispatch(timelineSlice.setTimeline({ timelineId, timeline }));
			return resolve({ timelineId, timeline });
		};
	}),

	removeTimeline: createAction("timeline/REMOVE_TIMELINE", (resolve) => {
		return (timelineId: string) => {
			store.dispatch(timelineSlice.removeTimeline({ timelineId }));
			return resolve({ timelineId });
		};
	}),

	setKeyframe: createAction("timeline/SET_KEYFRAME", (resolve) => {
		return (timelineId: string, keyframe: TimelineKeyframe) => {
			store.dispatch(timelineSlice.setKeyframe({ timelineId, keyframe }));
			return resolve({ timelineId, keyframe });
		};
	}),

	removeKeyframes: createAction("timeline/REMOVE_KEYFRAMES", (action) => {
		return (timelineId: string, keyframeIds: string[]) => {
			store.dispatch(timelineSlice.removeKeyframes({ timelineId, keyframeIds }));
			return action({ timelineId, keyframeIds });
		};
	}),

	setDragSelectRect: createAction("timeline/SET_DRAG_SELECT_RECT", (resolve) => {
		return (timelineId: string, rect: Rect) => resolve({ timelineId, rect });
	}),

	submitDragSelectRect: createAction("timeline/SUBMIT_DRAG_SELECT", (action) => {
		return (timelineId: string, additiveSelection: boolean) =>
			action({ timelineId, additiveSelection });
	}),

	setIndexAndValueShift: createAction("timeline/SET_SHIFT", (resolve) => {
		return (timelineId: string, indexShift: number, valueShift: number) => {
			store.dispatch(timelineSlice.setIndexAndValueShift({ timelineId, indexShift, valueShift }));
			return resolve({ timelineId, indexShift, valueShift });
		};
	}),

	setControlPointShift: createAction("timeline/SET_CP_SHIFT", (resolve) => {
		return (timelineId: string, controlPointShift: Timeline["_controlPointShift"]) => {
			store.dispatch(timelineSlice.setControlPointShift({ timelineId, controlPointShift }));
			return resolve({ timelineId, controlPointShift });
		};
	}),

	setNewControlPointShift: createAction("timeline/SET_NEW_CP_SHIFT", (resolve) => {
		return (timelineId: string, newControlPointShift: Timeline["_newControlPointShift"]) => {
			store.dispatch(timelineSlice.setNewControlPointShift({ timelineId, newControlPointShift }));
			return resolve({ timelineId, newControlPointShift });
		};
	}),

	applyControlPointShift: createAction("timeline/APPLY_CP_SHIFT", (resolve) => {
		return (timelineId: string, selection: TimelineSelection | undefined) => {
			store.dispatch(timelineSlice.applyControlPointShift({ timelineId, selection }));
			return resolve({ timelineId, selection });
		};
	}),

	submitIndexAndValueShift: createAction("timeline/SUBMIT_SHIFT", (resolve) => {
		return (timelineId: string, selection: TimelineSelection) => {
			store.dispatch(timelineSlice.submitIndexAndValueShift({ timelineId, selection }));
			return resolve({ timelineId, selection });
		};
	}),

	shiftTimelineIndex: createAction("timeline/SHIFT_TIMELINE_INDEX", (resolve) => {
		return (timelineId: string, shiftBy: number) => {
			store.dispatch(timelineSlice.shiftTimelineIndex({ timelineId, shiftBy }));
			return resolve({ timelineId, shiftBy });
		};
	}),

	setYBounds: createAction("timeline/SET_Y_BOUNDS", (resolve) => {
		return (timelineId: string, yBounds: [number, number] | null) => {
			store.dispatch(timelineSlice.setYBounds({ timelineId, yBounds }));
			return resolve({ timelineId, yBounds });
		};
	}),

	setYPan: createAction("timeline/SET_Y_PAN", (resolve) => {
		return (timelineId: string, yPan: number) => {
			store.dispatch(timelineSlice.setYPan({ timelineId, yPan }));
			return resolve({ timelineId, yPan });
		};
	}),

	setKeyframeReflectControlPoints: createAction(
		"timeline/SET_KEYFRAME_REFLECT_CONTROL_POINTS",
		(resolve) => {
			return (timelineId: string, keyframeIndex: number, reflectControlPoints: boolean) => {
				store.dispatch(timelineSlice.setKeyframeReflectControlPoints({ 
					timelineId, 
					keyframeIndex, 
					reflectControlPoints 
				}));
				return resolve({ timelineId, keyframeIndex, reflectControlPoints });
			};
		},
	),

	setKeyframeControlPoint: createAction("timeline/SET_KEYFRAME_CONTROL_POINT", (resolve) => {
		return (
			timelineId: string,
			keyframeIndex: number,
			direction: "left" | "right",
			controlPoint: TimelineKeyframeControlPoint | null,
		) => {
			store.dispatch(timelineSlice.setKeyframeControlPoint({ 
				timelineId, 
				keyframeIndex, 
				direction, 
				controlPoint 
			}));
			return resolve({ timelineId, controlPoint, keyframeIndex, direction });
		};
	}),
};

export const timelineSelectionActions = {
	addKeyframes: createAction("timeline_selection/ADD_KEYFRAMES", (action) => {
		return (timelineId: string, keyframeIds: string[]) => {
			store.dispatch(timelineSelectionSlice.addKeyframesToSelection({ timelineId, keyframeIds }));
			return action({ timelineId, keyframeIds });
		};
	}),

	removeKeyframes: createAction("timeline_selection/REMOVE_KEYFRAMES", (action) => {
		return (timelineId: string, keyframeIds: string[]) => {
			store.dispatch(timelineSelectionSlice.removeKeyframesFromSelection({ timelineId, keyframeIds }));
			return action({ timelineId, keyframeIds });
		};
	}),

	toggleKeyframe: createAction("timeline_selection/TOGGLE_KEYFRAME_SELECTION", (resolve) => {
		return (timelineId: string, keyframeId: string) => {
			store.dispatch(timelineSelectionSlice.toggleKeyframeSelection({ timelineId, keyframeId }));
			return resolve({ timelineId, keyframeId });
		};
	}),

	clear: createAction("timeline_selection/CLEAR_SELECTION", (resolve) => {
		return (timelineId: string) => {
			store.dispatch(timelineSelectionSlice.clearTimelineSelection({ timelineId }));
			return resolve({ timelineId });
		};
	}),
};
