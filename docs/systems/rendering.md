# Système de Rendu

## Vue d'ensemble

Le système de rendu utilise PIXI.js pour gérer le rendu graphique des différents types de calques. Il est organisé autour de composants spécialisés pour chaque type de calque et gère les transformations et les tests de collision.

## Structure

### 1. Types de Base

```typescript
type UpdateGraphicFn<T extends LayerPropertyMap = LayerPropertyMap> = (
	actionState: ActionState,
	layer: Layer,
	graphic: PIXI.Graphics,
	map: T,
	getPropertyValue: (propertyId: string) => any,
) => void;
```

### 2. Composants Graphiques

```typescript
// Gestion des calques
interface LayerGraphics {
	// Création
	getPixiLayerGraphic(
		actionState: ActionState,
		layer: Layer,
		getPropertyValue: (propertyId: string) => any,
	): PIXI.Graphics;

	// Mise à jour
	updatePixiLayerGraphic(
		actionState: ActionState,
		layer: Layer,
		graphic: PIXI.Graphics,
		getPropertyValue: (propertyId: string) => any,
	): void;

	// Tests de collision
	updatePixiLayerHitTestGraphic(
		actionState: ActionState,
		layerId: string,
		graphic: PIXI.Graphics,
		getPropertyValue: (propertyId: string) => any,
	): void;
}
```

## Types de Calques

### 1. Calque Rectangle

```typescript
interface RectLayerGraphic {
	// Rendu principal
	updateRectLayerGraphic(
		actionState: ActionState,
		layer: Layer,
		graphic: PIXI.Graphics,
		map: RectLayerPropertyMap,
		getPropertyValue: (propertyId: string) => any,
	): void;

	// Test de collision
	updateRectLayerHitTestGraphic(
		actionState: ActionState,
		layer: Layer,
		graphic: PIXI.Graphics,
		map: RectLayerPropertyMap,
		getPropertyValue: (propertyId: string) => any,
	): void;
}
```

### 2. Calque Ellipse

```typescript
interface EllipseLayerGraphic {
	// Rendu principal
	updateEllipseLayerGraphic(
		actionState: ActionState,
		layer: Layer,
		graphic: PIXI.Graphics,
		map: EllipseLayerPropertyMap,
		getPropertyValue: (propertyId: string) => any,
	): void;

	// Test de collision
	updateEllipseHitTestLayerGraphic(
		actionState: ActionState,
		layer: Layer,
		graphic: PIXI.Graphics,
		map: EllipseLayerPropertyMap,
		getPropertyValue: (propertyId: string) => any,
	): void;
}
```

### 3. Calque de Forme

```typescript
interface ShapeLayerGraphic {
	// Rendu principal
	updateShapeLayerGraphic(
		actionState: ActionState,
		layer: Layer,
		graphic: PIXI.Graphics,
		map: ShapeLayerPropertyMap,
		getPropertyValue: (propertyId: string) => any,
	): void;

	// Test de collision
	updateShapeLayerHitTestGraphic(
		actionState: ActionState,
		layer: Layer,
		graphic: PIXI.Graphics,
		map: ShapeLayerPropertyMap,
		getPropertyValue: (propertyId: string) => any,
	): void;
}
```

### 4. Calque de Composition

```typescript
interface CompositionLayerGraphic {
	// Test de collision uniquement
	updateCompositionLayerHitTestGraphic(
		actionState: ActionState,
		layer: Layer,
		graphic: PIXI.Graphics,
		map: CompositionLayerPropertyMap,
		getPropertyValue: (propertyId: string) => any,
	): void;
}
```

## Transformations

```typescript
interface PixiTransform {
	// Conversion de matrices
	transformToMatrix(transform: LayerTransform): PIXI.Matrix;
	matrixToTransform(matrix: PIXI.Matrix): LayerTransform;

	// Application
	applyTransform(graphic: PIXI.Graphics, transform: LayerTransform): void;
	applyMatrix(graphic: PIXI.Graphics, matrix: PIXI.Matrix): void;
}
```

## Constantes

```typescript
const PIXI_CONSTANTS = {
	GRAPHICS_BOUNDS_PADDING: 2,
	SHAPE_LAYER_LINE_ALPHA: 0.5,
	SHAPE_LAYER_FILL_ALPHA: 0.5,
};
```

## Bonnes Pratiques

1. **Performance**

    - Réutiliser les objets graphiques
    - Minimiser les opérations de clear/redraw
    - Optimiser les tests de collision

2. **Rendu**

    - Maintenir la cohérence visuelle
    - Gérer les cas limites
    - Supporter les transformations complexes

3. **Tests de Collision**

    - Utiliser des formes simplifiées
    - Optimiser les zones de test
    - Gérer les cas de superposition

4. **Maintenance**
    - Séparer la logique par type de calque
    - Centraliser les transformations
    - Documenter les cas spéciaux

## Voir aussi

-   [Système de Calques](./layers.md)
-   [Transformations](../technical/transforms.md)
-   [Workspace](../ui/workspace.md)
