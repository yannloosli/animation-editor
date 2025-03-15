/**
 * Ce fichier contient des adaptateurs pour résoudre les incompatibilités entre les différentes
 * versions du type ActionState pendant la migration vers Redux Toolkit.
 */

import { AreaWithId } from "~/area/state/areaAdapter";
import { Area, AreaToOpen } from "~/types/areaTypes";
import { Vec2 } from "~/util/math/vec2";

/**
 * Interface pour la version sérialisée de AreaToOpen
 */
export interface SerializedAreaToOpen {
    position: { x: number; y: number };
    area: AreaWithId;
}

/**
 * Convertit un AreaToOpen en SerializedAreaToOpen
 */
export function serializeAreaToOpen(areaToOpen: AreaToOpen | null): SerializedAreaToOpen | null {
    if (!areaToOpen) return null;

    return {
        position: { x: areaToOpen.position.x, y: areaToOpen.position.y },
        area: {
            ...areaToOpen.area,
            id: "temp-id", // Ajoute l'ID manquant
        } as AreaWithId,
    };
}

/**
 * Convertit un SerializedAreaToOpen en AreaToOpen
 */
export function deserializeAreaToOpen(serialized: SerializedAreaToOpen | null): AreaToOpen | null {
    if (!serialized) return null;

    return {
        position: Vec2.new(serialized.position.x, serialized.position.y),
        area: {
            type: serialized.area.type,
            state: serialized.area.state,
        } as Area,
    };
}

/**
 * Fonction utilitaire pour adapter l'état de l'action à utiliser avec les fonctions
 * qui attendent l'ancien type ActionState
 */
export function adaptActionState(actionState: any): any {
    // Si l'état a déjà la structure attendue, on le retourne tel quel
    if (!actionState.area.areaToOpen ||
        (actionState.area.areaToOpen && 'id' in actionState.area.areaToOpen.area)) {
        return actionState;
    }

    // Sinon, on adapte l'état pour qu'il soit compatible
    return {
        ...actionState,
        area: {
            ...actionState.area,
            areaToOpen: serializeAreaToOpen(actionState.area.areaToOpen),
        },
    };
} 
