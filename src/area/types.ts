import { CardinalDirection } from "~/types";
import { Area, AreaLayout, AreaRowLayout, AreaToOpen } from "~/types/areaTypes";

/**
 * Interface pour Area avec un ID explicite
 * Cette interface étend l'interface Area de base en ajoutant un champ id explicite
 * Utilisée pour assurer la cohérence des types dans les gestionnaires d'événements
 */
export interface AreaWithId extends Area {
    id: string;
}

/**
 * État global du module AREA
 * Contient toutes les informations nécessaires pour gérer les zones de l'interface
 */
export interface AreaState {
    /** Identifiant unique pour l'état (utilisé pour l'historique) */
    _id: number;

    /** Identifiant de la zone racine */
    rootId: string;

    /** Prévisualisation de jointure entre zones */
    joinPreview: null | {
        /** Identifiant de la zone en cours de déplacement */
        areaId: string | null;

        /** Direction du déplacement */
        movingInDirection: CardinalDirection | null;

        /** Identifiants des zones éligibles pour la jointure */
        eligibleAreaIds: string[];
    };

    /** Disposition des zones et rangées */
    layout: {
        [key: string]: AreaRowLayout | AreaLayout;
    };

    /** Zones disponibles */
    areas: {
        [key: string]: Area;
    };

    /** Zone à ouvrir (prévisualisation) */
    areaToOpen: null | AreaToOpen;
}

/**
 * Type pour la rétrocompatibilité pendant la migration
 * Permet d'utiliser l'ancien nom de type dans le code existant
 */
export type AreaReducerState = AreaState;

/**
 * Type pour les positions de placement d'une zone
 * Utilisé pour déterminer où placer une nouvelle zone par rapport à une zone existante
 */
export type AreaPlacement = 'replace' | 'left' | 'right' | 'top' | 'bottom';

/**
 * Interface pour les options de création d'une nouvelle zone
 */
export interface CreateAreaOptions {
    /** Type de la zone à créer */
    type: string;

    /** État initial de la zone */
    initialState?: any;

    /** Position de placement par rapport à la zone existante */
    placement?: AreaPlacement;
} 
