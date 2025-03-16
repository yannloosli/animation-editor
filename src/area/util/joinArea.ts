import { AreaLayout, AreaRowLayout } from "~/types/areaTypes";

export const joinAreas = (
    row: AreaRowLayout,
    areaIndex: number,
    join: -1 | 1,
): { area: AreaRowLayout | AreaLayout; removedAreaId: string } => {


    // Vérifications de base
    if (!row || !row.areas) {
        console.error("joinAreas util - Rangée invalide:", row);
        throw new Error("Rangée invalide");
    }

    if (areaIndex < 0 || areaIndex >= row.areas.length) {
        console.error("joinAreas util - Index hors limites:", { areaIndex, areasLength: row.areas.length });
        throw new Error(`Index 'areaIndex' (${areaIndex}) out of bounds for row of length ${row.areas.length}`);
    }

    const areaToRemoveIndex = areaIndex + join;
    if (areaToRemoveIndex < 0 || areaToRemoveIndex >= row.areas.length) {
        console.error("joinAreas util - Index cible hors limites:", { areaToRemoveIndex, areasLength: row.areas.length });
        throw new Error(`Target index (${areaToRemoveIndex}) out of bounds for row of length ${row.areas.length}`);
    }

    // Cas spécial: rangée avec seulement 2 zones
    if (row.areas.length === 2) {
        const area = row.areas[areaIndex];
        const removedArea = row.areas[areaToRemoveIndex];

        if (!area || !area.id) {
            console.error("joinAreas util - Zone source invalide:", area);
            throw new Error("Zone source invalide");
        }

        if (!removedArea || !removedArea.id) {
            console.error("joinAreas util - Zone à supprimer invalide:", removedArea);
            throw new Error("Zone à supprimer invalide");
        }

        const newArea: AreaLayout = {
            type: "area",
            id: area.id,
        };

        console.log("joinAreas util - Fusion de 2 zones:", {
            keepAreaId: area.id,
            removedAreaId: removedArea.id
        });

        return { area: newArea, removedAreaId: removedArea.id };
    }

    // Cas général: rangée avec plus de 2 zones
    const area = row.areas[areaIndex];
    const areaToRemove = row.areas[areaToRemoveIndex];

    if (!area || !area.id || area.size === undefined) {
        console.error("joinAreas util - Zone source invalide:", area);
        throw new Error("Zone source invalide");
    }

    if (!areaToRemove || !areaToRemove.id || areaToRemove.size === undefined) {
        console.error("joinAreas util - Zone à supprimer invalide:", areaToRemove);
        throw new Error("Zone à supprimer invalide");
    }

    const newAreas = [...row.areas];
    newAreas[areaIndex] = {
        ...area,
        size: area.size + areaToRemove.size,
    };
    newAreas.splice(areaToRemoveIndex, 1);

    const newRow: AreaRowLayout = {
        ...row,
        areas: newAreas,
    };

    console.log("joinAreas util - Fusion réussie:", {
        rowId: row.id,
        keepAreaId: area.id,
        removedAreaId: areaToRemove.id,
        newSize: area.size + areaToRemove.size
    });

    return { area: newRow, removedAreaId: areaToRemove.id };
};
