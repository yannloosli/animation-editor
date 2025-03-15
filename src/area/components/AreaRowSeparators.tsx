import React from "react";
import { handleDragAreaResize } from "~/area/handlers/areaDragResize";
import { AREA_BORDER_WIDTH } from "~/constants";
import { cssZIndex } from "~/cssVariables";
import { AreaRowLayout } from "~/types/areaTypes";
import { compileStylesheet } from "~/util/stylesheets";

const s = compileStylesheet(({ css }) => ({
	separator: css`
		position: absolute;
		z-index: ${cssZIndex.area.separator};
		cursor: ns-resize;
		transition: background-color 0.1s ease;
		background-color: transparent;

		&:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}

		&--horizontal {
			cursor: ew-resize;
		}
	`,
}));

interface OwnProps {
	row: AreaRowLayout;
	areaToViewport: MapOf<Rect>;
}
type Props = OwnProps;

export const AreaRowSeparators: React.FC<Props> = props => {
	const { row, areaToViewport } = props;

	// Vérifier que les données nécessaires sont disponibles
	if (!row || !row.areas || row.areas.length <= 1 || !areaToViewport) {
		return null;
	}

	return (
		<>
			{row.areas.slice(1).map((area, i) => {
				const viewport = areaToViewport[area.id];
				
				// Vérifier que le viewport existe
				if (!viewport) {
					return null;
				}
				
				const horizontal = row.orientation === "horizontal";

				// Calculer la position et la taille du séparateur
				const separatorRect = horizontal
					? {
							height: viewport.height - AREA_BORDER_WIDTH * 4,
							width: AREA_BORDER_WIDTH * 2,
							left: viewport.x - AREA_BORDER_WIDTH,
							top: viewport.y + AREA_BORDER_WIDTH * 2,
					  }
					: {
							height: AREA_BORDER_WIDTH * 2,
							width: viewport.width - AREA_BORDER_WIDTH * 4,
							left: viewport.x + AREA_BORDER_WIDTH * 2,
							top: viewport.y - AREA_BORDER_WIDTH,
					  };

				// Ajouter une zone de capture plus large pour faciliter le redimensionnement
				const hitAreaRect = horizontal
					? {
							...separatorRect,
							width: Math.max(10, separatorRect.width), // Au moins 10px de large
							left: separatorRect.left - 4, // Centrer la zone de capture
					  }
					: {
							...separatorRect,
							height: Math.max(10, separatorRect.height), // Au moins 10px de haut
							top: separatorRect.top - 4, // Centrer la zone de capture
					  };

				return (
					<div
						key={area.id}
						className={s("separator", { horizontal })}
						style={hitAreaRect}
						onMouseDown={e => handleDragAreaResize(e, row, horizontal, i + 1)}
						title={horizontal ? "Redimensionner horizontalement" : "Redimensionner verticalement"}
					/>
				);
			})}
		</>
	);
};
