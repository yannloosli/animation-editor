import { compositionSlice } from "~/composition/compositionSlice";
import { Composition } from "~/composition/compositionTypes";
import { RequestActionParams, requestAction } from "~/listener/requestAction";
import { createOperation } from "~/state/operation";
import { getActionState } from "~/state/stateUtils";
import { svgTreeFromSvgString } from "~/svg/parse/svgTree";
import { SVGSvgNode } from "~/svg/svgTypes";
import { createMapNumberId } from "~/util/mapUtils";
import { getNonDuplicateName } from "~/util/names";

function handleSvg(node: SVGSvgNode) {
	const { width = 100, height = 100 } = node.properties;

	return (params: RequestActionParams, existingNames: string[]) => {
		const composition: Composition = {
			id: createMapNumberId({}),
			name: getNonDuplicateName("Composition", existingNames),
			frameIndex: 0,
			width,
			height,
			layers: [],
			length: 120,
		};

		const op = createOperation(params);
		op.add(compositionSlice.actions.setComposition({ composition }));

		return composition;
	};
}

export const compositionFromSvg = (svg: string) => {
	const parsed = svgTreeFromSvgString(svg, {
		toPathify: ["polygon", "polyline", "ellipse"],
	});

	if (!parsed) {
		return;
	}

	requestAction({ history: true }, (params) => {
		const { compositionState } = getActionState();
		const existingNames = Object.values(compositionState.compositions).map((comp) => comp.name);

		handleSvg(parsed)(params, existingNames);
	});
};
