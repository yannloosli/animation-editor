import { AreaReducerState } from "~/area/types";

export const computeAreaRowToMinSize = (rootId: string, areaLayout: AreaReducerState["layout"]) => {
    if (!rootId || !areaLayout || !areaLayout[rootId]) {
        console.warn('Invalid parameters in computeAreaRowToMinSize', { rootId, areaLayout });
        return {};
    }

    const rowToMinSize: { [areaId: string]: { width: number; height: number } } = {};

    const root = areaLayout[rootId];

    if (root.type === "area") {
        return {};
    }

    function compute(id: string): { height: number; width: number } {
        const layout = areaLayout[id];

        if (!layout) {
            console.warn(`Layout not found for area ${id}`);
            return { width: 1, height: 1 };
        }

        if (layout.type === "area") {
            return { width: 1, height: 1 };
        }

        const result = { height: 0, width: 0 };

        const items = layout.areas.map((item) => {
            return compute(item.id);
        });

        if (layout.orientation === "horizontal") {
            result.width = items.reduce((acc, item) => acc + item.width, 0);
            result.height = Math.max(...items.map((item) => item.height));
        } else {
            result.height = items.reduce((acc, item) => acc + item.height, 0);
            result.width = Math.max(...items.map((item) => item.width));
        }

        rowToMinSize[id] = result;
        return result;
    }

    rowToMinSize[rootId] = compute(rootId);

    return rowToMinSize;
};
