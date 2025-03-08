import { compositionActions } from "~/composition/compositionReducer";
import { Composition } from "~/composition/compositionTypes";
import { getTimelineIdsReferencedByComposition } from "~/composition/compositionUtils";
import { contextMenuActions } from "~/contextMenu/contextMenuActions";
import { ContextMenuOption } from "~/contextMenu/contextMenuReducer";
import { closeContextMenu as rtkCloseContextMenu } from "~/contextMenu/contextMenuSlice";
import { requestAction } from "~/listener/requestAction";
import { projectActions } from "~/project/projectReducer";
import { getActionState } from "~/state/stateUtils";
import { timelineActions } from "~/timeline/timelineActions";
import { createMapNumberId } from "~/util/mapUtils";
import { Vec2 } from "~/util/math/vec2";
import { getNonDuplicateName } from "~/util/names";

interface Options {
	compositionId?: string;
}

export const createProjectContextMenu = (position: Vec2, { compositionId }: Options): void => {
	const options: ContextMenuOption[] = [];

	if (!compositionId) {
		options.push({
			label: "Add new composition",
			onSelect: () => {
				requestAction({ history: true }, (params) => {
					const compositions = getActionState().compositionState.compositions;
					const existingNames = Object.values(compositions).map((comp) => comp.name);

					const composition: Composition = {
						id: createMapNumberId(compositions),
						name: getNonDuplicateName("Composition", existingNames),
						height: 400,
						width: 400,
						layers: [],
						length: 5 * 60, // 5 seconds
						frameIndex: 0,
					};

					params.dispatch([
						projectActions.addComposition({ composition }),
						compositionActions.setComposition(composition),
						rtkCloseContextMenu(),
					]);
					params.submitAction("Add new composition");
				});
			},
		});
	}

	if (compositionId) {
		const composition = getActionState().compositionState.compositions[compositionId];

		options.push({
			label: `Delete composition '${composition.name}'`,
			onSelect: () => {
				requestAction({ history: true }, (params) => {
					const { compositionState } = getActionState();
					const timelineIds = getTimelineIdsReferencedByComposition(
						compositionId,
						compositionState,
					);

					const actions = [
						projectActions.removeComposition({ compositionId }),
						compositionActions.removeComposition(compositionId),
						...timelineIds.map((id) => timelineActions.removeTimeline(id)),
						rtkCloseContextMenu(),
					];
					params.dispatch(actions);
					params.submitAction("Remove composition");
				});
			},
		});
	}

	/**
	 * @todo Composition Settings
	 */

	contextMenuActions.openContextMenu("Project", options, position);
};
