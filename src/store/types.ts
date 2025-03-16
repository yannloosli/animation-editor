import { Action, Dispatch } from "@reduxjs/toolkit";
import { Store } from "redux";
import { StateWithHistory } from "redux-undo";
import { AreaState } from "~/area/types";
import { CompositionSelectionState } from "~/composition/compositionSelectionSlice";
import { CompositionState } from "~/composition/compositionSlice";
import { ContextMenuState } from "~/contextMenu/contextMenuSlice";
import { FlowSelectionState } from "~/flow/state/flowSelectionSlice";
import { FlowState } from "~/flow/state/flowSlice";
import { ProjectState } from "~/project/projectSlice";
import { ShapeSelectionState } from "~/shape/shapeSelectionSlice";
import { ShapeState } from "~/shape/shapeSlice";
import { ActionBasedState } from "~/state/history/actionBasedSlice";
import { HistoryState } from "~/state/history/historySlice";
import { TimelineAreaState } from "~/timeline/timelineAreaSlice";
import { TimelineSelection } from "~/timeline/timelineSelectionTypes";
import { TimelineState } from "~/timeline/timelineSlice";
import { ToolState } from "~/toolbar/toolSlice";
import { WorkspaceAreaState } from "~/workspace/workspaceAreaReducer";

// Type pour les actions de base
export interface UndoableAction {
    type: string;
}

// Type pour les actions avec payload
export interface PayloadAction<T = any> extends UndoableAction {
    payload: T;
}

// Type pour TimelineSelectionState qui accepte des index de type chaîne
export type TimelineSelectionState = {
    [timelineId: string]: TimelineSelection;
};

// Type pour l'état de l'application
export type ApplicationState = {
    area: ActionBasedState<AreaState>;
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
    timelineArea: ActionBasedState<TimelineAreaState>;
    tool: ActionBasedState<ToolState>;
    workspace: ActionBasedState<WorkspaceAreaState>;
    history: HistoryState<unknown>;
    penTool: ActionBasedState<any>;
};

// Type pour l'état des actions
export type ActionState = {
    area: AreaState & {
        temporaryAction: any | null;
        status: 'idle' | 'loading' | 'error';
        error: any | null;
    };
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
    tool: ToolState & {
        selected: string;
        selectedInGroup: Record<string, string>;
        openGroupIndex: number | null;
        temporaryAction: any | null;
    };
    workspace: WorkspaceAreaState;
    penTool: any;
};

// Alias pour RootState
export type RootState = ApplicationState;

// Type pour le store
export type StoreType = Store<ApplicationState>;

// Type pour le dispatch
export type AppDispatch = Dispatch<Action>; 
