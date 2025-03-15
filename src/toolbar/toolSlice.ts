import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tool, toolGroups } from "~/constants";

export interface ToolState {
    selected: Tool;
    selectedInGroup: Array<Tool>;
    openGroupIndex: number;
    temporaryAction: null | {
        id: string;
        state: {
            selected: Tool;
            selectedInGroup: Array<Tool>;
            openGroupIndex: number;
        };
    };
}

export const initialState: ToolState = {
    selected: Tool.move,
    selectedInGroup: toolGroups.map((group) => group[0].tool),
    openGroupIndex: -1,
    temporaryAction: null
};

const toolSlice = createSlice({
    name: "tool",
    initialState,
    reducers: {
        setTool: (state, action: PayloadAction<{ tool: Tool }>) => {
            console.log('[DEBUG] toolSlice setTool - Action:', action);
            if (!action.payload || !action.payload.tool) {
                console.warn('setTool action missing tool:', action);
                return;
            }

            const { tool } = action.payload;
            let toolGroupIndex = -1;

            for (let i = 0; i < toolGroups.length; i += 1) {
                if (toolGroups[i].map((item) => item.tool).indexOf(tool) !== -1) {
                    toolGroupIndex = i;
                    break;
                }
            }

            if (!state.selectedInGroup) {
                console.warn('state.selectedInGroup est undefined, initialisation avec les valeurs par défaut');
                state.selectedInGroup = toolGroups.map((group) => group[0].tool);
            }

            console.log('[DEBUG] toolSlice setTool - New state:', {
                selected: tool,
                selectedInGroup: state.selectedInGroup.map((item, i) =>
                    i !== toolGroupIndex ? item : tool
                ),
                openGroupIndex: -1
            });

            state.selected = tool;
            state.selectedInGroup = state.selectedInGroup.map((item, i) =>
                i !== toolGroupIndex ? item : tool
            );
            state.openGroupIndex = -1;
        },
        setOpenGroupIndex: (state, action: PayloadAction<{ index: number }>) => {
            console.log('[DEBUG] toolSlice setOpenGroupIndex - Action:', action);
            if (!action.payload || typeof action.payload.index !== 'number') {
                console.warn('setOpenGroupIndex action missing index:', action);
                return;
            }
            console.log('[DEBUG] toolSlice setOpenGroupIndex - Setting index to:', action.payload.index);
            state.openGroupIndex = action.payload.index;
        },
        startTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (!state.temporaryAction) {
                state.temporaryAction = {
                    id: action.payload.actionId,
                    state: {
                        selected: state.selected,
                        selectedInGroup: [...state.selectedInGroup],
                        openGroupIndex: state.openGroupIndex
                    }
                };
            }
        },
        commitTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (state.temporaryAction && state.temporaryAction.id === action.payload.actionId) {
                const { state: tempState } = state.temporaryAction;
                state.selected = tempState.selected;
                state.selectedInGroup = tempState.selectedInGroup;
                state.openGroupIndex = tempState.openGroupIndex;
                state.temporaryAction = null;
            }
        },
        cancelTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (state.temporaryAction && state.temporaryAction.id === action.payload.actionId) {
                state.temporaryAction = null;
            }
        }
    }
});

export const {
    setTool,
    setOpenGroupIndex,
    startTemporaryAction,
    commitTemporaryAction,
    cancelTemporaryAction
} = toolSlice.actions;

export default toolSlice.reducer; 
