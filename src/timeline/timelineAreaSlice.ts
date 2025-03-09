import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface TimelineAreaState {
    viewBounds: [number, number];
    panY: number;
}

export const initialState: TimelineAreaState = {
    viewBounds: [0, 1],
    panY: 0,
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
    },
});

export const { setViewBounds, setPanY } = timelineAreaSlice.actions;

export default timelineAreaSlice.reducer; 
