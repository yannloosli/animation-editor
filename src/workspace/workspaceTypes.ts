import { SerializableVec2 } from "~/util/math/types";

export interface WorkspaceAreaState {
    compositionId: string;
    pan: SerializableVec2;
    scale: number;
    selectionRect: Rect | null;
}

export const initialWorkspaceState: WorkspaceAreaState = {
    compositionId: "default",
    pan: { x: 0, y: 0 },
    scale: 1,
    selectionRect: null,
}; 
