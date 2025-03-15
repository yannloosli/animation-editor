import { joinAreas } from '~/area/state/areaSlice';
import { computeAreaToParentRow } from '~/area/util/areaToParentRow';
import { store } from '~/state/store-init';
import { CardinalDirection } from '~/types';
import { AreaRowLayout } from '~/types/areaTypes';

/**
 * Gère le clic sur une flèche de jointure pour fusionner deux zones
 * @param areaId ID de la zone cible
 * @param direction Direction de la flèche (n, s, e, w)
 */
export const handleJoinAreaClick = (
    areaId: string,
    direction: CardinalDirection
) => {
    try {
        // Vérifier que l'ID de zone est valide
        if (!areaId) {
            console.error("ID de zone invalide");
            return;
        }

        // Convertir l'ID en chaîne de caractères
        const areaIdStr = String(areaId);

        // Obtenir l'état du store
        const state = store.getState();
        if (!state || !state.area) {
            console.error("État non disponible");
            return;
        }

        // Accéder à l'état de area
        const areaState = state.area;
        if (!areaState.layout) {
            console.error("Layout non disponible");
            return;
        }

        // Calculer la relation parent-enfant des zones
        const areaToRow = computeAreaToParentRow(areaState);
        const parentRowId = areaToRow[areaIdStr];

        if (!parentRowId) {
            console.error(`La zone ${areaIdStr} n'a pas de rangée parente`);
            return;
        }

        const parentRow = areaState.layout[parentRowId] as AreaRowLayout;
        if (!parentRow || parentRow.type !== 'area_row') {
            console.error(`La rangée parente ${parentRowId} n'est pas valide`);
            return;
        }

        // Trouver l'index de la zone dans la rangée
        const areaIndex = parentRow.areas.findIndex(area => area.id === areaIdStr);
        if (areaIndex === -1) {
            console.error(`La zone ${areaIdStr} n'a pas été trouvée dans la rangée`);
            return;
        }

        // Déterminer la direction de fusion
        let mergeInto: -1 | 1;

        if (parentRow.orientation === 'horizontal') {
            // Pour une rangée horizontale, 'e' signifie fusionner avec la zone à droite, 'w' avec la zone à gauche
            if (direction === 'e') {
                mergeInto = 1; // Fusionner avec la zone à droite
            } else if (direction === 'w') {
                mergeInto = -1; // Fusionner avec la zone à gauche
            } else {
                console.error(`Direction ${direction} invalide pour une rangée horizontale`);
                return;
            }
        } else {
            // Pour une rangée verticale, 's' signifie fusionner avec la zone en dessous, 'n' avec la zone au-dessus
            if (direction === 's') {
                mergeInto = 1; // Fusionner avec la zone en dessous
            } else if (direction === 'n') {
                mergeInto = -1; // Fusionner avec la zone au-dessus
            } else {
                console.error(`Direction ${direction} invalide pour une rangée verticale`);
                return;
            }
        }

        // Vérifier si la fusion est possible
        const targetIndex = areaIndex + mergeInto;
        if (targetIndex < 0 || targetIndex >= parentRow.areas.length) {
            console.error(`Impossible de fusionner : l'index cible ${targetIndex} est hors limites`);
            return;
        }

        // Exécuter l'action de fusion
        store.dispatch(joinAreas({
            areaRowId: parentRowId,
            areaIndex: Math.min(areaIndex, targetIndex),
            mergeInto: targetIndex > areaIndex ? 1 : -1
        }));

        console.log("Fusion initiée:", {
            areaId: areaIdStr,
            direction,
            parentRowId,
            areaIndex,
            targetIndex
        });
    } catch (error) {
        console.error('Erreur lors de la fusion des zones:', error);
    }
}; 
