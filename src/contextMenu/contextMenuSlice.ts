import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vec2 } from '~/util/math/vec2';
import { ContextMenuOption } from './contextMenuReducer';

export interface ContextMenuState {
    isOpen: boolean;
    name: string;
    options: ContextMenuOption[];
    position: Vec2;
    close: (() => void) | null;
    customContextMenu: null | any;
}

export const initialState: ContextMenuState = {
    isOpen: false,
    name: "",
    options: [],
    position: Vec2.new(0, 0),
    close: null,
    customContextMenu: null,
};

const contextMenuSlice = createSlice({
    name: 'contextMenu',
    initialState,
    reducers: {
        openContextMenu: (state, action: PayloadAction<{ name: string; options: ContextMenuOption[]; position: Vec2; close: () => void }>) => {
            console.log("openContextMenu action:", action.payload);
            state.isOpen = true;
            state.name = action.payload.name;
            state.options = action.payload.options;
            state.position = action.payload.position;
            state.close = action.payload.close;
            console.log("New state:", state);
        },
        closeContextMenu: (state) => {
            console.log("closeContextMenu action");
            state.isOpen = false;
            state.name = "";
            state.options = [];
            state.position = Vec2.new(0, 0);
            state.close = null;
            state.customContextMenu = null;
        },
        openCustomContextMenu: (state, action: PayloadAction<any>) => {
            console.log("openCustomContextMenu action:", action.payload);
            state.customContextMenu = action.payload;
        }
    }
});

export const { openContextMenu, closeContextMenu, openCustomContextMenu } = contextMenuSlice.actions;
export default contextMenuSlice.reducer; 
