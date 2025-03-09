import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface TimelineAreaState {
    viewBounds: [number, number];
    panY: number;
    graphEditorOpen?: boolean;
    moveLayers: null | {
        layerId: string;
        type: "above" | "below" | "invalid";
    };
    dragSelectRect: null | {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    trackDragSelectRect: null | {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    pickWhipLayerParent: null | {
        fromId: string;
        to: { x: number; y: number };
    };
}

export const initialState: TimelineAreaState = {
    viewBounds: [0, 1],
    panY: 0,
    graphEditorOpen: false,
    moveLayers: null,
    dragSelectRect: null,
    trackDragSelectRect: null,
    pickWhipLayerParent: null,
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
    },
});

export const { setViewBounds, setPanY, setFields, toggleGraphEditorOpen } = timelineAreaSlice.actions;

export default timelineAreaSlice.reducer; 
