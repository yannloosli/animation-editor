import { AreaWithId } from '~/area/state/areaAdapter';
import { selectAreaState } from '~/area/state/areaSelectors';
import { convertAreaToRow, insertAreaIntoRow, setFields } from '~/area/state/areaSlice';
import { computeAreaToViewport } from '~/area/util/areaToViewport';
import { getAreaToOpenPlacementInViewport, getHoveredAreaId } from '~/area/util/areaUtils';
import { getAreaRootViewport } from '~/area/util/getAreaViewport';
import { AreaType } from '~/constants';
import { store } from '~/state/store-init';
import { Vec2 } from '~/util/math/vec2';

/**
 * Affiche la prévisualisation d'une zone à ouvrir à une position donnée
 * @param position Position de la souris
 * @param areaType Type de zone à ouvrir
 * @param initialState État initial de la zone à ouvrir (optionnel)
 */
export const showAreaToOpenPreview = (
    position: Vec2,
    areaType: AreaType,
    initialState?: any
) => {
    try {
        store.dispatch(setFields({
            areaToOpen: {
                position,
                area: {
                    id: 'preview',
                    type: areaType,
                    state: initialState || {}
                } as AreaWithId
            }
        }));
    } catch (error) {
        console.error('Erreur lors de l\'affichage de la prévisualisation de la zone à ouvrir:', error);
    }
};

/**
 * Masque la prévisualisation de la zone à ouvrir
 */
export const hideAreaToOpenPreview = () => {
    try {
        store.dispatch(setFields({
            areaToOpen: null
        }));
    } catch (error) {
        console.error('Erreur lors du masquage de la prévisualisation de la zone à ouvrir:', error);
    }
};

/**
 * Ouvre une zone à la position actuelle de la prévisualisation
 * @returns true si la zone a été ouverte avec succès, false sinon
 */
export const openAreaAtPreview = (): boolean => {
    try {
        const state = store.getState();
        const areaState = selectAreaState(state);

        if (!areaState || !areaState.areaToOpen) {
            console.error('Aucune prévisualisation de zone à ouvrir');
            return false;
        }

        const { position, area } = areaState.areaToOpen;

        // Calculer les viewports des zones
        const rootViewport = getAreaRootViewport();
        if (!rootViewport) {
            console.error('Impossible d\'obtenir le viewport racine');
            return false;
        }

        const areaToViewport = computeAreaToViewport(areaState.layout, areaState.rootId, rootViewport);

        // Trouver la zone sous la position
        const hoveredAreaId = getHoveredAreaId(position, areaState, areaToViewport);
        if (!hoveredAreaId) {
            console.error('Aucune zone sous la position');
            return false;
        }

        const hoveredViewport = areaToViewport[hoveredAreaId];
        const placement = getAreaToOpenPlacementInViewport(hoveredViewport, position);

        // Créer un ID unique pour la nouvelle zone
        const newAreaId = `area-${Date.now()}`;

        // Créer la nouvelle zone avec l'ID unique
        const newArea: AreaWithId = {
            ...area,
            id: newAreaId
        };

        if (placement === 'replace') {
            // Remplacer la zone existante
            const entities = areaState.areas.entities || {};

            // Utiliser une approche différente pour accéder à l'entité
            let hoveredArea: any = null;
            if (entities) {
                hoveredArea = Object.values(entities).find(a => (a as any).id === hoveredAreaId);
            }

            if (!hoveredArea) {
                console.error(`Zone ${hoveredAreaId} introuvable`);
                return false;
            }

            // Créer une version mise à jour de la zone
            const updatedArea = {
                ...hoveredArea,
                type: area.type,
                state: area.state
            };

            store.dispatch(setFields({
                areas: {
                    entities: {
                        ...entities,
                        [hoveredAreaId]: updatedArea
                    }
                }
            }));
        } else {
            // Convertir la zone en rangée si nécessaire
            const isHorizontal = placement === 'left' || placement === 'right';

            store.dispatch(convertAreaToRow({
                areaId: hoveredAreaId,
                cornerParts: isHorizontal ? ['w', 'e'] : ['n', 's'],
                horizontal: isHorizontal
            }));

            // Insérer la nouvelle zone dans la rangée
            const insertIndex = placement === 'left' || placement === 'top' ? 0 : 1;

            store.dispatch(insertAreaIntoRow({
                rowId: hoveredAreaId,
                area: newArea,
                insertIndex
            }));
        }

        // Masquer la prévisualisation
        hideAreaToOpenPreview();

        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ouverture de la zone:', error);
        return false;
    }
}; 
