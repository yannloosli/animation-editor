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
	console.log("[RENDER] Updating ellipse graphic with map:", map);
	
	const { ellipse } = layer;
	if (!ellipse) {
		console.error("[RENDER] No ellipse state found for layer", layer.id);
		return;
	}
	
	console.log("[RENDER] Ellipse state:", ellipse);
	
	const fill = getPropertyValue(map[PropertyName.Fill]);
	console.log("[RENDER] Fill:", fill);
	
	const strokeWidth = getPropertyValue(map[PropertyName.StrokeWidth]);
	console.log("[RENDER] Stroke width:", strokeWidth);
	
	const strokeColor = getPropertyValue(map[PropertyName.StrokeColor]);
	console.log("[RENDER] Stroke color:", strokeColor);

	const [r, g, b, a] = fill;
	graphic.beginFill(rgbToBinary([r, g, b]), a);

	if (strokeWidth > 0) {
		const [r, g, b, a] = strokeColor;
		graphic.lineTextureStyle({ color: rgbToBinary([r, g, b]), alpha: a, width: strokeWidth });
	}

	console.log("[RENDER] Drawing ellipse at", ellipse.center, "with radius", ellipse.radius);
	graphic.drawEllipse(ellipse.center.x, ellipse.center.y, ellipse.radius, ellipse.radius);
	console.log("[RENDER] Ellipse drawn");
};

export const updateEllipseHitTestLayerGraphic: UpdateGraphicFn<EllipseLayerPropertyMap> = (
	actionState,
	layer,
	graphic,
	map,
	getPropertyValue,
) => {
	console.log("[RENDER] Updating ellipse hit test graphic");
	
	const { ellipse } = layer;
	if (!ellipse) {
		console.error("[RENDER] No ellipse state found for layer", layer.id);
		return;
	}
	
	const strokeWidth = getPropertyValue(map[PropertyName.StrokeWidth]);
	console.log("[RENDER] Hit test stroke width:", strokeWidth);

	graphic.beginFill(rgbToBinary(hslToRGB([300, 80, 76])), 1);

	const R = ellipse.radius + strokeWidth / 2;
	console.log("[RENDER] Drawing hit test ellipse at", ellipse.center, "with radius", R);
	graphic.drawEllipse(ellipse.center.x, ellipse.center.y, R, R);
	console.log("[RENDER] Hit test ellipse drawn");
};
