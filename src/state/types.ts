import { Diff } from "~/diff/diffs";
import { PenToolState } from "~/workspace/penTool/penToolSlice";

export interface HistoryState<S = unknown> {
    type: "normal" | "selection";
    list: Array<{
        state: S;
        name: string;
        modifiedRelated: boolean;
        allowIndexShift: boolean;
        diffs: Diff[];
    }>;
    index: number;
    indexDirection: -1 | 1;
    action: null | {
        id: string;
        state: S;
    };
}

declare global {
    interface ApplicationState {
        // ... autres états ...
        history: HistoryState;
        penTool: PenToolState;
    }

    interface ActionState {
        // ... autres états ...
        penTool: PenToolState;
    }
} 
