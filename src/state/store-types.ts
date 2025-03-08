import { Store } from "redux";
import { AreaReducerState } from "~/area/state/areaSlice";
import { CompositionState } from "~/composition/compositionReducer";
import { CompositionSelectionState } from "~/composition/compositionSelectionReducer";
import { ContextMenuState } from "~/contextMenu/contextMenuSlice";
import { FlowState } from "~/flow/state/flowReducers";
import { FlowSelectionState } from "~/flow/state/flowSelectionReducer";
import { ProjectState } from "~/project/projectReducer";
import { ShapeState } from "~/shape/shapeReducer";
import { ShapeSelectionState } from "~/shape/shapeSelectionReducer";
import { TimelineState } from "~/timeline/timelineReducer";
import { TimelineSelectionState } from "~/timeline/timelineSelectionReducer";
import { ToolState } from "~/toolbar/toolSlice";
import { ActionBasedState } from "./history/actionBasedReducer";
import { HistoryState } from "./history/historyReducer";

export type ApplicationState = {
    area: ActionBasedState<AreaReducerState>;
    compositionState: HistoryState<CompositionState>;
    compositionSelectionState: HistoryState<CompositionSelectionState>;
    flowState: HistoryState<FlowState>;
    flowSelectionState: HistoryState<FlowSelectionState>;
    contextMenu: ActionBasedState<ContextMenuState>;
    project: HistoryState<ProjectState>;
    shapeState: HistoryState<ShapeState>;
    shapeSelectionState: HistoryState<ShapeSelectionState>;
    timelineState: HistoryState<TimelineState>;
    timelineSelectionState: HistoryState<TimelineSelectionState>;
    tool: ActionBasedState<ToolState>;
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
};

export type StoreType = Store<ApplicationState>; 
