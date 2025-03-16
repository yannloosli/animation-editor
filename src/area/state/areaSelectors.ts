import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '~/state/store-init';
import { AreaLayout, AreaRowLayout } from '~/types/areaTypes';
import { AreaState } from "../types";
import { computeAreaToViewport } from '../util/areaToViewport';
import { getAreaRootViewport } from '../util/getAreaViewport';
import { selectAllAreas, selectAreaById as selectAreaByIdFromAdapter, selectAreaIds } from './areaAdapter';

// Type guard pour AreaLayout
function isAreaLayout(layout: unknown): layout is AreaLayout {
    if (!layout || typeof layout !== 'object') return false;

    const potentialLayout = layout as Partial<AreaLayout>;
    return (
        potentialLayout.type === 'area' &&
        typeof potentialLayout.id === 'string'
    );
}

// Type guard pour AreaRowLayout
function isAreaRowLayout(layout: unknown): layout is AreaRowLayout {
    if (!layout || typeof layout !== 'object') return false;

    const potentialLayout = layout as Partial<AreaRowLayout>;
    return (
        potentialLayout.type === 'area_row' &&
        Array.isArray(potentialLayout.areas) &&
        typeof potentialLayout.id === 'string'
    );
}

// Sélecteur pour obtenir le viewport d'une area
export const selectAreaViewport = createSelector(
    [
        (state: RootState) => state.area?.layout,
        (state: RootState) => state.area?.rootId,
        (state: RootState, areaId: string) => areaId
    ],
    (layout, rootId, areaId) => {


        if (!layout) {
            console.warn('Layout is missing in selectAreaViewport');
            return null;
        }

        if (!rootId) {
            console.warn('RootId is missing in selectAreaViewport');
            return null;
        }

        if (!layout[rootId]) {
            console.warn(`Layout for rootId ${rootId} is missing in selectAreaViewport`);
            return null;
        }

        const rootViewport = getAreaRootViewport();
        if (!rootViewport) {
            console.warn('Root viewport is null');
            return null;
        }



        try {
            const viewport = computeAreaToViewport(layout, rootId, rootViewport);

            return viewport;
        } catch (error) {
            console.error('Error computing viewport:', error);
            return null;
        }
    }
);

// Sélecteur pour obtenir une area avec ses enfants
export const selectAreaWithChildren = createSelector(
    [selectAreaByIdFromAdapter, (state: RootState) => state.area.layout],
    (area, layout) => {
        if (!area) return null;
        return {
            ...area,
            children: Object.values(layout)
                .filter(isAreaLayout)
                .filter(l => l.id === area.id)
        };
    }
);

// Sélecteur pour obtenir toutes les areas avec leur layout
export const selectAreasWithLayout = createSelector(
    [selectAllAreas, (state: RootState) => state.area.layout],
    (areas, layout) => {
        return areas.map(area => ({
            ...area,
            layout: Object.values(layout).find(l => isAreaLayout(l) && l.id === area.id)
        }));
    }
);

/**
 * Sélecteur de base pour l'état du module AREA
 * Gère la compatibilité entre l'ancienne et la nouvelle structure d'état
 * @param state État global de l'application
 * @returns État du module AREA ou null si non disponible
 */
export const selectAreaState = (state: RootState): AreaState | null => {
    // Log pour le débogage



    // Vérifier si state.area existe
    if (!state.area) {

        return null;
    }

    // Vérifier si state.area a une propriété state (nouvelle structure)
    if (state.area.state) {

        return state.area.state;
    }

    // Ancienne structure

    return state.area;
};

/**
 * Sélectionne l'identifiant de la zone racine
 */
export const selectRootId = createSelector(
    [selectAreaState],
    (areaState): string | null => {
        if (!areaState) {

            return null;
        }

        return areaState.rootId;
    }
);

/**
 * Sélectionne la disposition des zones et rangées
 */
export const selectAreaLayout = createSelector(
    [selectAreaState],
    (areaState) => {
        if (!areaState) {

            return {};
        }

        return areaState.layout;
    }
);

/**
 * Sélectionne toutes les zones disponibles
 */
export const selectAreas = createSelector(
    [selectAreaState],
    (areaState) => {
        if (!areaState) {

            return {};
        }

        // Vérifier si nous avons la nouvelle structure avec entities
        if (areaState.areas && typeof areaState.areas === 'object') {
            // Vérifier si la propriété entities existe
            const areas = areaState.areas as any;
            if (areas.entities) {

                return areas.entities;
            }
        }


        return areaState.areas;
    }
);

/**
 * Sélectionne une zone spécifique par son identifiant
 * Utilise l'accès direct à l'objet areas pour la compatibilité avec l'ancienne structure
 * @param areaId Identifiant de la zone à sélectionner
 */
export const getAreaById = (areaId: string) => createSelector(
    [selectAreas],
    (areas) => {
        if (!areas || !areaId) return null;
        return areas[areaId] || null;
    }
);

/**
 * Sélectionne la prévisualisation de jointure entre zones
 */
export const selectJoinPreview = createSelector(
    [selectAreaState],
    (areaState) => {
        if (!areaState) return null;
        return areaState.joinPreview;
    }
);

/**
 * Sélectionne la zone à ouvrir (prévisualisation)
 */
export const selectAreaToOpen = createSelector(
    [selectAreaState],
    (areaState) => {
        if (!areaState) return null;
        return areaState.areaToOpen;
    }
);

/**
 * Sélectionne les identifiants des zones éligibles pour la jointure
 */
export const selectEligibleAreaIds = createSelector(
    [selectJoinPreview],
    (joinPreview) => {
        if (!joinPreview) return [];
        return joinPreview.eligibleAreaIds;
    }
);

/**
 * Vérifie si une zone est éligible pour la jointure
 * @param areaId Identifiant de la zone à vérifier
 */
export const selectIsAreaEligible = (areaId: string) => createSelector(
    [selectEligibleAreaIds],
    (eligibleAreaIds) => {
        return eligibleAreaIds.includes(areaId);
    }
);

/**
 * Sélectionne la direction du déplacement pour la jointure
 */
export const selectMovingDirection = createSelector(
    [selectJoinPreview],
    (joinPreview) => {
        if (!joinPreview) return null;
        return joinPreview.movingInDirection;
    }
);

/**
 * Sélecteur pour obtenir tous les viewports des areas
 */
export const selectAllAreaViewports = createSelector(
    [selectAreaLayout, selectRootId],
    (layout, rootId) => {
        if (!layout || !rootId) return {};

        const rootViewport = getAreaRootViewport();
        if (!rootViewport) return {};

        return computeAreaToViewport(layout, rootId, rootViewport);
    }
);

/**
 * Sélecteur pour obtenir une ligne d'areas
 */
export const selectAreaRow = (state: RootState, rowId: string) => {
    const layout = selectAreaLayout(state);
    const row = layout[rowId];
    return row && row.type === 'area_row' ? row as AreaRowLayout : null;
};

// Re-export des sélecteurs de l'adaptateur pour la compatibilité
export { selectAllAreas, selectAreaByIdFromAdapter as selectAreaById, selectAreaIds };
