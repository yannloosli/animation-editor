import { setAreaType } from "~/area/state/areaSlice";
import { AreaType } from "~/constants";
import { registerContextMenuHandler } from "~/contextMenu/contextMenuMiddleware";
import { closeContextMenu } from "~/contextMenu/contextMenuSlice";
import { store } from "~/state/store-init";

export const registerAreaTypeHandlers = () => {
    console.log('Registering area type handlers...');
    Object.values(AreaType).forEach((type) => {
        const id = `area-type-${type}`;
        console.log('Registering handler for type:', type, 'with id:', id);
        registerContextMenuHandler(id, () => {
            console.log('Handler called for type:', type);
            const state = store.getState();
            const contextMenuState = state.contextMenu;
            console.log('Full context menu state:', contextMenuState);
            
            // Utiliser l'état de l'action en cours s'il existe, sinon utiliser l'état normal
            const currentState = contextMenuState.action ? contextMenuState.action.state : contextMenuState.state;
            console.log('Current context menu state:', currentState);
            
            if (currentState && currentState.areaId) {
                const areaId = String(currentState.areaId);
                console.log('Dispatching setAreaType with:', {
                    areaId,
                    areaType: type
                });
                store.dispatch(setAreaType({ 
                    areaId, 
                    areaType: type 
                }));
                store.dispatch(closeContextMenu());
            } else {
                console.log('No area id found in context menu state:', currentState);
            }
        });
    });
    console.log('Area type handlers registered');
}; 
