# Composants Partagés

## Vue d'ensemble

Les composants partagés fournissent des fonctionnalités réutilisables à travers l'éditeur, notamment pour la gestion du viewport et des calques.

## Gestion du Viewport

### 1. Gestionnaires de Défilement

```typescript
interface ViewportWheelHandlers {
	// Zoom
	handleZoom(e: WheelEvent, viewport: Viewport): void;
	handleZoomWithModifier(e: WheelEvent, viewport: Viewport): void;

	// Défilement
	handleScroll(e: WheelEvent, viewport: Viewport): void;
	handleHorizontalScroll(e: WheelEvent, viewport: Viewport): void;

	// Configuration
	setZoomFactor(factor: number): void;
	setScrollSpeed(speed: number): void;
}
```

### 2. État du Viewport

```typescript
interface Viewport {
	// Dimensions
	width: number;
	height: number;
	bounds: Rect;

	// Vue
	scale: number;
	pan: Vec2;
	center: Vec2;

	// Limites
	minScale: number;
	maxScale: number;
	maxPan: Vec2;
}
```

### 3. Transformations

```typescript
interface ViewportTransforms {
	// Coordonnées
	viewportToWorld(point: Vec2): Vec2;
	worldToViewport(point: Vec2): Vec2;

	// Matrices
	getViewMatrix(): Matrix;
	getInverseViewMatrix(): Matrix;

	// Mise à jour
	updateTransform(): void;
	invalidateTransform(): void;
}
```

## Gestion des Calques

### 1. Tri des Parents

```typescript
interface LayerParentSort {
	// Tri
	sortLayersByParent(layers: Layer[]): Layer[];
	getLayerDepth(layer: Layer): number;

	// Validation
	validateParentChain(layer: Layer): boolean;
	detectCycles(layers: Layer[]): boolean;
}
```

### 2. Utilitaires de Calques

```typescript
interface SharedLayerUtils {
	// Hiérarchie
	getLayerAncestors(layer: Layer): Layer[];
	getLayerDescendants(layer: Layer): Layer[];

	// Transformations
	getWorldTransform(layer: Layer): Matrix;
	getLocalTransform(layer: Layer): Matrix;

	// Validation
	isLayerVisible(layer: Layer): boolean;
	isLayerLocked(layer: Layer): boolean;
}
```

## Intégration

### 1. Avec le Workspace

```typescript
interface SharedWorkspaceIntegration {
	// Viewport
	syncViewportState(viewport: Viewport): void;
	handleViewportEvents(e: Event): void;

	// Calques
	updateLayerOrder(): void;
	validateLayerOperations(): void;
}
```

### 2. Avec l'Éditeur de Graphes

```typescript
interface SharedGraphEditorIntegration {
	// Viewport
	setupGraphViewport(): Viewport;
	handleGraphScroll(e: WheelEvent): void;

	// Mise à jour
	updateGraphView(): void;
}
```

## Performance

```typescript
interface SharedOptimizations {
	// Cache
	cacheViewportTransforms(): void;
	cacheLayerOrder(): void;

	// Mise à jour
	deferViewportUpdates(): void;
	batchLayerUpdates(): void;

	// Validation
	validateCacheState(): void;
	clearInvalidCache(): void;
}
```

## Bonnes Pratiques

1. **Viewport**

    - Limiter les mises à jour de transformation
    - Valider les limites de zoom/pan
    - Gérer les événements efficacement

2. **Calques**

    - Maintenir un ordre cohérent
    - Éviter les cycles de parenté
    - Optimiser les calculs de transformation

3. **Performance**

    - Utiliser le cache approprié
    - Regrouper les mises à jour
    - Éviter les calculs redondants

4. **Maintenance**
    - Centraliser les utilitaires communs
    - Documenter les dépendances
    - Maintenir la cohérence des interfaces

## Voir aussi

-   [Workspace](../ui/workspace.md)
-   [Éditeur de Graphes](../ui/graph-editor.md)
-   [Système de Calques](../systems/layers.md)
