import { CardinalDirection } from "~/types";
import { AreaRowLayout } from "~/types/areaTypes";

const shouldInsertAtStart = (
	cornerParts: [CardinalDirection, CardinalDirection],
	horizontal: boolean,
): boolean => {
	if (horizontal) {
		return cornerParts.includes("w");
	}
	return cornerParts.includes("n");
};

export const areaToRow = (
	rowId: string,
	idForOldArea: string,
	idForNewArea: string,
	horizontal: boolean,
	cornerParts: [CardinalDirection, CardinalDirection],
): AreaRowLayout => {
	// Vérifier les paramètres
	if (!rowId || !idForOldArea || !idForNewArea) {
		throw new Error('Missing required IDs');
	}

	// Créer les areas avec des tailles égales
	const rowAreas = [
		{ size: 0.5, id: idForOldArea },
		{ size: 0.5, id: idForNewArea }
	];

	// Déterminer l'ordre des areas en fonction des coins
	const insertFirst = shouldInsertAtStart(cornerParts, horizontal);
	if (insertFirst) {
		rowAreas.reverse();
	}

	// Créer la nouvelle row avec le type explicite
	const row: AreaRowLayout = {
		type: "area_row" as const,
		id: rowId,
		areas: rowAreas,
		orientation: horizontal ? "horizontal" as const : "vertical" as const,
	};

	// Vérification finale de la structure
	if (row.type !== "area_row") {
		throw new Error('Invalid row type created');
	}
	if (!row.areas || row.areas.length !== 2) {
		throw new Error('Invalid row areas created');
	}
	if (!row.orientation) {
		throw new Error('Invalid row orientation');
	}

	return row;
};
