import { registerAreaTypeHandlers } from "~/area/handlers/areaTypeHandlers";
import { store } from "~/state/store-init";

export const initContextMenu = () => {
    // Enregistrer les handlers pour les types d'area
    registerAreaTypeHandlers();

    // Enregistrer le handler principal pour les options du menu contextuel
    store.dispatch({
        type: "contextMenu/handleContextMenuOptionSelect",
        payload: {
            optionId: "area-type-project"
        }
    });
}; 
