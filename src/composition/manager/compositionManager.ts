import * as PIXI from "pixi.js";
import { getAreaViewport } from "~/area/util/getAreaViewport";
import { passDiffsToManagers } from "~/composition/manager/compositionDiffHandler";
import { HitTestManager } from "~/composition/manager/hitTest/HitTestManager";
import {
    _emptyInteractionManager,
    createInteractionManager,
    InteractionManager,
} from "~/composition/manager/interaction/interactionManager";
import { LayerManager } from "~/composition/manager/layer/LayerManager";
import {
    createPropertyManager,
    PropertyManager,
} from "~/composition/manager/property/propertyManager";
import { AreaType } from "~/constants";
import { Diff, DiffType } from "~/diff/diffs";
import { filterIncomingTopLevelDiff } from "~/diff/filterIncomingTopLevelDiff";
import { subscribeToDiffs, unsubscribeToDiffs } from "~/listener/diffListener";
import { getActionState, getActionStateFromApplicationState } from "~/state/stateUtils";
import { store } from "~/state/store-init";
import { ActionState, ApplicationState } from "~/state/store-types";
import { CompositionError, LayerDimension } from "~/types";
import { Area } from "~/types/areaTypes";
import { Vec2 } from "~/util/math/vec2";

const compositionManagersByAreaId: Partial<Record<string, CompositionManager>> = {};

export const getCompositionManagerByAreaId = (areaId: string) => {
	return compositionManagersByAreaId[areaId];
};

const registerCompositionManagerByAreaId = (
	areaId: string,
	compositionManager: CompositionManager,
) => {
	compositionManagersByAreaId[areaId] = compositionManager;
};

const unregisterCompositionManagerByAreaId = (areaId: string) => {
	delete compositionManagersByAreaId[areaId];
};

export interface CompositionManager {
	compositionId: string;
	container: PIXI.Container;
	layers: LayerManager;
	interactions: InteractionManager;
	properties: PropertyManager;
	hitTest: HitTestManager;
	onDiffs: (actionState: ActionState, diffs: Diff[], direction: "forward" | "backward") => void;
	setErrors: (errors: CompositionError[]) => void;

	/**
	 * The state after the last call to `onDiffs`.
	 */
	prevState: ActionState;

	destroy: () => void;
}

interface ManageCompositionOptions {
	compositionId: string;
	parentCompContainer: PIXI.Container;
	areaId?: string;
	interactionContainer?: PIXI.Container;
	initialScale?: number;
	depth: number;
	dimensions?: LayerDimension[];
	setErrors: (errors: CompositionError[]) => void;
}

export const manageComposition = (options: ManageCompositionOptions): CompositionManager => {
	const {
		compositionId,
		areaId,
		parentCompContainer,
		interactionContainer,
		depth,
		initialScale = 1,
		dimensions,
	} = options;

	const container = new PIXI.Container();
	container.sortableChildren = true;

	parentCompContainer.addChild(container);

	const propertyManager = createPropertyManager(compositionId, getActionState());
	const hitTestManager = new HitTestManager({ compositionId, propertyManager, depth });

	const interactionManager =
		interactionContainer && areaId
			? createInteractionManager(
					compositionId,
					areaId,
					propertyManager,
					hitTestManager,
					interactionContainer,
					initialScale,
			  )
			: _emptyInteractionManager;

	const layerManager = new LayerManager({
		compositionId,
		compositionContainer: container,
		propertyManager,
		hitTestManager,
		interactionManager,
		actionState: getActionState(),
		dimensions,
		depth,
	});

	const ctx: CompositionManager = {
		compositionId,
		container,
		layers: layerManager,
		interactions: interactionManager,
		hitTest: hitTestManager,
		properties: propertyManager,
		setErrors: options.setErrors,
		onDiffs: (actionState, diffs, direction) =>
			passDiffsToManagers(ctx, actionState, diffs, direction),
		prevState: getActionState(),
		destroy: () => {
			parentCompContainer.removeChild(ctx.container);
			ctx.container.destroy({ children: true, texture: true, baseTexture: true });
		},
	};

	options.setErrors(propertyManager.getErrors());

	return ctx;
};

export const manageTopLevelComposition = (
	compositionId: string,
	areaId: string,
	canvas: HTMLCanvasElement,
	setErrors: (errors: CompositionError[]) => void,
) => {
	let prevState = getActionStateFromApplicationState(store.getState() as ApplicationState);

	const app = new PIXI.Application({
		width: canvas.width,
		height: canvas.height,
		view: canvas,
		transparent: true,
		antialias: true,
	});

	const getHalfStage = () => Vec2.new(canvas.width, canvas.height).scale(0.5);

	const compContainer = new PIXI.Container();
	const interactionContainer = new PIXI.Container();

	app.view.onmousemove = (e) => {
		ctx.onDiffs(
			getActionState(),
			[{ type: DiffType.MouseMove, mousePosition: Vec2.new(e) }],
			"forward",
		);
	};
	app.view.onmouseover = (e) => {
		ctx.onDiffs(
			getActionState(),
			[{ type: DiffType.MouseMove, mousePosition: Vec2.new(e) }],
			"forward",
		);
	};
	app.view.onmouseout = () => {
		ctx.onDiffs(getActionState(), [{ type: DiffType.MouseOut }], "forward");
	};

	const background = new PIXI.Graphics();
	compContainer.addChild(background);

	let initialScale: number;
	{
		const area = prevState.area.areas[areaId] as Area<AreaType.Workspace>;
		const { scale = 1 } = area ? area.state : {};
		initialScale = scale;
	}

	const ctx = manageComposition({
		compositionId,
		interactionContainer,
		parentCompContainer: compContainer,
		initialScale,
		areaId,
		depth: 0,
		setErrors,
	});

	registerCompositionManagerByAreaId(areaId, ctx);

	{
		const composition = prevState.compositionState.compositions[compositionId];
		if (!composition) return;

		const area = prevState.area.areas[areaId] as Area<AreaType.Workspace>;
		const { scale = 1, pan: _pan = Vec2.ORIGIN } = area ? area.state : {};

		// Calculer le décalage initial pour centrer la composition
		const halfComposition = Vec2.new(composition.width, composition.height).scale(0.5);
		const initialOffset = getHalfStage().sub(halfComposition);
		const pan = _pan.add(initialOffset);

		compContainer.scale.set(scale, scale);
		compContainer.position.set(pan.x, pan.y);
		interactionContainer.position.set(pan.x, pan.y);

		background.beginFill(0x555555);
		background.drawRect(0, 0, composition.width, composition.height);
	}

	app.stage.addChild(compContainer);
	app.stage.addChild(interactionContainer);

	const diffToken = subscribeToDiffs((actionState, diffs, direction) => {
		diffs = diffs.filter((diff) => filterIncomingTopLevelDiff(diff, compositionId));

		ctx.onDiffs(actionState, diffs, direction);

		for (const diff of diffs) {
			switch (diff.type) {
				case DiffType.ModifyCompositionView: {
					if (diff.compositionId !== compositionId) {
						// Another composition's pan or scale was modified.
						continue;
					}

					const area = actionState.area.areas[areaId] as Area<AreaType.Workspace>;
					if (!area?.state) continue;

					const composition = actionState.compositionState.compositions[compositionId];
					if (!composition) continue;

					const { scale = 1, pan = Vec2.ORIGIN } = area.state;
					const halfComposition = Vec2.new(composition.width, composition.height).scale(0.5);
					const initialOffset = getHalfStage().sub(halfComposition);
					const adjustedPan = pan.add(initialOffset);
					
					compContainer.scale.set(scale, scale);
					compContainer.position.set(adjustedPan.x, adjustedPan.y);
					interactionContainer.position.set(adjustedPan.x, adjustedPan.y);
					break;
				}
				case DiffType.ModifyCompositionDimensions: {
					if (diff.compositionId !== compositionId) {
						// Another composition's dimensions were modified.
						continue;
					}

					const { compositionState } = actionState;
					const composition = compositionState.compositions[compositionId];
					if (!composition) continue;

					const { width, height } = composition;
					background.clear();
					background.beginFill(0x555555);
					background.drawRect(0, 0, width, height);
					break;
				}
				case DiffType.ResizeAreas: {
					const areaViewport = getAreaViewport(areaId, AreaType.Workspace);
					if (!areaViewport) continue;

					app.renderer.resize(areaViewport.width, areaViewport.height);
					const area = actionState.area.areas[areaId] as Area<AreaType.Workspace>;
					const composition = actionState.compositionState.compositions[compositionId];
					if (!composition) continue;

					const { state = { pan: Vec2.ORIGIN } } = area || {};
					const { pan = Vec2.ORIGIN } = state;
					const halfComposition = Vec2.new(composition.width, composition.height).scale(0.5);
					const initialOffset = getHalfStage().sub(halfComposition);
					const adjustedPan = pan.add(initialOffset);
					
					compContainer.position.set(adjustedPan.x, adjustedPan.y);
					interactionContainer.position.set(adjustedPan.x, adjustedPan.y);
					break;
				}
			}
		}

		prevState = getActionStateFromApplicationState(store.getState() as ApplicationState);
	});

	return () => {
		unregisterCompositionManagerByAreaId(areaId);
		unsubscribeToDiffs(diffToken);
		ctx.destroy();
		app.destroy(false, { children: true, baseTexture: true, texture: true });
	};
};
