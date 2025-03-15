import React from "react";
import { useSelector } from "react-redux";
import AreaRootStyles from "~/area/components/AreaRoot.styles";
import { selectAreaToOpen } from "~/area/state/areaSelectors";
import { getAreaToOpenPlacementInViewport, PlaceArea } from "~/area/util/areaUtils";
import { AREA_BORDER_WIDTH } from "~/constants";
import { RootState } from "~/state/store-init";
import { contractRect } from "~/util/math";
import { Vec2 } from "~/util/math/vec2";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(AreaRootStyles);

interface Props {
	areaToViewport: { [areaId: string]: Rect };
}

export const AreaToOpenPreview: React.FC<Props> = (props) => {
	const { areaToViewport } = props;
	
	// Utiliser le nouveau sélecteur
	const areaToOpen = useSelector((state: RootState) => selectAreaToOpen(state));
	
	if (!areaToOpen) {
		return null;
	}
	
	const { position, area } = areaToOpen;
	
	// Trouver l'area sous la position
	const areaUnderPosition = Object.entries(areaToViewport).find(([_, viewport]) => {
		return (
			position.x >= viewport.x &&
			position.x <= viewport.x + viewport.width &&
			position.y >= viewport.y &&
			position.y <= viewport.y + viewport.height
		);
	});
	
	if (!areaUnderPosition) {
		return null;
	}
	
	const [areaId, viewport] = areaUnderPosition;
	
	// Calculer le placement en utilisant la signature correcte
	// getAreaToOpenPlacementInViewport(rect: Rect, position: Vec2)
	const placement = getAreaToOpenPlacementInViewport(viewport, Vec2.new(position.x, position.y));
	
	// Calculer le rectangle de prévisualisation
	const previewRect = calculatePreviewRect(viewport, placement);
	
	return (
		<div
			className={s("areaToOpenContainer")}
			style={{
				left: previewRect.x,
				top: previewRect.y,
				width: previewRect.width,
				height: previewRect.height,
				position: "absolute",
				backgroundColor: "rgba(0, 0, 0, 0.1)",
				border: "1px solid rgba(0, 0, 0, 0.2)",
				pointerEvents: "none",
			}}
		/>
	);
};

// Fonction pour calculer le rectangle de prévisualisation
function calculatePreviewRect(viewport: Rect, placement: PlaceArea): Rect {
	if (placement === "replace") {
		return contractRect(viewport, AREA_BORDER_WIDTH);
	}
	
	const halfWidth = viewport.width / 2;
	const halfHeight = viewport.height / 2;
	
	switch (placement) {
		case "top":
			return {
				x: viewport.x,
				y: viewport.y,
				width: viewport.width,
				height: halfHeight,
			};
		case "right":
			return {
				x: viewport.x + halfWidth,
				y: viewport.y,
				width: halfWidth,
				height: viewport.height,
			};
		case "bottom":
			return {
				x: viewport.x,
				y: viewport.y + halfHeight,
				width: viewport.width,
				height: halfHeight,
			};
		case "left":
			return {
				x: viewport.x,
				y: viewport.y,
				width: halfWidth,
				height: viewport.height,
			};
		default:
			return viewport;
	}
}
