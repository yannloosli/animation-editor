import { AreaType } from "~/constants";
import { initialFlowAreaState } from "~/flow/state/flowAreaSlice";
import { initialState as initialTimelineAreaState } from "~/timeline/timelineAreaSlice";
import { AreaState } from "~/types/areaTypes";
import { initialCompositionWorkspaceAreaState } from "~/workspace/workspaceAreaReducer";

export const areaInitialStates: { [K in AreaType]: AreaState<K> } = {
	[AreaType.Timeline]: initialTimelineAreaState,
	[AreaType.Workspace]: initialCompositionWorkspaceAreaState,
	[AreaType.FlowEditor]: initialFlowAreaState,
	[AreaType.History]: {},
	[AreaType.Project]: {},
};
