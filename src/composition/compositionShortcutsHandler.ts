import { addListener, removeListener } from "~/listener/addListener";
import { requestAction } from "~/listener/requestAction";
import { getActionState } from "~/state/stateUtils";
import { PropertyName } from "~/types";
import { Property } from "./compositionTypes";

// Variable pour stocker les éléments copiés
let copiedLayers: any[] = [];

/**
 * Initialise les raccourcis clavier pour les compositions
 */
export const initCompositionKeyboardShortcuts = () => {
    // Raccourci pour afficher les propriétés animées (touche U)
    const viewAnimatedPropertiesToken = addListener.keyboardOnce("U", "keydown", () => {
        const { areaState, compositionState } = getActionState();

        // Trouver la composition active
        const activeAreaId = Object.keys(areaState.areas.entities).find(areaId => {
            const area = areaState.areas.entities[areaId];
            return area && (area.type === "timeline" || area.type === "workspace");
        });

        if (!activeAreaId) return;

        const activeArea = areaState.areas.entities[activeAreaId];
        if (!activeArea || !activeArea.state || !activeArea.state.compositionId) return;

        const compositionId = activeArea.state.compositionId;

        // Afficher les propriétés animées
        requestAction({ history: false }, (params) => {
            // Trouver les propriétés animées
            const composition = compositionState.compositions[compositionId];
            if (!composition) return;

            // Pour chaque calque de la composition
            composition.layers.forEach((layerId: string) => {
                const layer = compositionState.layers[layerId];
                if (!layer) return;

                // Trouver les propriétés animées (avec un timelineId)
                const animatedPropertyIds: string[] = [];

                for (const propId of layer.properties) {
                    const prop = compositionState.properties[propId];
                    if (prop && prop.type === "property" && (prop as Property).timelineId) {
                        animatedPropertyIds.push(prop.id);
                    }
                }

                if (animatedPropertyIds.length > 0) {
                    // Afficher les propriétés animées
                    params.dispatch({
                        type: 'composition/setLayerViewProperties',
                        payload: {
                            layerId,
                            propertyIds: animatedPropertyIds
                        }
                    });
                }
            });
        });
    });

    // Raccourci pour afficher les propriétés de position (touche P)
    const viewPositionPropertiesToken = addListener.keyboardOnce("P", "keydown", () => {
        const { areaState, compositionState } = getActionState();

        // Trouver la composition active
        const activeAreaId = Object.keys(areaState.areas.entities).find(areaId => {
            const area = areaState.areas.entities[areaId];
            return area && (area.type === "timeline" || area.type === "workspace");
        });

        if (!activeAreaId) return;

        const activeArea = areaState.areas.entities[activeAreaId];
        if (!activeArea || !activeArea.state || !activeArea.state.compositionId) return;

        const compositionId = activeArea.state.compositionId;

        // Afficher les propriétés de position
        requestAction({ history: false }, (params) => {
            // Trouver les propriétés de position
            const composition = compositionState.compositions[compositionId];
            if (!composition) return;

            // Pour chaque calque de la composition
            composition.layers.forEach((layerId: string) => {
                const layer = compositionState.layers[layerId];
                if (!layer) return;

                // Trouver les propriétés de position
                const positionPropertyIds: string[] = [];

                for (const propId of layer.properties) {
                    const prop = compositionState.properties[propId];
                    if (prop && prop.type === "property") {
                        const propName = (prop as Property).name;
                        if (propName === PropertyName.PositionX ||
                            propName === PropertyName.PositionY) {
                            positionPropertyIds.push(prop.id);
                        }
                    }
                }

                if (positionPropertyIds.length > 0) {
                    // Afficher les propriétés de position
                    params.dispatch({
                        type: 'composition/setLayerViewProperties',
                        payload: {
                            layerId,
                            propertyIds: positionPropertyIds
                        }
                    });
                }
            });
        });
    });

    // Fonction de nettoyage
    return () => {
        removeListener(viewAnimatedPropertiesToken);
        removeListener(viewPositionPropertiesToken);
    };
};

/**
 * Enregistre les raccourcis clavier pour les compositions
 * @returns Une fonction de nettoyage pour désinscrire les raccourcis clavier
 */
export const registerCompositionKeyboardShortcuts = (): (() => void) => {
    return initCompositionKeyboardShortcuts();
}; 
