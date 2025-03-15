import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ContextMenuActionOption {
    label: string;
    onSelect: () => void;
    default?: boolean;
    icon?: React.ComponentType;
}

export interface ContextMenuListOption {
    label: string;
    options: ContextMenuOption[];
    default?: boolean;
    icon?: React.ComponentType;
}

export type ContextMenuOption = ContextMenuActionOption | ContextMenuListOption;

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
    areaId: string | null;
    temporaryAction: null | {
        id: string;
        state: {
            isOpen: boolean;
            name: string;
            options: SerializableContextMenuOption[];
            position: SerializablePosition;
            customContextMenu: null | any;
            areaId: string | null;
        };
    };
}

export const initialState: ContextMenuState = {
    isOpen: false,
    name: "",
    options: [],
    position: { x: 0, y: 0 },
    customContextMenu: null,
    areaId: null,
    temporaryAction: null
};

export const contextMenuSlice = createSlice({
    name: 'contextMenu',
    initialState,
    reducers: {
        openContextMenu: (state, action: PayloadAction<{
            name: string;
            options: SerializableContextMenuOption[];
            position: SerializablePosition;
            customContextMenu?: any;
            areaId?: string;
        }>) => {
            console.log("[DEBUG] contextMenuSlice - openContextMenu reducer appelé avec action:", action);
            if (!action.payload || !action.payload.name || !action.payload.options || !action.payload.position) {
                console.warn('openContextMenu action missing required fields:', action);
                return;
            }

            state.isOpen = true;
            state.name = action.payload.name;
            state.options = action.payload.options;
            state.position = action.payload.position;
            state.customContextMenu = action.payload.customContextMenu || null;
            state.areaId = action.payload.areaId || null;
        },
        closeContextMenu: (state) => {
            state.isOpen = false;
            state.name = "";
            state.options = [];
            state.position = { x: 0, y: 0 };
            state.customContextMenu = null;
            state.areaId = null;
        },
        openCustomContextMenu: (state, action: PayloadAction<any>) => {
            if (!action.payload) {
                console.warn('openCustomContextMenu action missing payload:', action);
                return;
            }
            state.customContextMenu = action.payload;
        },
        handleContextMenuOptionSelect: (state, action: PayloadAction<{ optionId: string }>) => {
            if (!action.payload || !action.payload.optionId) {
                console.warn('handleContextMenuOptionSelect action missing optionId:', action);
                return;
            }
            const areaId = state.areaId;
            state.isOpen = false;
            state.name = "";
            state.options = [];
            state.position = { x: 0, y: 0 };
            state.customContextMenu = null;
            state.areaId = areaId;
        },
        startTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (!state.temporaryAction) {
                state.temporaryAction = {
                    id: action.payload.actionId,
                    state: {
                        isOpen: state.isOpen,
                        name: state.name,
                        options: state.options,
                        position: state.position,
                        customContextMenu: state.customContextMenu,
                        areaId: state.areaId
                    }
                };
            }
        },
        commitTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (state.temporaryAction && state.temporaryAction.id === action.payload.actionId) {
                const { state: tempState } = state.temporaryAction;
                state.isOpen = tempState.isOpen;
                state.name = tempState.name;
                state.options = tempState.options;
                state.position = tempState.position;
                state.customContextMenu = tempState.customContextMenu;
                state.areaId = tempState.areaId;
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
    openContextMenu,
    closeContextMenu,
    openCustomContextMenu,
    handleContextMenuOptionSelect,
    startTemporaryAction,
    commitTemporaryAction,
    cancelTemporaryAction
} = contextMenuSlice.actions;

export default contextMenuSlice.reducer; 
