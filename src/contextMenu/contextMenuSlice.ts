import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SerializableContextMenuOption {
    id: string;
    label: string;
    icon?: string;
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
        }>) => {
            state.isOpen = true;
            state.name = action.payload.name;
            state.options = action.payload.options;
            state.position = action.payload.position;
        },
        closeContextMenu: (state) => {
            state.isOpen = false;
            state.name = "";
            state.options = [];
            state.position = { x: 0, y: 0 };
            state.customContextMenu = null;
        },
        openCustomContextMenu: (state, action: PayloadAction<any>) => {
            state.customContextMenu = action.payload;
        },
        handleContextMenuOptionSelect: (state, action: PayloadAction<{ optionId: string }>) => {
            // Cette action sera interceptée par un middleware qui gérera l'exécution de l'action
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
