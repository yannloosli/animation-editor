import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vec2 } from "~/util/math/vec2";

const ellipseToolSlice = createSlice({
    name: "ellipseTool",
    initialState: {
        center: Vec2.new(0, 0),
        radius: Vec2.new(0, 0),
        rotation: 0,
        isDrawing: false
    },
    reducers: {
        setCenter: (state, action: PayloadAction<Vec2>) => {
            state.center = action.payload;
        },
        setRadius: (state, action: PayloadAction<Vec2>) => {
            state.radius = action.payload;
        },
        setRotation: (state, action: PayloadAction<number>) => {
            state.rotation = action.payload;
        },
        startDrawing: (state) => {
            state.isDrawing = true;
        },
        endDrawing: (state) => {
            state.isDrawing = false;
        },
        reset: (state) => {
            state.center = Vec2.new(0, 0);
            state.radius = Vec2.new(0, 0);
            state.rotation = 0;
            state.isDrawing = false;
        }
    }
});

export const { setCenter, setRadius, setRotation, startDrawing, endDrawing, reset } = ellipseToolSlice.actions;
export default ellipseToolSlice.reducer; 
