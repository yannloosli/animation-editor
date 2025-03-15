import { connect, DispatchProp, InferableComponentEnhancerWithProps } from "react-redux";
import { AreaType } from "~/constants";
import { initialProjectState } from "~/project/projectSlice";
import { adaptActionState } from "~/state/actionStateAdapter";
import { store } from "~/state/store-init";
import { ActionState, ApplicationState } from "~/state/store-types";
import { AreaState } from "~/types/areaTypes";

// Fonction utilitaire pour adapter l'état de l'area
const adaptAreaState = (areaState: any) => {
    // Si l'état a déjà la nouvelle structure, on le retourne tel quel
    if (areaState.temporaryAction !== undefined && areaState.status !== undefined && areaState.error !== undefined) {
        return areaState;
    }

    // Sinon, on adapte l'état pour qu'il soit compatible avec le nouveau format
    const oldAreas = areaState.areas || {};
    const areaIds = Object.keys(oldAreas);

    return {
        ...areaState,
        temporaryAction: null,
        status: 'idle' as const,
        error: null,
        // Adapter la structure areas si nécessaire
        areas: areaState.areas?.entities ? areaState.areas : {
            ids: areaIds,
            entities: oldAreas
        }
    };
};

// Fonction utilitaire pour adapter l'état de l'outil
const adaptToolState = (toolState: any) => {
    return {
        ...toolState,
        selected: toolState.selected || '',
        selectedInGroup: toolState.selectedInGroup || {},
        openGroupIndex: toolState.openGroupIndex !== undefined ? toolState.openGroupIndex : null,
        temporaryAction: null
    };
};

const getCurrentStateFromApplicationState = (state: ApplicationState): ActionState => {
    return {
        area: adaptAreaState(state.area.state),
        compositionState: state.compositionState.present,
        compositionSelectionState: state.compositionSelectionState.present,
        flowState: state.flowState.present,
        flowSelectionState: state.flowSelectionState.present,
        contextMenu: state.contextMenu.state,
        project: state.project.present,
        shapeState: state.shapeState.present,
        shapeSelectionState: state.shapeSelectionState.present,
        timelineState: state.timelineState.present,
        timelineSelectionState: state.timelineSelectionState.present,
        timelineArea: state.timelineArea.state,
        tool: adaptToolState(state.tool.state),
        workspace: state.workspace.state,
        penTool: state.penTool.state
    } as ActionState;
};

export const getActionStateFromApplicationState = (state: ApplicationState): ActionState => {
    return {
        area: adaptAreaState(state.area.state),
        compositionState: state.compositionState.present,
        compositionSelectionState: state.compositionSelectionState.present,
        flowState: state.flowState.present,
        flowSelectionState: state.flowSelectionState.present,
        contextMenu: state.contextMenu.state,
        project: state.project.present || initialProjectState,
        shapeState: state.shapeState.present,
        shapeSelectionState: state.shapeSelectionState.present,
        timelineState: state.timelineState.present,
        timelineSelectionState: state.timelineSelectionState.present,
        timelineArea: state.timelineArea.state,
        tool: adaptToolState(state.tool.state),
        workspace: state.workspace.state,
        penTool: state.penTool.state
    } as ActionState;
};

// Définir un type pour l'état adapté
export type AdaptedActionState = ReturnType<typeof adaptActionState>;

export type MapActionState<TStateProps = {}, TOwnProps = {}> = (
    state: AdaptedActionState,
    ownProps: TOwnProps,
) => TStateProps;

export function connectActionState<TStateProps = {}, TOwnProps = {}>(
    mapStateToProps: MapActionState<TStateProps, TOwnProps>,
): InferableComponentEnhancerWithProps<TStateProps & DispatchProp, TOwnProps> {
    return connect(
        (state: ApplicationState, ownProps: TOwnProps) => {
            try {
                const actionState = getActionStateFromApplicationState(state);
                const adaptedState = adaptActionState(actionState);
                const mappedProps = mapStateToProps(adaptedState, ownProps);
                if (!mappedProps) {
                    console.error('mapStateToProps returned undefined');
                    return {} as TStateProps;
                }
                return mappedProps;
            } catch (e) {
                console.error('Error in connectActionState:', e);
                return {} as TStateProps;
            }
        },
        (dispatch) => ({
            dispatch: (action: any) => {
                return dispatch(action);
            }
        })
    );
}

export const getActionState = () => {
    const state = getActionStateFromApplicationState(store.getState() as ApplicationState);
    return adaptActionState(state);
};

export const getCurrentState = () => getCurrentStateFromApplicationState(store.getState() as ApplicationState);

export const areaActionStateFromState = <T extends AreaType>(
    areaId: string,
    actionState: ActionState,
): AreaState<T> => {
    const area = actionState.area as any;

    // Vérifier si nous avons la nouvelle structure avec entities
    if (area?.areas?.entities && area.areas.ids) {
        return area.areas.entities[areaId]?.state as AreaState<T>;
    }

    // Sinon, utiliser l'ancienne structure
    return area?.areas?.[areaId]?.state as AreaState<T>;
};

export const getAreaActionState = <T extends AreaType>(areaId: string): AreaState<T> => {
    const actionState = getActionState();
    return areaActionStateFromState<T>(areaId, actionState);
};

export const getActionId = () => store.getState().area.action?.id || null;
export const getIsActionInProgress = () => !!(store.getState().area.action?.id || null);

(window as any).getState = () => store.getState();
(window as any).getActionState = () => getActionState();
