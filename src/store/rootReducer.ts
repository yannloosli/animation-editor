import { combineReducers } from "redux";
import { areaSlice } from "~/area/state/areaSlice";
import { compositionSelectionSlice } from "~/composition/compositionSelectionSlice";
import { compositionSlice } from "~/composition/compositionSlice";
import { contextMenuSlice } from "~/contextMenu/contextMenuSlice";
import { flowSelectionSlice } from "~/flow/state/flowSelectionSlice";
import { flowSlice } from "~/flow/state/flowSlice";
import { projectSlice } from "~/project/projectSlice";
import { shapeSelectionSlice } from "~/shape/shapeSelectionSlice";
import { shapeSlice } from "~/shape/shapeSlice";
import { createHistorySlice } from "~/state/history/historySlice";
import { timelineAreaSlice } from "~/timeline/timelineAreaSlice";
import timelineSelectionReducer from "~/timeline/timelineSelectionSlice";
import timelineReducer from "~/timeline/timelineSlice";
import toolSlice from "~/toolbar/toolSlice";
import { penToolSlice } from "~/workspace/penTool/penToolSlice";
import workspaceSlice from "~/workspace/workspaceSlice";

// Combiner tous les reducers
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
