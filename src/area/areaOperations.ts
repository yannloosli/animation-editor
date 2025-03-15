import {
    insertAreaIntoRow,
    setAreaType,
    setFields,
    setRowSizes,
    wrapAreaInRow
} from "~/area/state/areaSlice";
import { computeAreaToParentRow } from "~/area/util/areaToParentRow";
import { PlaceArea } from "~/area/util/areaUtils";
import { Operation } from "~/types";
import { Area, AreaRowLayout, AreaRowOrientation } from "~/types/areaTypes";

// Adapter l'Area pour inclure l'id requis par AreaWithId
interface AreaWithId extends Area {
    id: string;
}

function dragArea(op: Operation, area: Area & { id?: string }, targetAreaId: string, placement: PlaceArea) {
    op.add(setFields({ areaToOpen: null }));

    const areaState = op.state.area;

    if (placement === "replace") {
        op.add(setAreaType({ areaId: targetAreaId, type: area.type, initialState: area.state }));
        return;
    }

    let orientation: AreaRowOrientation;
    let iOff: 0 | 1;

    switch (placement) {
    case "top":
    case "left":
        iOff = 0;
        break;
    case "bottom":
    case "right":
        iOff = 1;
        break;
    }

    switch (placement) {
    case "bottom":
    case "top":
        orientation = "vertical";
        break;
    case "left":
    case "right":
        orientation = "horizontal";
        break;
    }

    // Adapter pour la nouvelle structure AreaState
    const areaToParentRow = computeAreaToParentRow(areaState as any);

    const parentRow = areaState.layout[areaToParentRow[targetAreaId]] as AreaRowLayout | undefined;

    if (parentRow && parentRow.orientation === orientation) {
        const targetIndex = parentRow.areas.map((x) => x.id).indexOf(targetAreaId);
        const insertIndex = targetIndex + iOff;

        // Assurer que area a un id
        const areaWithId = area as AreaWithId;
        if (!areaWithId.id) {
            areaWithId.id = `area-${Date.now()}`;
        }

        op.add(insertAreaIntoRow({ rowId: parentRow.id, area: areaWithId, insertIndex }));

        const sizes = parentRow.areas.map((x) => x.size);
        const size = sizes[targetIndex] / 2;
        sizes.splice(targetIndex, 0, 1);
        sizes[targetIndex] = size;
        sizes[targetIndex + 1] = size;
        op.add(setRowSizes({ rowId: parentRow.id, sizes }));
        return;
    }

    op.add(wrapAreaInRow({ areaId: targetAreaId, orientation }));
    const newRowId = (areaState._id + 1).toString();

    // Assurer que area a un id
    const areaWithId = area as AreaWithId;
    if (!areaWithId.id) {
        areaWithId.id = `area-${Date.now()}`;
    }

    op.add(insertAreaIntoRow({ rowId: newRowId, area: areaWithId, insertIndex: iOff }));
    op.add(setRowSizes({ rowId: newRowId, sizes: [1, 1] }));
    op.addDiff((diff) => diff.resizeAreas());
}

export const areaOperations = {
    dragArea,
};
