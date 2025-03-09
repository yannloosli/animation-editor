import { AreaType } from "~/constants";
import { FlowEditor } from "~/flow/FlowEditor";
import { flowEditorKeyboardShortcuts } from "~/flow/flowEditorKeyboardShortcuts";
import { flowAreaReducer, FlowAreaState } from "~/flow/state/flowAreaReducer";
import HistoryEditor from "~/historyEditor/HistoryEditor";
import { Project } from "~/project/Project";
import { Timeline } from "~/timeline/Timeline";
import timelineAreaReducer, { TimelineAreaState } from "~/timeline/timelineAreaSlice";
import { timelineKeyboardShortcuts } from "~/timeline/timelineShortcuts";
import { KeyboardShortcut } from "~/types";
import { AreaComponentProps, AreaState } from "~/types/areaTypes";
import { PixiWorkspace } from "~/workspace/Workspace";
// import { Workspace } from "~/workspace/Workspace";
import { AnyAction } from "@reduxjs/toolkit";
import type { ComponentType } from "react";
import { compositionWorkspaceAreaReducer } from "~/workspace/workspaceAreaReducer";
import { workspaceKeyboardShortcuts } from "~/workspace/workspaceShortcuts";

export const areaComponentRegistry: {
	[T in AreaType]: ComponentType<AreaComponentProps<AreaState<T>>>;
} = {
	[AreaType.Timeline]: Timeline as ComponentType<AreaComponentProps<TimelineAreaState>>,
	[AreaType.Workspace]: PixiWorkspace,
	[AreaType.FlowEditor]: FlowEditor as ComponentType<AreaComponentProps<FlowAreaState>>,
	[AreaType.History]: HistoryEditor,
	[AreaType.Project]: Project,
};

export const areaStateReducerRegistry: {
	[T in AreaType]: (state: AreaState<T>, action: AnyAction) => AreaState<T>;
} = {
	[AreaType.Timeline]: timelineAreaReducer,
	[AreaType.Workspace]: compositionWorkspaceAreaReducer,
	[AreaType.FlowEditor]: flowAreaReducer,
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
