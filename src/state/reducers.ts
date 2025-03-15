import { combineReducers } from "redux";
import { areaSlice, AreaSliceStateWithTemp } from "~/area/state/areaSlice";
import { compositionSelectionSlice, CompositionSelectionState } from "~/composition/compositionSelectionSlice";
import { compositionSlice, CompositionState } from "~/composition/compositionSlice";
import { contextMenuSlice, ContextMenuState } from "~/contextMenu/contextMenuSlice";
import { Diff } from "~/diff/diffs";
import { flowSelectionSlice, FlowSelectionState } from "~/flow/state/flowSelectionSlice";
import { flowSlice, FlowState } from "~/flow/state/flowSlice";
import { projectSlice, ProjectState } from "~/project/projectSlice";
import { shapeSelectionSlice, ShapeSelectionState } from "~/shape/shapeSelectionSlice";
import { shapeSlice, ShapeState } from "~/shape/shapeSlice";
import { timelineAreaSlice, TimelineAreaStateWithTemp } from "~/timeline/timelineAreaSlice";
import timelineSelectionReducer from "~/timeline/timelineSelectionSlice";
import { TimelineSelection } from "~/timeline/timelineSelectionTypes";
import timelineReducer, { TimelineState } from "~/timeline/timelineSlice";
import toolSlice, { ToolState } from "~/toolbar/toolSlice";
import { penToolSlice, PenToolState } from "~/workspace/penTool/penToolSlice";
import workspaceSlice, { WorkspaceStateWithTemp } from "~/workspace/workspaceSlice";
import { createHistorySlice } from "./history/historySlice";
import { UndoableState } from "./undoConfig";

export interface HistoryState<S = unknown> {
    type: "normal" | "selection";
    list: Array<{
        state: S;
        name: string;
        modifiedRelated: boolean;
        allowIndexShift: boolean;
        diffs: Diff[];
    }>;
    index: number;
    indexDirection: -1 | 1;
    action: null | {
        id: string;
        state: S;
    };
}

declare global {
    interface ApplicationState {
        area: AreaSliceStateWithTemp;
        compositionState: UndoableState<CompositionState>;
        compositionSelectionState: UndoableState<CompositionSelectionState>;
        flowState: UndoableState<FlowState>;
        flowSelectionState: UndoableState<FlowSelectionState>;
        contextMenu: ContextMenuState;
        project: UndoableState<ProjectState>;
        shapeState: UndoableState<ShapeState>;
        shapeSelectionState: UndoableState<ShapeSelectionState>;
        timelineState: UndoableState<TimelineState>;
        timelineSelectionState: UndoableState<TimelineSelection>;
        timelineArea: TimelineAreaStateWithTemp;
        tool: ToolState;
        workspace: WorkspaceStateWithTemp;
        history: HistoryState;
        penTool: PenToolState;
    }

    interface ActionState {
        area: AreaSliceStateWithTemp;
        compositionState: CompositionState;
        compositionSelectionState: CompositionSelectionState;
        flowState: FlowState;
        flowSelectionState: FlowSelectionState;
        contextMenu: ContextMenuState;
        project: ProjectState;
        shapeState: ShapeState;
        shapeSelectionState: ShapeSelectionState;
        timelineState: TimelineState;
        timelineSelectionState: TimelineSelection;
        timelineArea: TimelineAreaStateWithTemp;
        tool: ToolState;
        workspace: WorkspaceStateWithTemp;
        penTool: PenToolState;
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
    compositionState: compositionSlice.reducer,
    compositionSelectionState: compositionSelectionSlice.reducer,
    flowState: flowSlice.reducer,
    flowSelectionState: flowSelectionSlice.reducer,
    project: projectSlice.reducer,
    shapeState: shapeSlice.reducer,
    shapeSelectionState: shapeSelectionSlice.reducer,
    timelineState: timelineReducer,
    timelineSelectionState: timelineSelectionReducer,

    // États basés sur les actions
    area: areaSlice.reducer,
    contextMenu: contextMenuSlice.reducer,
    tool: toolSlice,
    workspace: workspaceSlice.reducer,
    timelineArea: timelineAreaSlice.reducer,
    penTool: penToolSlice.reducer,

    // Nouvel état d'historique
    history: createHistorySlice("history", {}, (state) => state).reducer,
});

export default rootReducer;
