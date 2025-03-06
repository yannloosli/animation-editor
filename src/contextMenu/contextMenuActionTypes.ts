import { createAction } from "typesafe-actions";
import { ContextMenuOption } from "~/contextMenu/contextMenuReducer";
import { OpenCustomContextMenuOptions } from "~/contextMenu/contextMenuTypes";
import { Vec2 } from "~/util/math/vec2";

export const contextMenuActionTypes = {
    openContextMenu: "contextMenu/OPEN",
    openCustomContextMenu: "contextMenu/OPEN_CUSTOM",
    closeContextMenu: "contextMenu/CLOSE",
} as const;

export const contextMenuActionCreators = {
    openContextMenu: createAction(contextMenuActionTypes.openContextMenu, (action) => {
        return (name: string, options: ContextMenuOption[], position: Vec2, close: () => void) => 
            action({ name, options, position, close });
    }),

    openCustomContextMenu: createAction(contextMenuActionTypes.openCustomContextMenu, (action) => {
        return (options: OpenCustomContextMenuOptions<any>) => action({ options });
    }),

    closeContextMenu: createAction(contextMenuActionTypes.closeContextMenu, (action) => {
        return () => action({});
    }),
}; 
