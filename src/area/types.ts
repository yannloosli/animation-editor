import { CardinalDirection } from "~/types";
import { Area, AreaLayout, AreaRowLayout, AreaToOpen } from "~/types/areaTypes";

export interface AreaState {
    _id: number;
    rootId: string;
    joinPreview: null | {
        areaId: string | null;
        movingInDirection: CardinalDirection | null;
        eligibleAreaIds: string[];
    };
    layout: {
        [key: string]: AreaRowLayout | AreaLayout;
    };
    areas: {
        [key: string]: Area;
    };
    areaToOpen: null | AreaToOpen;
}

// Pour la rétrocompatibilité pendant la migration
export type AreaReducerState = AreaState; 
