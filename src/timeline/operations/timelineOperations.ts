import {
    clearViewProperties,
    setLayerCollapsed,
    setLayerViewProperties,
    setPropertyGroupViewProperties,
    setPropertyTimelineId,
    setPropertyValue
} from "~/composition/compositionSlice";
import { Property, PropertyGroup } from "~/composition/compositionTypes";
import { compSelectionFromState } from "~/composition/util/compSelectionUtils";
import { isKeyDown } from "~/listener/keyboard";
import { getActionState } from "~/state/stateUtils";
import {
    removeTimeline,
    setKeyframe,
    setKeyframeControlPoint,
    setKeyframeReflectControlPoints,
    setTimeline
} from "~/timeline/timelineSlice";
import { TimelineKeyframeControlPoint } from "~/timeline/timelineTypes";
import {
    createTimelineForLayerProperty,
    getTimelineValueAtIndex
} from "~/timeline/timelineUtils";
import { CompoundPropertyName, Operation, PropertyGroupName, PropertyName } from "~/types";
import { areSetsEqual } from "~/util/setUtils";

const removeTimelineOp = (op: Operation, timelineId: string): void => {
	op.add(removeTimeline({ timelineId }));
};

const removeTimelineFromProperty = (op: Operation, propertyId: string) => {
	const { compositionState, timelineState, timelineSelectionState } = op.state;
	const property = compositionState.properties[propertyId] as Property;
	const layer = compositionState.layers[property.layerId];
	const composition = compositionState.compositions[property.compositionId];
	const { timelineId } = property;

	// Delete timeline and make the value of the timeline at the current time
	// the value of the property
	const timeline = timelineState[timelineId];
	const value = getTimelineValueAtIndex({
		timeline,
		frameIndex: composition.frameIndex,
		layerIndex: layer.index,
		selection: timelineSelectionState[timeline.id],
	});

	op.add(
		removeTimeline({ timelineId: property.timelineId }),
		setPropertyValue({
			propertyId,
			value
		}),
		setPropertyTimelineId({
			propertyId,
			timelineId: ""
		}),
	);
	op.addDiff((diff) => diff.togglePropertyAnimated(propertyId));
};

const removeSelectedKeyframes = (
	op: Operation,
	timelineIds: string[],
	compositionId: string,
): void => {
	const { compositionState, timelineState, timelineSelectionState } = op.state;

	for (const timelineId of timelineIds) {
		const timeline = timelineState[timelineId];
		const selection = timelineSelectionState[timelineId];
		if (!selection) continue;

		const keyframeIds = timeline.keyframes
			.map((k, i) => ({ k, i }))
			.filter(({ k }) => selection.keyframes[k.id])
			.map(({ k }) => k.id);

		for (const keyframeId of keyframeIds) {
			const keyframe = timeline.keyframes.find(k => k.id === keyframeId);
			if (!keyframe) continue;

			op.add(setKeyframe({ timelineId, keyframe }));
		}
	}
};

const easyEaseSelectedKeyframes = (op: Operation, timelineIds: string[]): void => {
	const { timelineState, timelineSelectionState } = op.state;
	const t = 0.33;

	for (const timelineId of timelineIds) {
		const timeline = timelineState[timelineId];
		const selection = timelineSelectionState[timelineId];
		if (!selection) continue;

		for (let i = 0; i < timeline.keyframes.length; i += 1) {
			if (!selection.keyframes[timeline.keyframes[i].id]) {
				continue;
			}

			const cp = (tx: number): TimelineKeyframeControlPoint => ({
				tx,
				value: 0,
				relativeToDistance: 1
			});

			op.add(
				setKeyframeControlPoint({ timelineId, keyframeIndex: i, direction: "left", controlPoint: cp(1 - t) }),
				setKeyframeControlPoint({ timelineId, keyframeIndex: i, direction: "right", controlPoint: cp(t) }),
				setKeyframeReflectControlPoints({ timelineId, keyframeIndex: i, reflectControlPoints: true }),
			);
		}
	}
};

const viewTransformProperties = (
	op: Operation,
	compositionId: string,
	propertyNames: Array<PropertyName | CompoundPropertyName>,
): void => {
	const { compositionState, compositionSelectionState } = getActionState();

	const composition = compositionState.compositions[compositionId];
	const selection = compSelectionFromState(compositionId, compositionSelectionState);

	let layerIds = composition.layers.filter((layerId: string) => selection.layers[layerId]);

	if (layerIds.length === 0) {
		// If none are selected, all are selected
		layerIds = composition.layers;
	}

	const nameSet = new Set(propertyNames);

	const additive = isKeyDown("Shift");

	for (const layerId of layerIds) {
		const layer = compositionState.layers[layerId];
		const transformGroupId = layer.properties.find((propertyId: string) => {
			const group = compositionState.properties[propertyId];
			return group.name === PropertyGroupName.Transform;
		})!;
		const transformGroup = compositionState.properties[transformGroupId] as PropertyGroup;

		if (additive) {
			const active = layer.viewProperties;
			const toggled: string[] = [];

			for (const propertyId of transformGroup.properties) {
				const property = compositionState.properties[propertyId] as Property;
				if (nameSet.has(property.name)) {
					toggled.push(propertyId);
					const newViewProperties = [...layer.viewProperties];
					const index = newViewProperties.indexOf(propertyId);
					if (index === -1) {
						newViewProperties.push(propertyId);
					} else {
						newViewProperties.splice(index, 1);
					}
					op.add(setLayerViewProperties({
						layerId,
						propertyIds: newViewProperties
					}));
				}
			}

			if (areSetsEqual(new Set(active), new Set(toggled))) {
				op.add(clearViewProperties({
					layerId
				}));
				op.add(setLayerCollapsed({
					layerId,
					collapsed: true
				}));
			}
			return;
		}

		const propertyIds: string[] = [];

		for (const propertyId of transformGroup.properties) {
			const property = compositionState.properties[propertyId] as Property;
			if (nameSet.has(property.name)) {
				propertyIds.push(propertyId);
			}
		}

		op.add(clearViewProperties({
			layerId
		}));

		if (areSetsEqual(new Set(propertyIds), new Set(layer.viewProperties))) {
			op.add(
				setLayerCollapsed({
					layerId,
					collapsed: true
				}),
				setLayerViewProperties({
					layerId,
					propertyIds: []
				}),
			);
		} else {
			op.add(setLayerViewProperties({
				layerId,
				propertyIds
			}));
		}
	}
};

const viewAnimatedProperties = (op: Operation, compositionId: string): void => {
	const { compositionState, compositionSelectionState } = getActionState();

	const composition = compositionState.compositions[compositionId];
	const selection = compSelectionFromState(compositionId, compositionSelectionState);

	let layerIds = composition.layers.filter((layerId: string) => selection.layers[layerId]);

	if (layerIds.length === 0) {
		// If none are selected, all are selected
		layerIds = composition.layers;
	}

	const groupToVisibleProperties: { [groupId: string]: string[] } = {};

	for (const layerId of layerIds) {
		const layer = compositionState.layers[layerId];

		function crawl(propertyId: string): { hasVisible: boolean } {
			const group = compositionState.properties[propertyId];

			if (group.type === "property") {
				throw new Error("Should not encounter properties");
			}

			const visibleProperties: string[] = [];

			for (const propertyId of group.properties) {
				const property = compositionState.properties[propertyId];

				if (property.type === "property") {
					if (property.timelineId) {
						visibleProperties.push(propertyId);
					}
					continue;
				}

				const { hasVisible } = crawl(propertyId);

				if (hasVisible) {
					visibleProperties.push(propertyId);
				}
			}

			groupToVisibleProperties[group.id] = visibleProperties;

			return { hasVisible: visibleProperties.length > 0 };
		}

		for (const propertyId of layer.properties) {
			crawl(propertyId);
		}
	}

	const groupIds = Object.keys(compositionState.properties).filter(
		(propertyId) => compositionState.properties[propertyId].type === "group",
	);

	for (const groupId of groupIds) {
		op.add(setPropertyGroupViewProperties({
			groupId,
			propertyIds: groupToVisibleProperties[groupId] || []
		}));
	}
};

const addTimelineToProperty = (op: Operation, propertyId: string) => {
	const { compositionState } = op.state;
	const property = compositionState.properties[propertyId] as Property;
	const composition = compositionState.compositions[property.compositionId];

	const timeline = createTimelineForLayerProperty(
		property.value,
		composition.frameIndex,
	);

	op.add(
		setTimeline({ timelineId: timeline.id, timeline }),
		setPropertyTimelineId({
			propertyId,
			timelineId: timeline.id
		}),
	);
};

export const timelineOperations = {
	addTimelineToProperty,
	removeTimelineFromProperty,
	removeTimelineOp,
	removeSelectedKeyframes,
	easyEaseSelectedKeyframes,
	viewTransformProperties,
	viewAnimatedProperties,
};
