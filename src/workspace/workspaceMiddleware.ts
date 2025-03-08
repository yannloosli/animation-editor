import { Middleware } from "redux";
import { Vec2 } from "~/util/math/vec2";
import workspaceSlice from "./workspaceSlice";

export const workspaceMiddleware: Middleware = (store) => (next) => (action) => {
    // Conversion des anciennes actions typesafe-actions en actions RTK
    if (action.type === "workspaceArea/SET_FIELDS") {
        const fields = { ...action.payload.fields };
        
        // Convertir le Vec2 en objet simple si présent
        if (fields.pan instanceof Vec2) {
            fields.pan = { x: fields.pan.x, y: fields.pan.y };
        }
        
        return next(workspaceSlice.actions.setFields(fields));
    }
    return next(action);
}; 
