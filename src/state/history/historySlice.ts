import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Diff } from '~/diff/diffs';

export interface HistoryItem {
    state: any;
    name: string;
    modifiedRelated: boolean;
    allowIndexShift: boolean;
    diffs: Diff[];
}

export interface HistoryState {
    type: "normal" | "selection";
    list: HistoryItem[];
    index: number;
    indexDirection: -1 | 1;
    action: null | {
        id: string;
        state: any;
    };
}

const initialState: HistoryState = {
    type: "normal",
    list: [],
    index: -1,
    indexDirection: 1,
    action: null
};

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        moveIndex: (state, action: PayloadAction<{ index: number }>) => {
            if (state.action) {
                console.warn("Attempted to move history list index with an action in process.");
                return;
            }

            const { index } = action.payload;
            state.index = index;
            state.indexDirection = index > state.index ? 1 : -1;
        },

        startAction: (state, action: PayloadAction<{ actionId: string }>) => {
            const { actionId } = action.payload;

            if (state.action) {
                console.warn("Attempted to start an action while another is in progress.");
                return;
            }

            const shiftForward =
                state.type === "selection" &&
                state.indexDirection === -1 &&
                state.list[state.index + 1]?.modifiedRelated &&
                state.list[state.index + 1]?.allowIndexShift;

            const currentState = state.list[state.index + (shiftForward ? 1 : 0)]?.state;
            if (!currentState) {
                console.warn("No valid state found in history list");
                return;
            }

            state.action = {
                id: actionId,
                state: currentState
            };
        },

        submitAction: (state, action: PayloadAction<{
            actionId: string;
            name: string;
            modifiesHistory: boolean;
            modifiedKeys: string[];
            allowIndexShift: boolean;
            diffs: Diff[];
            newState: any;
        }>) => {
            const {
                actionId,
                name,
                modifiesHistory,
                modifiedKeys,
                allowIndexShift,
                diffs,
                newState
            } = action.payload;

            if (!modifiesHistory) {
                state.action = null;
                return;
            }

            if (!state.action) {
                console.warn("Attempted to submit an action that does not exist.");
                return;
            }

            if (state.action.id !== actionId) {
                console.warn("Attempted to submit with the wrong action id.");
                return;
            }

            // Tronquer l'historique à partir de l'index actuel
            state.list = state.list.slice(0, state.index + 1);
            
            // Ajouter le nouvel état
            state.list.push({
                state: newState,
                name,
                modifiedRelated: modifiedKeys.length > 0,
                allowIndexShift,
                diffs
            });

            state.index += 1;
            state.indexDirection = 1;
            state.action = null;
        },

        cancelAction: (state, action: PayloadAction<{ actionId: string }>) => {
            const { actionId } = action.payload;

            if (!state.action) {
                console.warn("Attempted to cancel an action that does not exist.");
                return;
            }

            if (state.action.id !== actionId) {
                console.warn("Attempted to cancel with the wrong action id.");
                return;
            }

            state.action = null;
        },

        clear: (state) => {
            state.list = [];
            state.index = -1;
            state.action = null;
        }
    }
});

export const { 
    moveIndex, 
    startAction, 
    submitAction, 
    cancelAction,
    clear 
} = historySlice.actions;

export default historySlice.reducer; 
