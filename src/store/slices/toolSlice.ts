import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tool, toolGroups } from '~/constants';

// Interface pour l'état des outils
export interface ToolState {
    selected: Tool;
    selectedInGroup: Record<string, Tool>;
    openGroupIndex: number | null;
    temporaryAction: null | {
        id: string;
        state: {
            selected: Tool;
            selectedInGroup: Record<string, Tool>;
            openGroupIndex: number | null;
        };
    };
}

// État initial
const initialState: ToolState = {
    selected: Tool.Select,
    selectedInGroup: Object.fromEntries(
        toolGroups.map((group, i) => [i.toString(), group.tools[0]])
    ),
    openGroupIndex: null,
    temporaryAction: null
};

// Création du slice avec Redux Toolkit
const toolSlice = createSlice({
    name: 'tool',
    initialState,
    reducers: {
        // Action pour sélectionner un outil
        selectTool: (state, action: PayloadAction<Tool>) => {
            state.selected = action.payload;

            // Fermer le groupe ouvert
            state.openGroupIndex = null;

            // Mettre à jour l'outil sélectionné dans son groupe
            toolGroups.forEach((group, groupIndex) => {
                if (group.tools.includes(action.payload)) {
                    state.selectedInGroup[groupIndex.toString()] = action.payload;
                }
            });
        },

        // Action pour ouvrir un groupe d'outils
        openToolGroup: (state, action: PayloadAction<number | null>) => {
            state.openGroupIndex = action.payload;
        },

        // Action pour définir une action temporaire
        setTemporaryToolAction: (state, action: PayloadAction<{ id: string, toolState: Omit<ToolState, 'temporaryAction'> }>) => {
            const { id, toolState } = action.payload;
            state.temporaryAction = {
                id,
                state: {
                    selected: toolState.selected,
                    selectedInGroup: toolState.selectedInGroup,
                    openGroupIndex: toolState.openGroupIndex
                }
            };
        },

        // Action pour appliquer l'action temporaire
        applyTemporaryToolAction: (state) => {
            if (state.temporaryAction) {
                state.selected = state.temporaryAction.state.selected;
                state.selectedInGroup = state.temporaryAction.state.selectedInGroup;
                state.openGroupIndex = state.temporaryAction.state.openGroupIndex;
                state.temporaryAction = null;
            }
        },

        // Action pour annuler l'action temporaire
        cancelTemporaryToolAction: (state) => {
            state.temporaryAction = null;
        }
    }
});

// Export des actions
export const {
    selectTool,
    openToolGroup,
    setTemporaryToolAction,
    applyTemporaryToolAction,
    cancelTemporaryToolAction
} = toolSlice.actions;

// Export de l'état initial
export { initialState };

// Export du reducer
export default toolSlice.reducer; 
