import { AreaReducerState } from "~/area/types";

// Type pour la compatibilité avec la nouvelle structure AreaState
interface CompatibleAreaState {
    layout: Record<string, any>;
    areas: {
        ids?: string[];
        entities?: Record<string, any>;
        [key: string]: any;
    };
}

export const computeAreaToParentRow = (areaState: AreaReducerState | CompatibleAreaState) => {
    const areaToParentRow: { [key: string]: string } = {};

    const keys = Object.keys(areaState.layout);
    for (let i = 0; i < keys.length; i += 1) {
        const layout = areaState.layout[keys[i]];

        if (layout.type === "area") {
            continue;
        }

        for (let j = 0; j < layout.areas.length; j += 1) {
            areaToParentRow[layout.areas[j].id] = layout.id;
        }
    }

    return areaToParentRow;
};
