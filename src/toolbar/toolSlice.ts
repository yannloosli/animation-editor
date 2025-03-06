import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tool, toolGroups } from "~/constants";

export interface ToolState {
    selected: Tool;
    selectedInGroup: Array<Tool>;
    openGroupIndex: number;
}

export const initialState: ToolState = {
    selected: Tool.move,
    selectedInGroup: toolGroups.map((group) => group[0].tool),
    openGroupIndex: -1,
};

const toolSlice = createSlice({
    name: "tool",
    initialState,
    reducers: {
        setTool: (state, action: PayloadAction<{ tool: Tool }>) => {
            const { tool } = action.payload;
            let toolGroupIndex = -1;

            for (let i = 0; i < toolGroups.length; i += 1) {
                if (toolGroups[i].map((item) => item.tool).indexOf(tool) !== -1) {
                    toolGroupIndex = i;
                    break;
                }
            }

            state.selected = tool;
            state.selectedInGroup = state.selectedInGroup.map((item, i) =>
                i !== toolGroupIndex ? item : tool
            );
            state.openGroupIndex = -1;
        },
        setOpenGroupIndex: (state, action: PayloadAction<{ index: number }>) => {
            state.openGroupIndex = action.payload.index;
        },
    },
});

export const { setTool, setOpenGroupIndex } = toolSlice.actions;
export default toolSlice.reducer; 
