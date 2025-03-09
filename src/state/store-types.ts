import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { Store } from "redux";
import { StateWithHistory } from "redux-undo";
import { AreaReducerState } from "~/area/state/areaSlice";
import { CompositionSelectionState } from "~/composition/compositionSelectionReducer";
import { CompositionState } from "~/composition/compositionSlice";
import { ContextMenuState } from "~/contextMenu/contextMenuSlice";
import { FlowState } from "~/flow/state/flowReducers";
import { FlowSelectionState } from "~/flow/state/flowSelectionReducer";
import { ProjectState } from "~/project/projectReducer";
import { ShapeState } from "~/shape/shapeReducer";
import { ShapeSelectionState } from "~/shape/shapeSelectionReducer";
import { TimelineState } from "~/timeline/timelineReducer";
import { TimelineSelectionState } from "~/timeline/timelineSelectionReducer";
import { ToolState } from "~/toolbar/toolSlice";
import { WorkspaceAreaState } from "~/workspace/workspaceAreaReducer";
import { ActionBasedState } from "./history/actionBasedReducer";
import { HistoryState } from "./history/historySlice";

// Type pour les actions de base de redux-undo
export interface UndoableAction {
  type: string;
}

// Type pour les actions avec payload
export interface PayloadAction<T = any> extends UndoableAction {
  payload: T;
}

export type ApplicationState = {
    area: ActionBasedState<AreaReducerState>;
    compositionState: StateWithHistory<CompositionState>;
    compositionSelectionState: StateWithHistory<CompositionSelectionState>;
    flowState: StateWithHistory<FlowState>;
    flowSelectionState: StateWithHistory<FlowSelectionState>;
    contextMenu: ActionBasedState<ContextMenuState>;
    project: StateWithHistory<ProjectState>;
    shapeState: StateWithHistory<ShapeState>;
    shapeSelectionState: StateWithHistory<ShapeSelectionState>;
    timelineState: StateWithHistory<TimelineState>;
    timelineSelectionState: StateWithHistory<TimelineSelectionState>;
    tool: ActionBasedState<ToolState>;
    workspace: ActionBasedState<WorkspaceAreaState>;
    history: HistoryState;
};

export type ActionState = {
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
};

export type RootState = ApplicationState;

export type StoreType = Store<ApplicationState>;
export type AppDispatch = Dispatch<AnyAction>; 
