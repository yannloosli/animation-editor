import { ActionType, getType } from "typesafe-actions";
import { timelineSelectionActions } from "~/timeline/timelineActions";
import { KeySelectionMap } from "~/types";

type Action = ActionType<typeof timelineSelectionActions>;

export interface TimelineSelection {
	keyframes: KeySelectionMap;
}

export type TimelineSelectionState = Partial<{
	[timelineId: string]: TimelineSelection;
}>;

export const initialTimelineSelectionState: TimelineSelectionState = {};

export const timelineSelectionReducer = (
	state = initialTimelineSelectionState,
	action: Action | { type: string },
): TimelineSelectionState => {
	// Gérer les actions redux-undo et autres actions sans payload
	if (!('payload' in action)) {
		return state;
	}

	switch (action.type) {
		case getType(timelineSelectionActions.clearTimelineSelection): {
			const { timelineId } = action.payload;
			return {
				...state,
				[timelineId]: {},
			};
		}

		case getType(timelineSelectionActions.toggleKeyframeSelection): {
			const { timelineId, keyframeId } = action.payload;
			const timelineSelection = state[timelineId] || {};

			return {
				...state,
				[timelineId]: {
					...timelineSelection,
					[keyframeId]: !timelineSelection[keyframeId],
				},
			};
		}

		case getType(timelineSelectionActions.addKeyframesToSelection): {
			const { timelineId, keyframeIds } = action.payload;
			const timelineSelection = state[timelineId] || {};

			const newSelection = { ...timelineSelection };
			keyframeIds.forEach((id) => {
				newSelection[id] = true;
			});

			return {
				...state,
				[timelineId]: newSelection,
			};
		}

		case getType(timelineSelectionActions.removeKeyframesFromSelection): {
			const { timelineId, keyframeIds } = action.payload;
			const timelineSelection = state[timelineId] || {};

			const newSelection = { ...timelineSelection };
			keyframeIds.forEach((id) => {
				delete newSelection[id];
			});

			return {
				...state,
				[timelineId]: newSelection,
			};
		}

		default:
			return state;
	}
};
