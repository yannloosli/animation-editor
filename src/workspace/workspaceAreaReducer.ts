import { workspaceReducer } from "./workspaceSlice";
import { WorkspaceAreaState, initialWorkspaceState } from "./workspaceTypes";

export type { WorkspaceAreaState };
export const initialCompositionWorkspaceAreaState = initialWorkspaceState;

// Reducer de compatibilité pour l'ancien système
export const compositionWorkspaceAreaReducer = (
	state = initialWorkspaceState,
	action: any
): WorkspaceAreaState => {
	// Utiliser le nouveau reducer Redux Toolkit
	return workspaceReducer(state, action);
};
