import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface TimelineAreaState {
    compositionId: string;
    viewBounds: [number, number];
    panY: number;
    graphEditorOpen?: boolean;
    moveLayers: null | {
        layerId: string;
        type: "above" | "below" | "invalid";
    };
    dragSelectRect: null | {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    trackDragSelectRect: null | {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    pickWhipLayerParent: null | {
        fromId: string;
        to: { x: number; y: number };
    };
}

export interface TimelineAreaStateWithTemp extends TimelineAreaState {
    temporaryAction: null | {
        id: string;
        state: TimelineAreaState;
    };
}

export const initialState: TimelineAreaStateWithTemp = {
    compositionId: "",
    viewBounds: [0, 1],
    panY: 0,
    graphEditorOpen: false,
    moveLayers: null,
    dragSelectRect: null,
    trackDragSelectRect: null,
    pickWhipLayerParent: null,
    temporaryAction: null
};

export const timelineAreaSlice = createSlice({
    name: "timelineArea",
    initialState,
    reducers: {
        setViewBounds: (state, action: PayloadAction<[number, number]>) => {
            state.viewBounds = action.payload;
        },
        setPanY: (state, action: PayloadAction<number>) => {
            state.panY = action.payload;
        },
        setFields: (state, action: PayloadAction<Partial<TimelineAreaState>>) => {
            Object.assign(state, action.payload);
        },
        toggleGraphEditorOpen: (state) => {
            state.graphEditorOpen = !state.graphEditorOpen;
        },
        startTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (!state.temporaryAction) {
                state.temporaryAction = {
                    id: action.payload.actionId,
                    state: {
                        compositionId: state.compositionId,
                        viewBounds: [...state.viewBounds],
                        panY: state.panY,
                        graphEditorOpen: state.graphEditorOpen,
                        moveLayers: state.moveLayers ? { ...state.moveLayers } : null,
                        dragSelectRect: state.dragSelectRect ? { ...state.dragSelectRect } : null,
                        trackDragSelectRect: state.trackDragSelectRect ? { ...state.trackDragSelectRect } : null,
                        pickWhipLayerParent: state.pickWhipLayerParent ? { ...state.pickWhipLayerParent } : null
                    }
                };
            }
        },
        commitTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (state.temporaryAction && state.temporaryAction.id === action.payload.actionId) {
                const { state: tempState } = state.temporaryAction;
                state.compositionId = tempState.compositionId;
                state.viewBounds = tempState.viewBounds;
                state.panY = tempState.panY;
                state.graphEditorOpen = tempState.graphEditorOpen;
                state.moveLayers = tempState.moveLayers;
                state.dragSelectRect = tempState.dragSelectRect;
                state.trackDragSelectRect = tempState.trackDragSelectRect;
                state.pickWhipLayerParent = tempState.pickWhipLayerParent;
                state.temporaryAction = null;
            }
        },
        cancelTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (state.temporaryAction && state.temporaryAction.id === action.payload.actionId) {
                state.temporaryAction = null;
            }
        }
    },
});

export const {
    setViewBounds,
    setPanY,
    setFields,
    toggleGraphEditorOpen,
    startTemporaryAction,
    commitTemporaryAction,
    cancelTemporaryAction
} = timelineAreaSlice.actions;

export default timelineAreaSlice.reducer; 
