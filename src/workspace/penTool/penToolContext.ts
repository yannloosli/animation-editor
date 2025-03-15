import * as PIXI from "pixi.js";
import { createLayerViewportMatrices } from "~/composition/layer/constructLayerMatrix";
import { createPropertyManager } from "~/composition/manager/property/propertyManager";
import { AreaType } from "~/constants";
import { ShapeSelectionState } from "~/shape/shapeSelectionSlice";
import { ShapeState } from "~/shape/shapeSlice";
import { getActionState, getAreaActionState } from "~/state/stateUtils";
import { MousePosition } from "~/types";
import { Rect as MathRect } from "~/util/math/types";
import { Vec2 } from "~/util/math/vec2";

// Fonction utilitaire pour convertir un Point PIXI en Vec2
const pointToVec2 = (point: PIXI.Point): Vec2 => {
    return Vec2.new(point.x, point.y);
};

export interface PenToolContext {
    mousePosition: MousePosition;
    compositionId: string;
    viewport: MathRect;
    areaId: string;
    layerId: string;
    matrix: PIXI.Matrix;
    normalToViewport: (vec: Vec2) => Vec2;
    globalToNormal: (vec: Vec2) => Vec2;
    viewportToNormal: (vec: Vec2) => Vec2;
    shapeState: ShapeState;
    shapeSelectionState: ShapeSelectionState;
}

export const constructPenToolContext = (
    globalMousePosition: Vec2,
    layerId: string,
    areaId: string,
    viewport: MathRect,
): PenToolContext => {
    const actionState = getActionState();
    const areaState = getAreaActionState<AreaType.Workspace>(areaId);
    const { compositionId, scale, pan: _pan } = areaState;
    const pan = Vec2.new(_pan.x, _pan.y).add(Vec2.new(viewport.width / 2, viewport.height / 2));

    const propertyManager = createPropertyManager(compositionId, actionState);

    const matrices = createLayerViewportMatrices(
        actionState,
        propertyManager.getPropertyValue,
        layerId,
        scale,
    );

    const normalToViewport = (vec: Vec2): Vec2 => {
        const point = matrices.content.apply(vec);
        return vec.apply(() => pointToVec2(point)).add(pan);
    };

    const globalToNormal = (vec: Vec2) => {
        return vec
            .subXY(viewport.x, viewport.y)
            .sub(pan)
            .apply(() => {
                const point = matrices.content.applyInverse(vec);
                return pointToVec2(point);
            });
    };

    const viewportToNormal = (vec: Vec2) => {
        const point = matrices.content.applyInverse(vec);
        return Vec2.new(point.x, point.y);
    };

    const mousePosition: MousePosition = {
        global: globalMousePosition,
        viewport: globalMousePosition.subXY(viewport.x, viewport.y),
        normal: globalToNormal(globalMousePosition),
    };

    const ctx: PenToolContext = {
        mousePosition,
        compositionId,
        layerId,
        matrix: matrices.content,
        normalToViewport,
        viewportToNormal,
        globalToNormal,
        shapeState: actionState.shapeState,
        shapeSelectionState: actionState.shapeSelectionState,
        viewport,
        areaId,
    };
    return ctx;
};
