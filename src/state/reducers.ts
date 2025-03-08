import { combineReducers } from "redux";
import areaReducer, { AreaReducerState, initialState as initialAreaState } from "~/area/state/areaSlice";
import { compositionReducer, CompositionState } from "~/composition/compositionReducer";
import { compositionSelectionReducer, CompositionSelectionState } from "~/composition/compositionSelectionReducer";
import { contextMenuReducer } from "~/contextMenu/contextMenuReducer";
import { ContextMenuState, initialState as initialContextMenuState } from "~/contextMenu/contextMenuSlice";
import { flowReducer, FlowState } from "~/flow/state/flowReducers";
import { flowSelectionReducer, FlowSelectionState } from "~/flow/state/flowSelectionReducer";
import { projectReducer, ProjectState } from "~/project/projectReducer";
import { shapeReducer, ShapeState } from "~/shape/shapeReducer";
import { shapeSelectionReducer, ShapeSelectionState } from "~/shape/shapeSelectionReducer";
import timelineSelectionReducer, { TimelineSelectionState } from "~/timeline/timelineSelectionSlice";
import timelineReducer, { TimelineState } from "~/timeline/timelineSlice";
import toolReducer, { initialState as initialToolState, ToolState } from "~/toolbar/toolSlice";
import { initialCompositionWorkspaceAreaState, WorkspaceAreaState } from "~/workspace/workspaceAreaReducer";
import { workspaceReducer } from "~/workspace/workspaceSlice";
import { ActionBasedState, createActionBasedReducer } from "./history/actionBasedReducer";
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
		tool: ActionBasedState<ToolState>;
		workspace: ActionBasedState<WorkspaceAreaState>;
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
	area: createActionBasedReducer(initialAreaState, areaReducer),
	contextMenu: createActionBasedReducer(initialContextMenuState, contextMenuReducer),
	tool: createActionBasedReducer(initialToolState, toolReducer),
	workspace: createActionBasedReducer(initialCompositionWorkspaceAreaState, workspaceReducer),
});

export default rootReducer;
