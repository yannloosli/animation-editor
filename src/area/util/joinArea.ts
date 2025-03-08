import { AreaLayout, AreaRowLayout } from "~/types/areaTypes";

export const joinAreas = (
	row: AreaRowLayout,
	areaIndex: number,
	join: -1 | 1,
): { area: AreaRowLayout | AreaLayout; removedAreaId: string } => {
	if (areaIndex < 0 || areaIndex >= row.areas.length) {
		throw new Error(`Index 'areaIndex' (${areaIndex}) out of bounds for row of length ${row.areas.length}`);
	}

	if (row.areas.length === 2) {
		const area = row.areas[areaIndex];
		const removedArea = row.areas[areaIndex === 0 ? 1 : 0];
		const newArea: AreaLayout = {
			type: "area",
			id: area.id,
		};
		return { area: newArea, removedAreaId: removedArea.id };
	}

	const areaToRemoveIndex = areaIndex + join;
	if (areaToRemoveIndex < 0 || areaToRemoveIndex >= row.areas.length) {
		throw new Error(`Target index (${areaToRemoveIndex}) out of bounds for row of length ${row.areas.length}`);
	}

	const area = row.areas[areaIndex];
	const areaToRemove = row.areas[areaToRemoveIndex];

	const newAreas = [...row.areas];
	newAreas[areaIndex] = {
		...area,
		size: area.size + areaToRemove.size,
	};
	newAreas.splice(areaToRemoveIndex, 1);

	const newRow: AreaRowLayout = {
		...row,
		areas: newAreas,
	};
	return { area: newRow, removedAreaId: areaToRemove.id };
};
