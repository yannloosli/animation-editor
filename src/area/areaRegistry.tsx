import { AreaType } from "~/constants";
import { FlowEditor } from "~/flow/FlowEditor";
import { flowEditorKeyboardShortcuts } from "~/flow/flowEditorKeyboardShortcuts";
import { flowAreaSlice, FlowAreaState } from "~/flow/state/flowAreaSlice";
import HistoryEditor from "~/historyEditor/HistoryEditor";
import { Project } from "~/project/Project";
import { Timeline } from "~/timeline/Timeline";
import timelineAreaReducer, { TimelineAreaState, TimelineAreaStateWithTemp } from "~/timeline/timelineAreaSlice";
import { timelineKeyboardShortcuts } from "~/timeline/timelineShortcuts";
import { KeyboardShortcut } from "~/types";
import { AreaComponentProps, AreaState } from "~/types/areaTypes";
import { PixiWorkspace } from "~/workspace/Workspace";
// import { Workspace } from "~/workspace/Workspace";
import { Action } from "@reduxjs/toolkit";
import type { ComponentType } from "react";
import { compositionWorkspaceAreaReducer, WorkspaceAreaState } from "~/workspace/workspaceAreaReducer";
import { workspaceKeyboardShortcuts } from "~/workspace/workspaceShortcuts";
import { WorkspaceStateWithTemp } from "~/workspace/workspaceSlice";

export const areaComponentRegistry: {
	[T in AreaType]: ComponentType<AreaComponentProps<AreaState<T>>>;
} = {
	[AreaType.Timeline]: Timeline as ComponentType<AreaComponentProps<TimelineAreaState>>,
	[AreaType.Workspace]: PixiWorkspace,
	[AreaType.FlowEditor]: FlowEditor as ComponentType<AreaComponentProps<FlowAreaState>>,
	[AreaType.History]: HistoryEditor,
	[AreaType.Project]: Project,
};

// Adaptateurs pour les réducteurs qui utilisent des types avec temporaryAction
const timelineAreaReducerAdapter = (state: TimelineAreaState, action: Action): TimelineAreaState => {
	// Si l'état est undefined, initialiser avec un état par défaut
	if (!state) {
		return {
			viewBounds: [0, 100],
			panY: 0,
			moveLayers: null,
			dragSelectRect: null,
			trackDragSelectRect: null,
			pickWhipLayerParent: null
		};
	}
	
	// Adapter l'état pour le réducteur
	const stateWithTemp: TimelineAreaStateWithTemp = {
		...state,
		temporaryAction: null
	};
	
	// Appliquer le réducteur et retourner l'état sans temporaryAction
	const result = timelineAreaReducer(stateWithTemp, action);
	const { temporaryAction, ...stateWithoutTemp } = result;
	
	return stateWithoutTemp;
};

const workspaceAreaReducerAdapter = (state: WorkspaceAreaState, action: Action): WorkspaceAreaState => {
	// Si l'état est undefined, initialiser avec un état par défaut
	if (!state) {
		return {
			compositionId: "",
			pan: { x: 0, y: 0 },
			scale: 1,
			selectionRect: null
		};
	}
	
	// Adapter l'état pour le réducteur
	const stateWithTemp: WorkspaceStateWithTemp = {
		...state,
		temporaryAction: null
	};
	
	// Appliquer le réducteur et retourner l'état sans temporaryAction
	const result = compositionWorkspaceAreaReducer(stateWithTemp, action);
	
	// Vérifier si le résultat a une propriété temporaryAction
	if (result && typeof result === 'object' && 'temporaryAction' in result) {
		// Extraire temporaryAction du résultat
		const { temporaryAction, ...stateWithoutTemp } = result as WorkspaceStateWithTemp;
		return stateWithoutTemp;
	}
	
	return result;
};

export const areaStateReducerRegistry: {
	[T in AreaType]: (state: AreaState<T>, action: Action) => AreaState<T>;
} = {
	[AreaType.Timeline]: timelineAreaReducerAdapter as any,
	[AreaType.Workspace]: workspaceAreaReducerAdapter as any,
	[AreaType.FlowEditor]: flowAreaSlice.reducer,
	[AreaType.History]: () => ({}),
	[AreaType.Project]: () => ({}),
};

export const _areaReactKeyRegistry: Partial<
	{
		[T in AreaType]: keyof AreaState<T>;
	}
> = {
	[AreaType.Timeline]: "compositionId" as keyof TimelineAreaState,
	[AreaType.Workspace]: "compositionId",
	[AreaType.FlowEditor]: "graphId",
};

export const areaKeyboardShortcutRegistry: Partial<
	{
		[T in AreaType]: KeyboardShortcut[];
	}
> = {
	[AreaType.Timeline]: timelineKeyboardShortcuts,
	[AreaType.FlowEditor]: flowEditorKeyboardShortcuts,
	[AreaType.Workspace]: workspaceKeyboardShortcuts,
};
