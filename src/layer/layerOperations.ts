import * as PIXI from "pixi.js";
import { setLayerIndex as setLayerIndexAction, setLayerParentLayerId, setPropertyValue } from "~/composition/compositionSlice";
import { findLayerTopLevelPropertyGroup } from "~/composition/compositionUtils";
import { constructLayerPropertyMap } from "~/composition/layer/layerPropertyMap";
import { createPropertyManager } from "~/composition/manager/property/propertyManager";
import { RAD_TO_DEG_FAC } from "~/constants";
import { propertyOperations } from "~/property/propertyOperations";
import { getRealPixiLayerMatrix } from "~/render/pixi/pixiLayerTransform";
import { getActionState } from "~/state/stateUtils";
import { Operation, PropertyGroupName, PropertyName } from "~/types";

const setLayerParentLayer = (op: Operation, layerId: string, parentLayerId: string) => {
	op.add(setLayerParentLayerId({ layerId, parentLayerId }));
};

const setLayerIndex = (op: Operation, layerId: string, index: number) => {
	op.add(setLayerIndexAction({ layerId, index }));
};

const removeLayerParentLayer = (op: Operation, actionState: ActionState, layerId: string): void => {
	const { compositionState } = getActionState();
	const layer = compositionState.layers[layerId];

	const propertyManager = createPropertyManager(layer.compositionId, actionState);
	const map = constructLayerPropertyMap(layerId, compositionState);

	const transform = getRealPixiLayerMatrix(
		actionState,
		layerId,
		propertyManager.getPropertyValue,
	).decompose(new PIXI.Transform());
	const { pivot, position, rotation, scale } = transform;

	op.add(
		setPropertyValue({ propertyId: map[PropertyName.AnchorX], value: pivot.x }),
		setPropertyValue({ propertyId: map[PropertyName.AnchorY], value: pivot.y }),
		setPropertyValue({ propertyId: map[PropertyName.PositionX], value: position.x }),
		setPropertyValue({ propertyId: map[PropertyName.PositionY], value: position.y }),
		setPropertyValue({ propertyId: map[PropertyName.Rotation], value: rotation * RAD_TO_DEG_FAC }),
		setPropertyValue({ propertyId: map[PropertyName.ScaleX], value: scale.x }),
		setPropertyValue({ propertyId: map[PropertyName.ScaleY], value: scale.y }),
		setLayerParentLayerId({ layerId, parentLayerId: "" }),
	);
};

const removeArrayModifier = (op: Operation, propertyId: string): void => {
	const { compositionState } = op.state;
	const arrayModifierGroup = compositionState.properties[propertyId];

	if (arrayModifierGroup.name !== PropertyGroupName.ArrayModifier) {
		throw new Error(`Property '${propertyId}' is not an Array Modifier group.`);
	}

	const modifiersGroup = findLayerTopLevelPropertyGroup(
		arrayModifierGroup.layerId,
		compositionState,
		PropertyGroupName.Modifiers,
	);

	propertyOperations.removePropertyFromGroupRecursive(
		op,
		modifiersGroup.id,
		arrayModifierGroup.id,
	);
	op.addDiff((diff) => diff.propertyStructure(modifiersGroup.layerId));
};

export const layerOperations = {
	removeArrayModifier,
	setLayerParentLayer,
	removeLayerParentLayer,
	setLayerIndex,
};
