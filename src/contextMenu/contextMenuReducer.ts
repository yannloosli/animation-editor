import { ActionType, getType } from "typesafe-actions";
import { contextMenuActionCreators } from "~/contextMenu/contextMenuActionTypes";
import { ContextMenuState } from "./contextMenuSlice";

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

export const contextMenuReducer = (
	state: ContextMenuState,
	action: any,
): ContextMenuState => {
	// Gérer les actions RTK
	if (action.type.startsWith('contextMenu/')) {
		switch (action.type) {
			case 'contextMenu/openContextMenu':
				return {
					...state,
					isOpen: true,
					name: action.payload.name,
					options: action.payload.options,
					position: action.payload.position,
					customContextMenu: action.payload.customContextMenu ? {
						...action.payload.customContextMenu,
						position: action.payload.position
					} : null,
					areaId: action.payload.areaId || null,
				};

			case 'contextMenu/closeContextMenu':
				return {
					...state,
					isOpen: false,
					name: "",
					options: [],
					position: { x: 0, y: 0 },
					customContextMenu: null,
					areaId: null,
				};

			case 'contextMenu/openCustomContextMenu':
				return {
					...state,
					customContextMenu: action.payload ? {
						...action.payload,
						position: action.payload.position || state.position
					} : null,
				};

			case 'contextMenu/handleContextMenuOptionSelect':
				const areaId = state.areaId;
				return {
					...state,
					isOpen: false,
					name: "",
					options: [],
					position: { x: 0, y: 0 },
					customContextMenu: null,
					areaId: areaId,
				};
		}
	}

	// Gérer les anciennes actions
	switch (action.type) {
		case getType(contextMenuActionCreators.openContextMenu): {
			const { name, options, position } = action.payload;
			const serializedOptions = options.map((option: any) => ({
				id: option.label,
				label: option.label,
				icon: option.icon,
				options: option.options ? option.options.map((subOption: any) => ({
					id: subOption.label,
					label: subOption.label,
					icon: subOption.icon
				})) : undefined
			}));
			return {
				...state,
				isOpen: true,
				name,
				options: serializedOptions,
				position: { x: position.x, y: position.y },
				areaId: action.payload.areaId || null,
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
				position: { x: 0, y: 0 },
				customContextMenu: null,
				areaId: null,
			};
		}

		default:
			return state;
	}
};
