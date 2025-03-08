import { ActionType, createAction, getType } from "typesafe-actions";
import { Vec2 } from "~/util/math/vec2";

export interface SerializableVec2 {
	x: number;
	y: number;
}

export interface WorkspaceAreaState {
	compositionId: string;
	pan: SerializableVec2;
	scale: number;
	selectionRect: Rect | null;
}

export const initialCompositionWorkspaceAreaState: WorkspaceAreaState = {
	compositionId: "",
	pan: { x: 0, y: 0 },
	scale: 1,
	selectionRect: null,
};

export const workspaceAreaActions = {
	setFields: createAction("workspaceArea/SET_FIELDS", (action) => {
		return (fields: Partial<WorkspaceAreaState>) => {
			// Si le champ pan est un Vec2, le convertir en SerializableVec2
			if (fields.pan instanceof Vec2) {
				fields = {
					...fields,
					pan: { x: fields.pan.x, y: fields.pan.y }
				};
			}
			return action({ fields });
		};
	}),
};

type Action = ActionType<typeof workspaceAreaActions>;

export const compositionWorkspaceAreaReducer = (
	state = initialCompositionWorkspaceAreaState,
	action: Action,
): WorkspaceAreaState => {
	switch (action.type) {
		case getType(workspaceAreaActions.setFields): {
			const { fields } = action.payload;
			return { ...state, ...fields };
		}

		default:
			return state;
	}
};
