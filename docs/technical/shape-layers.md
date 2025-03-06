# Calques de Forme

## Vue d'ensemble

Les calques de forme sont les éléments les plus complexes du système de rendu. Ils permettent de dessiner des formes vectorielles avec support pour les courbes de Bézier, les remplissages, les contours et les effets avancés.

## Architecture

```typescript
src/render/pixi/
├── shapeLayerGraphic.ts    # Rendu principal des formes
├── pixiConstants.ts        # Constantes de rendu
└── layerToPixi.ts         # Conversion des calques
```

## Pipeline de Rendu

### 1. Préparation

```typescript
const getShapeGroups = (actionState: ActionState, layer: Layer) => {
	return reduceLayerPropertiesAndGroups<PropertyGroup[]>(
		layer.id,
		actionState.compositionState,
		(acc, property) => {
			if (property.name === PropertyGroupName.Shape) {
				acc.push(property);
			}
			return acc;
		},
		[],
	).reverse();
};
```

### 2. Gestion des Courbes

```typescript
const createCurveGetter = (actionState: ActionState) => {
	const { shapeState } = actionState;
	return (property: Property) => {
		const pathId = property.value;
		const curves = pathIdToCurves(pathId, shapeState) || [];
		const path = shapeState.paths[pathId];
		const isClosed = isShapePathClosed(path);
		return { curves, isClosed };
	};
};
```

## Rendu des Chemins

### Tracé des Chemins

```typescript
const tracePath = (graphic: PIXI.Graphics, curves: Curve[]) => {
	const closedPaths = newTess(curves);

	for (const path of closedPaths) {
		const first = path[0];
		if (first) {
			const [x, y] = first;
			graphic.moveTo(x, y);
		}

		for (const [x, y] of path.slice(1)) {
			graphic.lineTo(x, y);
		}
	}
};
```

### Tracé des Contours

```typescript
const traceStroke = (graphic: PIXI.Graphics, curves: Curve[]) => {
	// Déplacement au premier point
	const firstCurve = curves[0];
	if (firstCurve) {
		const { x, y } = firstCurve[0];
		graphic.moveTo(x, y);
	}

	// Tracé des segments
	for (const curve of curves) {
		if (curve.length === 2) {
			// Ligne droite
			const { x, y } = curve[1];
			graphic.lineTo(x, y);
		} else {
			// Courbe de Bézier
			const points = new CubicBezier2D(
				...curve.map((p) => new Point2D(p.x, p.y)),
			).toPolygon2D().points;

			for (const { x, y } of points) {
				graphic.lineTo(x, y);
			}
		}
	}
};
```

## Styles et Propriétés

### Remplissage

```typescript
const onFill = (group: PropertyGroup) => {
	const { color, opacity } = getShapeFillGroupValues(group, compositionState);
	const [r, g, b] = color;
	graphic.beginFill(rgbToBinary([r, g, b]), opacity);
};
```

### Contour

```typescript
const onStroke = (group: PropertyGroup) => {
    const {
        color,
        opacity,
        lineCap,
        lineJoin,
        lineWidth,
        miterLimit,
    } = getShapeStrokeGroupValues(group, compositionState);

    if (lineWidth === 0) return;

    const [r, g, b] = color;
    graphic.lineTextureStyle({
        cap: pixiLineCap(lineCap),
        join: pixiLineJoin(lineJoin),
        miterLimit,

```
