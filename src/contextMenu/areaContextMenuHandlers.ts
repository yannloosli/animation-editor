import { areaActions } from "~/area/state/areaActions";
import { AreaType } from "~/constants";
import { store } from "~/state/store-init";
import { registerContextMenuHandler } from "./contextMenuMiddleware";
import { closeContextMenu } from "./contextMenuSlice";

export const registerAreaContextMenuHandlers = () => {
    // Gestionnaire pour le changement de type via le bouton
    Object.values(AreaType).forEach(areaType => {
        const handlerId = `area_type_${areaType}`;
        registerContextMenuHandler(handlerId, () => {
            const state = store.getState();
            const contextMenu = state.contextMenu.state;
            if (contextMenu.customContextMenu?.id) {
                store.dispatch(areaActions.setAreaType(
                    contextMenu.customContextMenu.id,
                    areaType
                ));
                store.dispatch(closeContextMenu());
            }
        });
    });

    // Gestionnaires pour le menu contextuel normal (clic droit)
    registerContextMenuHandler('area_copy', () => {
        // TODO: Implémenter la copie de zone
        store.dispatch(closeContextMenu());
    });

    registerContextMenuHandler('area_paste', () => {
        // TODO: Implémenter le collage de zone
        store.dispatch(closeContextMenu());
    });

    registerContextMenuHandler('area_delete', () => {
        // TODO: Implémenter la suppression de zone
        store.dispatch(closeContextMenu());
    });
}; 
