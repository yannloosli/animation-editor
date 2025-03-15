import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vec2 } from "~/util/math/vec2";

export interface FlowAreaState {
    pan: Vec2;
    scale: number;
    graphId: string;
    dragPreview: [Vec2, Vec2] | null;
}

export const initialFlowAreaState: FlowAreaState = {
    pan: Vec2.new(0, 0),
    scale: 1,
    graphId: "",
    dragPreview: null,
};

export const flowAreaSlice = createSlice({
    name: "flowArea",
    initialState: initialFlowAreaState,
    reducers: {
        setFields: (state, action: PayloadAction<Partial<FlowAreaState>>) => {
            return { ...state, ...action.payload };
        },
        setGraphId: (state, action: PayloadAction<string>) => {
            state.graphId = action.payload;
        },
        setPan: (state, action: PayloadAction<Vec2>) => {
            state.pan = action.payload;
        },
        setScale: (state, action: PayloadAction<number>) => {
            state.scale = action.payload;
        },
    },
});

export const { setFields, setGraphId, setPan, setScale } = flowAreaSlice.actions;
export const flowAreaReducer = flowAreaSlice.reducer; 
