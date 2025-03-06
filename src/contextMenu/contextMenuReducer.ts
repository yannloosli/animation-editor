import { ActionType, getType } from "typesafe-actions";
import { contextMenuActionCreators } from "~/contextMenu/contextMenuActionTypes";
import { OpenCustomContextMenuOptions } from "~/contextMenu/contextMenuTypes";

type ContextMenuAction = ActionType<typeof contextMenuActionCreators>;

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

export interface ContextMenuState {
	name: string;
	isOpen: boolean;
	options: ContextMenuOption[];
	position: Vec2;
	close: (() => void) | null;
	customContextMenu: null | OpenCustomContextMenuOptions;
}

export const contextMenuReducer = (
	state: ContextMenuState,
	action: ContextMenuAction,
): ContextMenuState => {
	switch (action.type) {
		case getType(contextMenuActionCreators.openContextMenu): {
			const { name, options, position, close } = action.payload;
			return {
				...state,
				isOpen: true,
				name,
				options,
				position,
				close,
			};
		}

		case getType(contextMenuActionCreators.openCustomContextMenu): {
			const { options } = action.payload;
			return {
				...state,
				customContextMenu: options,
			};
		}

		case getType(contextMenuActionCreators.closeContextMenu): {
			return {
				...state,
				isOpen: false,
				name: "",
				options: [],
				position: Vec2.new(0, 0),
				close: null,
				customContextMenu: null,
			};
		}

		default:
			return state;
	}
};
