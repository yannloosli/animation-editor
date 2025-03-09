import { combineReducers } from "redux";
import { areaSlice } from "~/area/state/areaSlice";
import { AreaReducerState } from "~/area/types";
import { compositionSelectionReducer, CompositionSelectionState } from "~/composition/compositionSelectionSlice";
import { compositionReducer, CompositionState } from "~/composition/compositionSlice";
import contextMenuReducer, { ContextMenuState, initialState as initialContextMenuState } from "~/contextMenu/contextMenuSlice";
import { flowReducer, FlowState } from "~/flow/state/flowReducers";
import { flowSelectionReducer, FlowSelectionState } from "~/flow/state/flowSelectionReducer";
import { projectReducer, ProjectState } from "~/project/projectReducer";
import { shapeSelectionReducer, ShapeSelectionState } from "~/shape/shapeSelectionReducer";
import { shapeReducer, ShapeState } from "~/shape/shapeSlice";
import timelineAreaReducer, { initialState as initialTimelineAreaState, TimelineAreaState } from "~/timeline/timelineAreaSlice";
import timelineSelectionReducer, { TimelineSelectionState } from "~/timeline/timelineSelectionSlice";
import timelineReducer, { TimelineState } from "~/timeline/timelineSlice";
import toolReducer, { initialState as initialToolState, ToolState } from "~/toolbar/toolSlice";
import { initialCompositionWorkspaceAreaState, WorkspaceAreaState } from "~/workspace/workspaceAreaReducer";
import { workspaceReducer } from "~/workspace/workspaceSlice";
import { ActionBasedState, createActionBasedReducer } from "./history/actionBasedReducer";
import historyReducer from "./history/historySlice";
import { createSelectionUndoableConfig, createUndoableReducer, UndoableState } from "./undoConfig";

declare global {
	interface ApplicationState {
		area: ActionBasedState<AreaReducerState>;
		compositionState: UndoableState<CompositionState>;
		compositionSelectionState: UndoableState<CompositionSelectionState>;
		flowState: UndoableState<FlowState>;
		flowSelectionState: UndoableState<FlowSelectionState>;
		contextMenu: ActionBasedState<ContextMenuState>;
		project: UndoableState<ProjectState>;
		shapeState: UndoableState<ShapeState>;
		shapeSelectionState: UndoableState<ShapeSelectionState>;
		timelineState: UndoableState<TimelineState>;
		timelineSelectionState: UndoableState<TimelineSelectionState>;
		timelineArea: ActionBasedState<TimelineAreaState>;
		tool: ActionBasedState<ToolState>;
		workspace: ActionBasedState<WorkspaceAreaState>;
		history: any;
	}

	interface ActionState {
		area: AreaReducerState;
		compositionState: CompositionState;
		compositionSelectionState: CompositionSelectionState;
		flowState: FlowState;
		flowSelectionState: FlowSelectionState;
		contextMenu: ContextMenuState;
		project: ProjectState;
		shapeState: ShapeState;
		shapeSelectionState: ShapeSelectionState;
		timelineState: TimelineState;
		timelineSelectionState: TimelineSelectionState;
		timelineArea: TimelineAreaState;
		tool: ToolState;
		workspace: WorkspaceAreaState;
	}

	type MapApplicationState<StateProps, OwnProps = {}> = (
		state: ApplicationState,
		ownProps: OwnProps,
	) => StateProps;

	type MapActionState<StateProps, OwnProps = {}> = (
		state: ActionState,
		ownProps: OwnProps,
	) => StateProps;
}

const rootReducer = combineReducers({
	// États avec historique utilisant redux-undo
	compositionState: createUndoableReducer(compositionReducer),
	compositionSelectionState: createUndoableReducer(compositionSelectionReducer, createSelectionUndoableConfig("compositionState")),
	flowState: createUndoableReducer(flowReducer),
	flowSelectionState: createUndoableReducer(flowSelectionReducer, createSelectionUndoableConfig("flowState")),
	project: createUndoableReducer(projectReducer),
	shapeState: createUndoableReducer(shapeReducer),
	shapeSelectionState: createUndoableReducer(shapeSelectionReducer, createSelectionUndoableConfig("shapeState")),
	timelineState: createUndoableReducer(timelineReducer),
	timelineSelectionState: createUndoableReducer(timelineSelectionReducer, createSelectionUndoableConfig("timelineState")),

	// États basés sur les actions
	area: createActionBasedReducer(areaSlice.getInitialState(), areaSlice.reducer),
	contextMenu: createActionBasedReducer(initialContextMenuState, contextMenuReducer),
	tool: createActionBasedReducer(initialToolState, toolReducer),
	workspace: createActionBasedReducer(initialCompositionWorkspaceAreaState, workspaceReducer),
	timelineArea: createActionBasedReducer(initialTimelineAreaState, timelineAreaReducer),

	// Nouvel état d'historique
	history: historyReducer,
});

export default rootReducer;
