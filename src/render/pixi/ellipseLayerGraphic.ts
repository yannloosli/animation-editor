import { EllipseLayerPropertyMap } from "~/composition/layer/layerPropertyMap";
import { UpdateGraphicFn } from "~/render/pixi/layerToPixi";
import { PropertyName } from "~/types";
import { hslToRGB, rgbToBinary } from "~/util/color/convertColor";

export const updateEllipseLayerGraphic: UpdateGraphicFn<EllipseLayerPropertyMap> = (
    actionState,
    layer,
    graphic,
    map,
    getPropertyValue,
) => {


    const { ellipse } = layer;
    if (!ellipse) {
        console.error("[RENDER] No ellipse state found for layer", layer.id);
        return;
    }



    const fill = getPropertyValue(map[PropertyName.Fill]);


    const strokeWidth = getPropertyValue(map[PropertyName.StrokeWidth]);


    const strokeColor = getPropertyValue(map[PropertyName.StrokeColor]);


    const [r, g, b, a] = fill;
    graphic.beginFill(rgbToBinary([r, g, b]), a);

    if (strokeWidth > 0) {
        const [r, g, b, a] = strokeColor;
        graphic.lineTextureStyle({ color: rgbToBinary([r, g, b]), alpha: a, width: strokeWidth });
    }


    graphic.drawEllipse(ellipse.center.x, ellipse.center.y, ellipse.radius, ellipse.radius);

};

export const updateEllipseHitTestLayerGraphic: UpdateGraphicFn<EllipseLayerPropertyMap> = (
    actionState,
    layer,
    graphic,
    map,
    getPropertyValue,
) => {


    const { ellipse } = layer;
    if (!ellipse) {
        console.error("[RENDER] No ellipse state found for layer", layer.id);
        return;
    }

    const strokeWidth = getPropertyValue(map[PropertyName.StrokeWidth]);


    graphic.beginFill(rgbToBinary(hslToRGB([300, 80, 76])), 1);

    const R = ellipse.radius + strokeWidth / 2;

    graphic.drawEllipse(ellipse.center.x, ellipse.center.y, R, R);

};
