import { storeRTK } from "~/state/store-init";
import { Vec2 } from "~/util/math/vec2";
import { registerContextMenuHandler } from "./contextMenuMiddleware";
import { ContextMenuOption } from "./contextMenuReducer";
import { closeContextMenu as rtkCloseContextMenu, openContextMenu as rtkOpenContextMenu, SerializableContextMenuOption } from "./contextMenuSlice";
import { OpenCustomContextMenuOptions } from "./contextMenuTypes";

const createSerializableOption = (option: ContextMenuOption): SerializableContextMenuOption => {
	const id = Math.random().toString(36).substring(7);
	const serializableOption: SerializableContextMenuOption = {
		id,
		label: option.label,
		icon: option.icon?.name
	};

	if ('options' in option) {
		serializableOption.options = option.options?.map(createSerializableOption);
	} else if ('onSelect' in option) {
		registerContextMenuHandler(id, () => option.onSelect());
	}

	return serializableOption;
};

export const contextMenuActions = {
	openContextMenu: (name: string, options: ContextMenuOption[], position: Vec2) => {
		const serializableOptions = options.map(createSerializableOption);
		storeRTK.dispatch(rtkOpenContextMenu({ 
			name, 
			options: serializableOptions, 
			position: { x: position.x, y: position.y }
		}));
	},

	openCustomContextMenu: (options: OpenCustomContextMenuOptions<any>) => {
		storeRTK.dispatch(rtkOpenContextMenu({ 
			name: "", 
			options: [], 
			position: { x: 0, y: 0 }
		}));
	},

	closeContextMenu: () => {
		storeRTK.dispatch(rtkCloseContextMenu());
	},

	handleContextMenuOptionSelect: (payload: { optionId: string }) => {
		storeRTK.dispatch({
			type: "contextMenu/handleContextMenuOptionSelect",
			payload
		});
	}
};

// Type pour le dispatch Redux
type AppDispatch = typeof storeRTK.dispatch;

export const createContextMenuActions = (dispatch: AppDispatch) => ({
	openContextMenu: (name: string, options: ContextMenuOption[], position: Vec2) => {
		const serializableOptions = options.map(createSerializableOption);
		dispatch(rtkOpenContextMenu({ 
			name, 
			options: serializableOptions, 
			position: { x: position.x, y: position.y }
		}));
	},

	openCustomContextMenu: (options: OpenCustomContextMenuOptions<any>) => {
		dispatch(rtkOpenContextMenu({ 
			name: "", 
			options: [], 
			position: { x: 0, y: 0 }
		}));
	},

	closeContextMenu: () => {
		dispatch(rtkCloseContextMenu());
	},

	handleContextMenuOptionSelect: (payload: { optionId: string }) => {
		dispatch({
			type: "contextMenu/handleContextMenuOptionSelect",
			payload
		});
	}
});
