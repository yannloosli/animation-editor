import { compositionConstants } from "~/composition/compositionConstants";
import { CompositionState } from "~/composition/compositionSlice";
import { TIMELINE_HEADER_HEIGHT, TIMELINE_LAYER_HEIGHT } from "~/constants";
import { getTimelineTrackYPositions } from "~/trackEditor/trackEditorUtils";
import { LayerType } from "~/types";
import { isVecInRect } from "~/util/math";
import { Vec2 } from "~/util/math/vec2";

export const getLayerTypeName = (type: LayerType): string => {
	const key = LayerType[type] as keyof typeof LayerType;
	return compositionConstants.layerTypeToName[key];
};

export const getPickWhipLayerTarget = (
	globalMousePosition: Vec2,
	fromLayerId: string,
	compositionId: string,
	compositionState: CompositionState,
	panY: number,
	viewport: Rect,
): {
	layerId: string;
} | null => {
	const yPosMap = getTimelineTrackYPositions(compositionId, compositionState, panY);

	const mousePos = globalMousePosition
		.subXY(viewport.x, viewport.y)
		.subY(TIMELINE_HEADER_HEIGHT);

	const layerIds = getValidLayerParentLayerIds(fromLayerId, compositionState);

	for (let i = 0; i < layerIds.length; i += 1) {
		const layerId = layerIds[i];
		if (layerId === fromLayerId) {
			continue;
		}

		const y = yPosMap.layer[layerId];

		const rect: Rect = {
			x: 0,
			y,
			height: TIMELINE_LAYER_HEIGHT,
			width: viewport.width,
		};

		if (isVecInRect(mousePos, rect)) {
			return { layerId: layerId };
		}
	}

	return null;
};

export const getValidLayerParentLayerIds = (
	layerId: string,
	compositionState: CompositionState,
) => {
	const layer = compositionState.layers[layerId];
	const composition = compositionState.compositions[layer.compositionId];
	const layerIds = composition.layers.filter((id) => id !== layer.id);

	const isReferencedBy = (id: string): boolean => {
		const layer = compositionState.layers[id];
		if (!layer.parentLayerId) {
			return false;
		}
		if (layer.parentLayerId === layerId) {
			return true;
		}
		return isReferencedBy(layer.parentLayerId);
	};

	return layerIds.filter((layerId) => !isReferencedBy(layerId));
};

export const getLayerRect = (
	layerId: string,
	compositionState: CompositionState,
	viewport: Rect,
): Rect => {
	const layer = compositionState.layers[layerId];
	const composition = compositionState.compositions[layer.compositionId];

	const layerIndex = composition.layers.indexOf(layerId);
	const y = TIMELINE_HEADER_HEIGHT + layerIndex * TIMELINE_LAYER_HEIGHT;

	return {
		x: viewport.x,
		y,
		width: viewport.width,
		height: TIMELINE_LAYER_HEIGHT,
	};
};
