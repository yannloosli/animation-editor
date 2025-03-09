import { compositionSlice } from "~/composition/compositionSlice";
import { shapeActions } from "~/shape/shapeReducer";
import { createOperation } from "~/state/operation";
import { shapeLayerFromCurves } from "~/svg/parse/shapeLayerFromCurves";
import { SVGCircleNode, SVGGNode, SVGLineNode, SVGNode, SVGPathNode, SVGRectNode } from "~/svg/svgTypes";
import { LayerTransform, LayerType, OriginBehavior } from "~/types";
import { Mat2 } from "~/util/math/mat";
import { CompositionFromSvgContext } from "./compositionFromSvgContext";

const transformFromNode = (node: SVGNode): LayerTransform => {
	return {
		origin: node.position,
		originBehavior: "relative" as OriginBehavior,
		translate: node.position,
		anchor: node.anchor,
		rotation: node.rotation,
		scaleX: node.scale.x,
		scaleY: node.scale.y,
		matrix: Mat2.identity(),
	};
};

type SVGFactoryMap = {
	rect: (ctx: CompositionFromSvgContext, node: SVGRectNode) => void;
	g: (ctx: CompositionFromSvgContext, node: SVGGNode) => void;
	circle: (ctx: CompositionFromSvgContext, node: SVGCircleNode) => void;
	line: (ctx: CompositionFromSvgContext, node: SVGLineNode) => void;
	path: (ctx: CompositionFromSvgContext, node: SVGPathNode) => void;
};

export const svgLayerFactory: SVGFactoryMap = {
	rect: (ctx: CompositionFromSvgContext, node: SVGRectNode) => {
		const transform = transformFromNode(node);

		const op = createOperation(ctx.params);
		op.add(compositionSlice.actions.createLayer({ 
			compositionId: ctx.compositionId, 
			type: LayerType.Rect,
			options: {
				insertLayerIndex: 0,
			}
		}));
	},
	g: (ctx: CompositionFromSvgContext, node: SVGGNode) => {
		for (const child of [...node.children].reverse()) {
			if (svgLayerFactory[child.tagName as keyof SVGFactoryMap]) {
				svgLayerFactory[child.tagName as keyof SVGFactoryMap]!(ctx, child as any);
			}
		}
	},
	circle: (ctx: CompositionFromSvgContext, node: SVGCircleNode) => {
		const transform = transformFromNode(node);

		const op = createOperation(ctx.params);
		op.add(compositionSlice.actions.createLayer({ 
			compositionId: ctx.compositionId, 
			type: LayerType.Ellipse,
			options: {
				insertLayerIndex: 0,
			}
		}));
	},
	line: (ctx: CompositionFromSvgContext, node: SVGLineNode) => {
		const transform = transformFromNode(node);

		const op = createOperation(ctx.params);
		op.add(compositionSlice.actions.createLayer({ 
			compositionId: ctx.compositionId, 
			type: LayerType.Line,
			options: {
				insertLayerIndex: 0,
			}
		}));
	},
	path: (ctx: CompositionFromSvgContext, node: SVGPathNode) => {
		const transform = transformFromNode(node);
		const shapeLayerObjects = shapeLayerFromCurves(ctx, node.properties.d);

		const op = createOperation(ctx.params);
		op.add(shapeActions.addObjects(shapeLayerObjects.shapeState));
		op.add(compositionSlice.actions.createLayer({ 
			compositionId: ctx.compositionId, 
			type: LayerType.Shape,
			options: {
				insertLayerIndex: 0,
			}
		}));
	},
};
