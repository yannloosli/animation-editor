import { initialState as initialAreaState } from "~/area/state/areaSlice";
import { initialCompositionSelectionState } from "~/composition/compositionSelectionSlice";
import { initialState as initialContextMenuState } from "~/contextMenu/contextMenuSlice";
import { initialFlowSelectionState } from "~/flow/state/flowSelectionSlice";
import { initialFlowState } from "~/flow/state/flowSlice";
import { initialShapeSelectionState } from "~/shape/shapeSelectionSlice";
import { initialState as initialShapeState } from "~/shape/shapeSlice";
import { initialState as initialTimelineAreaState } from "~/timeline/timelineAreaSlice";
import { initialTimelineSelectionState } from "~/timeline/timelineSelectionSlice";
import { initialTimelineState } from "~/timeline/timelineSlice";
import { initialState as initialToolState } from "~/toolbar/toolSlice";
import { initialCompositionWorkspaceAreaState } from "~/workspace/workspaceAreaReducer";
import { ApplicationState } from "./types";

// État initial par défaut pour l'application
export const defaultInitialState: ApplicationState = {
    area: { state: initialAreaState, action: null },
    compositionState: {
        past: [],
        present: {
            compositions: {
                "default": {
                    id: "default",
                    name: "Default Composition",
                    layers: [],
                    width: 800,
                    height: 600,
                    length: 100,
                    frameIndex: 0
                }
            },
            layers: {},
            properties: {},
            compositionLayerIdToComposition: {}
        },
        future: [],
        _latestUnfiltered: {
            compositions: {
                "default": {
                    id: "default",
                    name: "Default Composition",
                    layers: [],
                    width: 800,
                    height: 600,
                    length: 100,
                    frameIndex: 0
                }
            },
            layers: {},
            properties: {},
            compositionLayerIdToComposition: {}
        },
        group: null,
        index: 0,
        limit: 50
    },
    compositionSelectionState: {
        past: [],
        present: initialCompositionSelectionState,
        future: [],
        _latestUnfiltered: initialCompositionSelectionState,
        group: null,
        index: 0,
        limit: 50
    },
    flowState: {
        past: [],
        present: initialFlowState,
        future: [],
        _latestUnfiltered: initialFlowState,
        group: null,
        index: 0,
        limit: 50
    },
    flowSelectionState: {
        past: [],
        present: initialFlowSelectionState,
        future: [],
        _latestUnfiltered: initialFlowSelectionState,
        group: null,
        index: 0,
        limit: 50
    },
    contextMenu: { state: initialContextMenuState, action: null },
    project: {
        past: [],
        present: {
            compositions: {
                default: {
                    id: "default",
                    name: "Default Composition",
                    layers: [],
                    width: 800,
                    height: 600,
                    length: 100,
                    frameIndex: 0
                }
            },
            dragComp: null,
            playback: null,
            selectedCompositionId: "default"
        },
        future: [],
        _latestUnfiltered: {
            compositions: {
                default: {
                    id: "default",
                    name: "Default Composition",
                    layers: [],
                    width: 800,
                    height: 600,
                    length: 100,
                    frameIndex: 0
                }
            },
            dragComp: null,
            playback: null,
            selectedCompositionId: "default"
        },
        group: null,
        index: 0,
        limit: 50
    },
    shapeState: {
        past: [],
        present: initialShapeState,
        future: [],
        _latestUnfiltered: initialShapeState,
        group: null,
        index: 0,
        limit: 50
    },
    shapeSelectionState: {
        past: [],
        present: initialShapeSelectionState,
        future: [],
        _latestUnfiltered: initialShapeSelectionState,
        group: null,
        index: 0,
        limit: 50
    },
    timelineState: {
        past: [],
        present: initialTimelineState,
        future: [],
        _latestUnfiltered: initialTimelineState,
        group: null,
        index: 0,
        limit: 50
    },
    timelineSelectionState: {
        past: [],
        present: initialTimelineSelectionState,
        future: [],
        _latestUnfiltered: initialTimelineSelectionState,
        group: null,
        index: 0,
        limit: 50
    },
    timelineArea: { state: initialTimelineAreaState, action: null },
    tool: { state: initialToolState, action: null },
    workspace: {
        state: {
            ...initialCompositionWorkspaceAreaState,
            pan: {
                x: initialCompositionWorkspaceAreaState.pan.x,
                y: initialCompositionWorkspaceAreaState.pan.y
            }
        },
        action: null
    },
    history: {
        type: "normal",
        list: [],
        index: -1,
        indexDirection: 1,
        action: null
    },
    penTool: {
        state: {},
        action: null
    }
}; 
