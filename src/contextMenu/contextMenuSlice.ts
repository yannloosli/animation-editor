import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SerializableContextMenuOption {
    id: string;
    label: string;
    iconName?: string;
    default?: boolean;
    options?: SerializableContextMenuOption[];
}

export interface SerializablePosition {
    x: number;
    y: number;
}

export interface ContextMenuState {
    isOpen: boolean;
    name: string;
    options: SerializableContextMenuOption[];
    position: SerializablePosition;
    customContextMenu: null | any;
}

export const initialState: ContextMenuState = {
    isOpen: false,
    name: "",
    options: [],
    position: { x: 0, y: 0 },
    customContextMenu: null,
};

const contextMenuSlice = createSlice({
    name: 'contextMenu',
    initialState,
    reducers: {
        openContextMenu: (state, action: PayloadAction<{ 
            name: string; 
            options: SerializableContextMenuOption[]; 
            position: SerializablePosition;
            customContextMenu?: any;
        }>) => {
            if (!action.payload || !action.payload.name || !action.payload.options || !action.payload.position) {
                console.warn('openContextMenu action missing required fields:', action);
                return state;
            }
            state.isOpen = true;
            state.name = action.payload.name;
            state.options = action.payload.options;
            state.position = action.payload.position;
            state.customContextMenu = action.payload.customContextMenu || null;
        },
        closeContextMenu: (state) => {
            state.isOpen = false;
            state.name = "";
            state.options = [];
            state.position = { x: 0, y: 0 };
            state.customContextMenu = null;
        },
        openCustomContextMenu: (state, action: PayloadAction<any>) => {
            if (!action.payload) {
                console.warn('openCustomContextMenu action missing payload:', action);
                return state;
            }
            state.customContextMenu = action.payload;
        },
        handleContextMenuOptionSelect: (state, action: PayloadAction<{ optionId: string }>) => {
            if (!action.payload || !action.payload.optionId) {
                console.warn('handleContextMenuOptionSelect action missing optionId:', action);
                return state;
            }
            state.isOpen = false;
        }
    }
});

export const { 
    openContextMenu, 
    closeContextMenu, 
    openCustomContextMenu,
    handleContextMenuOptionSelect 
} = contextMenuSlice.actions;

export default contextMenuSlice.reducer; 
