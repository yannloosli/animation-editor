import { connect, DispatchProp, InferableComponentEnhancerWithProps } from "react-redux";
import { AreaType } from "~/constants";
import { initialProjectState } from "~/project/projectReducer";
import { store } from "~/state/store-init";
import { ActionState, ApplicationState } from "~/state/store-types";
import { AreaState } from "~/types/areaTypes";

const getCurrentStateFromApplicationState = (state: ApplicationState): ActionState => {
	return {
		area: state.area.state,
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
		tool: state.tool.state,
		workspace: state.workspace.state
	};
};

export const getActionStateFromApplicationState = (state: ApplicationState): ActionState => {
	return {
		area: state.area.state,
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
		tool: state.tool.state,
		workspace: state.workspace.state
	};
};

export type MapActionState<TStateProps = {}, TOwnProps = {}> = (
	state: ActionState,
	ownProps: TOwnProps,
) => TStateProps;

export function connectActionState<TStateProps = {}, TOwnProps = {}>(
	mapStateToProps: MapActionState<TStateProps, TOwnProps>,
): InferableComponentEnhancerWithProps<TStateProps & DispatchProp, TOwnProps> {
	return connect(
		(state: ApplicationState, ownProps: TOwnProps) => {
			try {
				const actionState = getActionStateFromApplicationState(state);
				const mappedProps = mapStateToProps(actionState, ownProps);
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

export const getActionState = () => getActionStateFromApplicationState(store.getState() as ApplicationState);
export const getCurrentState = () => getCurrentStateFromApplicationState(store.getState() as ApplicationState);

export const areaActionStateFromState = <T extends AreaType>(
	areaId: string,
	actionState: ActionState,
): AreaState<T> => {
	return actionState.area.areas[areaId].state as AreaState<T>;
};

export const getAreaActionState = <T extends AreaType>(areaId: string): AreaState<T> => {
	const actionState = getActionState();
	return areaActionStateFromState<T>(areaId, actionState);
};

export const getActionId = () => store.getState().area.action?.id || null;
export const getIsActionInProgress = () => !!(store.getState().area.action?.id || null);

(window as any).getState = () => store.getState();
(window as any).getActionState = () => getActionState();
