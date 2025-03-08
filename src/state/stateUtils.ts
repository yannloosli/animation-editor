import { connect, DispatchProp, InferableComponentEnhancerWithProps } from "react-redux";
import { AreaType } from "~/constants";
import { initialProjectState } from "~/project/projectReducer";
import { HistoryState } from "~/state/history/historyReducer";
import { storeRTK } from "~/state/store-init";
import { ActionState, ApplicationState } from "~/state/store-types";
import { AreaState } from "~/types/areaTypes";

const getCurrentStateFromApplicationState = (state: ApplicationState): ActionState => {
	return {
		area: state.area.state,
		compositionState: state.compositionState.list[state.compositionState.index].state,
		compositionSelectionState: state.compositionSelectionState.list[state.compositionSelectionState.index].state,
		flowState: state.flowState.list[state.flowState.index].state,
		flowSelectionState: state.flowSelectionState.list[state.flowSelectionState.index].state,
		contextMenu: state.contextMenu.state,
		project: state.project.list[state.project.index].state,
		shapeState: state.shapeState.list[state.shapeState.index].state,
		shapeSelectionState: state.shapeSelectionState.list[state.shapeSelectionState.index].state,
		timelineState: state.timelineState.list[state.timelineState.index].state,
		timelineSelectionState: state.timelineSelectionState.list[state.timelineSelectionState.index].state,
		tool: state.tool.state
	};
};

export const getActionStateFromApplicationState = (state: ApplicationState): ActionState => {
	const getHistoryState = <T>(historyState: HistoryState<T>): T => {
		const shiftForward =
			historyState.type === "selection" &&
			historyState.indexDirection === -1 &&
			historyState.list[historyState.index + 1]?.modifiedRelated &&
			historyState.list[historyState.index + 1]?.allowIndexShift;

		return historyState.list[historyState.index + (shiftForward ? 1 : 0)]?.state || {} as T;
	};

	return {
		area: state.area.state,
		compositionState: getHistoryState(state.compositionState),
		compositionSelectionState: getHistoryState(state.compositionSelectionState),
		flowState: getHistoryState(state.flowState),
		flowSelectionState: getHistoryState(state.flowSelectionState),
		contextMenu: state.contextMenu.state,
		project: getHistoryState(state.project) || initialProjectState,
		shapeState: getHistoryState(state.shapeState),
		shapeSelectionState: getHistoryState(state.shapeSelectionState),
		timelineState: getHistoryState(state.timelineState),
		timelineSelectionState: getHistoryState(state.timelineSelectionState),
		tool: state.tool.state
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

export const getActionState = () => getActionStateFromApplicationState(storeRTK.getState());
export const getCurrentState = () => getCurrentStateFromApplicationState(storeRTK.getState());

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

export const getActionId = () => storeRTK.getState().area.action?.id || null;
export const getIsActionInProgress = () => !!(storeRTK.getState().area.action?.id || null);

(window as any).getState = () => storeRTK.getState();
(window as any).getActionState = () => getActionState();
