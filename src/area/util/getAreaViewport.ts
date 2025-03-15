import { AREA_BORDER_WIDTH, AreaType, TOOLBAR_HEIGHT } from "~/constants";

export const getAreaRootViewport = () => {
    const height = Math.max(0, Math.floor(window.innerHeight - TOOLBAR_HEIGHT));
    const width = Math.max(0, Math.floor(window.innerWidth));

    const viewport: Rect = {
        y: TOOLBAR_HEIGHT,
        x: 0,
        height,
        width,
    };

    // Vérification des valeurs NaN
    if (isNaN(viewport.height) || isNaN(viewport.width)) {
        console.error('Invalid viewport dimensions:', viewport);
        return {
            y: TOOLBAR_HEIGHT,
            x: 0,
            height: 100,
            width: 100,
        };
    }

    return viewport;
};

let viewportMap: { [key: string]: Rect } = {};

export const _setAreaViewport = (_viewportMap: { [key: string]: Rect }) => {
    // Vérification des dimensions invalides
    Object.entries(_viewportMap).forEach(([key, rect]) => {
        if (isNaN(rect.width) || isNaN(rect.height) ||
            isNaN(rect.x) || isNaN(rect.y)) {
            console.error(`Invalid dimensions for area ${key}:`, rect);
            _viewportMap[key] = {
                x: rect.x || 0,
                y: rect.y || 0,
                width: rect.width || 100,
                height: rect.height || 100,
            };
        }
    });
    viewportMap = _viewportMap;
};

export const getAreaViewport = (areaId: string, _: AreaType): Rect => {
    const viewport = viewportMap[areaId];
    if (!viewport) {
        console.error(`No viewport found for area ${areaId}`);
        return {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        };
    }

    const componentViewport: Rect = {
        x: viewport.x + AREA_BORDER_WIDTH,
        y: viewport.y + AREA_BORDER_WIDTH,
        width: Math.max(0, viewport.width - AREA_BORDER_WIDTH * 2),
        height: Math.max(0, viewport.height - AREA_BORDER_WIDTH * 2),
    };

    return componentViewport;
};
