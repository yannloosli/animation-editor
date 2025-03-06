import { store } from "~/state/store-init";
import { Vec2 } from "~/util/math/vec2";
import { ContextMenuOption } from "./contextMenuReducer";
import { closeContextMenu as rtkCloseContextMenu, openContextMenu as rtkOpenContextMenu } from "./contextMenuSlice";
import { OpenCustomContextMenuOptions } from "./contextMenuTypes";

export const contextMenuActions = {
	openContextMenu: (name: string, options: ContextMenuOption[], position: Vec2, close: () => void) => {
		store.dispatch(rtkOpenContextMenu({ name, options, position, close }));
	},

	openCustomContextMenu: (options: OpenCustomContextMenuOptions<any>) => {
		store.dispatch(rtkOpenContextMenu({ name: "", options: [], position: Vec2.new(0, 0), close: () => store.dispatch(rtkCloseContextMenu()) }));
	},

	closeContextMenu: () => {
		store.dispatch(rtkCloseContextMenu());
	},
};

// Type pour le dispatch Redux
type AppDispatch = (action: any) => void;

export const createContextMenuActions = (dispatch: AppDispatch) => ({
	openContextMenu: (name: string, options: ContextMenuOption[], position: Vec2, close: () => void) => {
		dispatch(rtkOpenContextMenu({ name, options, position, close }));
	},

	openCustomContextMenu: (options: OpenCustomContextMenuOptions<any>) => {
		dispatch(rtkOpenContextMenu({ name: "", options: [], position: Vec2.new(0, 0), close: () => dispatch(rtkCloseContextMenu()) }));
	},

	closeContextMenu: () => {
		dispatch(rtkCloseContextMenu());
	},
});
