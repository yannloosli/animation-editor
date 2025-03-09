import { Action, Middleware } from "@reduxjs/toolkit";
import { shapeActions } from "./shapeSlice";

export const shapeCompatibilityMiddleware: Middleware = (store) => (next) => (action) => {
    if (typeof action !== 'object' || !action || !('type' in action) || !('payload' in action)) {
        return next(action);
    }

    const typedAction = action as Action  & { payload: any };

    // Conversion des anciennes actions typesafe-actions vers les nouvelles actions RTK
    switch (typedAction.type) {
        case "shape/SET_STATE":
            return next(shapeActions.setState({ state: typedAction.payload.state }));

        case "shape/SET":
            return next(shapeActions.setShape({ shape: typedAction.payload.shape }));

        case "shape/REMOVE_SHAPE":
            return next(shapeActions.removeShape({ shapeId: typedAction.payload.shapeId }));

        case "shape/SET_PATH":
            return next(shapeActions.setPath({ path: typedAction.payload.path }));

        case "shape/SET_PATH_ITEM":
            return next(shapeActions.setPathItem({
                pathId: typedAction.payload.pathId,
                itemIndex: typedAction.payload.itemIndex,
                item: typedAction.payload.item,
            }));

        case "shape/SET_PATH_ITEM_PART":
            return next(shapeActions.setPathItemPart({
                pathId: typedAction.payload.pathId,
                itemIndex: typedAction.payload.itemIndex,
                which: typedAction.payload.which,
                part: typedAction.payload.part,
            }));

        case "shape/REMOVE_PATH":
            return next(shapeActions.removePath({ pathId: typedAction.payload.pathId }));

        case "shape/REMOVE_PATH_ITEM":
            return next(shapeActions.removePathItem({
                pathId: typedAction.payload.pathId,
                itemIndex: typedAction.payload.itemIndex,
            }));

        case "shape/SET_PATH_ITEM_CP_ID":
            return next(shapeActions.setPathItemControlPointId({
                pathId: typedAction.payload.pathId,
                which: typedAction.payload.which,
                itemIndex: typedAction.payload.itemIndex,
                controlPointId: typedAction.payload.controlPointId,
            }));

        case "shape/INSERT_PATH_ITEM":
            return next(shapeActions.insertPathItem({
                pathId: typedAction.payload.pathId,
                insertIndex: typedAction.payload.insertIndex,
                item: typedAction.payload.item,
            }));

        case "shape/APPEND_PATH_ITEM":
            return next(shapeActions.appendPathItem({
                pathId: typedAction.payload.pathId,
                item: typedAction.payload.item,
                direction: typedAction.payload.direction,
            }));

        default:
            return next(action);
    }
}; 
