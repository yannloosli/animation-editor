import { Action, Middleware } from "@reduxjs/toolkit";
import { areaSlice } from "./areaSlice";

interface TypedAction extends Action {
    payload: any;
}

export const areaCompatibilityMiddleware: Middleware = (store) => (next) => (incomingAction: unknown) => {
    const action = incomingAction as TypedAction;
    
    // Conversion des anciennes actions typesafe-actions vers les nouvelles actions RTK
    if (action.type === "area/SET_FIELDS") {
        return next(areaSlice.actions.setFields(action.payload.fields));
    }
    
    if (action.type === "area/SET_JOIN_PREVIEW") {
        return next(areaSlice.actions.setJoinAreasPreview({
            areaId: action.payload.areaId,
            from: action.payload.from,
            eligibleAreaIds: action.payload.eligibleAreaIds
        }));
    }

    if (action.type === "area/JOIN_AREAS") {
        return next(areaSlice.actions.joinAreas({
            areaRowId: action.payload.areaRowId,
            areaIndex: action.payload.areaIndex,
            mergeInto: action.payload.mergeInto
        }));
    }

    if (action.type === "area/INSERT_AREA_INTO_ROW") {
        return next(areaSlice.actions.insertAreaIntoRow({
            rowId: action.payload.rowId,
            area: action.payload.area,
            insertIndex: action.payload.insertIndex
        }));
    }

    if (action.type === "area/CONVERT_AREA_TO_ROW") {
        return next(areaSlice.actions.convertAreaToRow({
            areaId: action.payload.areaId,
            cornerParts: action.payload.cornerParts,
            horizontal: action.payload.horizontal
        }));
    }

    if (action.type === "area/SET_ROW_SIZES") {
        return next(areaSlice.actions.setRowSizes({
            rowId: action.payload.rowId,
            sizes: action.payload.sizes
        }));
    }

    if (action.type === "area/WRAP_AREA_ROW") {
        return next(areaSlice.actions.wrapAreaInRow({
            areaId: action.payload.areaId,
            orientation: action.payload.orientation
        }));
    }

    if (action.type === "area/SET_TYPE") {
        return next(areaSlice.actions.setAreaType({
            areaId: action.payload.areaId,
            type: action.payload.type,
            initialState: action.payload.initialState
        }));
    }

    if (action.type === "area/DISPATCH_TO_AREA_STATE") {
        return next(areaSlice.actions.dispatchToAreaState({
            areaId: action.payload.areaId,
            action: action.payload.action
        }));
    }

    return next(incomingAction);
}; 
