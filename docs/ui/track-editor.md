# Éditeur de Pistes

## Vue d'ensemble

L'éditeur de pistes permet de gérer et d'éditer les pistes d'animation de manière détaillée. Il offre une interface spécialisée pour manipuler les propriétés animées, les courbes d'interpolation et les keyframes.

## Structure

```typescript
interface TrackEditorState {
	// État général
	selectedTracks: Set<string>;
	selectedKeyframes: Set<string>;
	zoom: {
		time: number;
		value: number;
	};

	// Affichage
	viewRange: [number, number];
	valueRange: [number, number];
	showGrid: boolean;

	// Mode d'édition
	editMode: "select" | "draw" | "tangent";
	snapToGrid: boolean;
}
```

## Types de Pistes

```typescript
interface Track {
	// Propriétés de base
	id: string;
	name: string;
	type: TrackType;

	// Données
	keyframes: Keyframe[];
	defaultValue: any;

	// Métadonnées
	color: string;
	visible: boolean;
	locked: boolean;
}

enum TrackType {
	Numeric = "numeric",
	Vector2 = "vector2",
	Color = "color",
	Boolean = "boolean",
	Enum = "enum",
	Custom = "custom",
}
```

## Composants

### 1. En-tête de Piste

```typescript
interface TrackHeader {
	// Propriétés
	name: string;
	type: TrackType;
	color: string;

	// Actions
	onToggleVisibility(): void;
	onToggleLock(): void;
	onRename(name: string): void;
	onColorChange(color: string): void;
}
```

### 2. Éditeur de Courbes

```typescript
interface CurveEditor {
	// Édition
	onPointDrag(point: Vec2): void;
	onTangentDrag(handle: Vec2): void;
	onDrawCurve(points: Vec2[]): void;

	// Affichage
	setValueRange(min: number, max: number): void;
	setTimeRange(start: number, end: number): void;
	toggleGrid(show: boolean): void;
}
```

## Fonctionnalités

### 1. Manipulation des Keyframes

```typescript
interface KeyframeManipulation {
	// Opérations de base
	addKeyframe(time: number, value: any): void;
	removeKeyframe(id: string): void;
	moveKeyframe(id: string, time: number): void;

	// Édition avancée
	setInterpolation(id: string, type: InterpolationType): void;
	adjustTangents(id: string, inTangent: Vec2, outTangent: Vec2): void;
	smoothTangents(ids: string[]): void;
}
```

### 2. Édition de Courbes

```typescript
interface CurveManipulation {
	// Modes d'édition
	setEditMode(mode: "select" | "draw" | "tangent"): void;
	toggleSnapping(enabled: boolean): void;

	// Opérations
	scaleCurve(scale: Vec2): void;
	offsetCurve(offset: Vec2): void;
	invertCurve(): void;
	smoothCurve(): void;
}
```

## Interpolation

```typescript
interface TrackInterpolation {
	// Types d'interpolation
	linear(t: number, a: any, b: any): any;
	bezier(t: number, points: Vec2[]): any;
	step(t: number, a: any, b: any): any;

	// Courbes personnalisées
	evaluateCurve(t: number): any;
	getCurveValue(time: number): any;
}
```

## Navigation

```typescript
interface TrackNavigation {
	// Zoom
	zoomToFit(): void;
	zoomToSelection(): void;
	setZoom(time: number, value: number): void;

	// Défilement
	scrollToTime(time: number): void;
	scrollToValue(value: number): void;
	panView(delta: Vec2): void;
}
```

## Intégration

### 1. Avec la Timeline

```typescript
interface TrackTimelineIntegration {
	// Synchronisation
	syncWithTimeline(): void;
	updateTimeIndicator(time: number): void;

	// Sélection
	selectTracksFromTimeline(ids: string[]): void;
	highlightKeyframesAtTime(time: number): void;
}
```

### 2. Avec le Système de Flow

```typescript
interface TrackFlowIntegration {
	// Connexions
	connectToFlowNode(trackId: string, nodeId: string): void;
	disconnectFromFlow(trackId: string): void;

	// Mise à jour
	updateFromFlow(nodeId: string): void;
	previewFlowValues(): void;
}
```

## Performance

```typescript
interface TrackOptimizations {
	// Rendu
	optimizeCurveRendering(): void;
	batchKeyframeUpdates(): void;

	// Cache
	cacheTrackValues(): void;
	invalidateCache(trackId: string): void;

	// Virtualisation
	virtualizeOffscreenTracks(): void;
	recycleTrackComponents(): void;
}
```

## Raccourcis Clavier

```typescript
const TRACK_SHORTCUTS = {
	ADD_KEYFRAME: "K",
	DELETE_KEYFRAME: "Delete",
	TOGGLE_SNAP: "S",
	TOGGLE_GRID: "G",
	FIT_TO_VIEW: "F",
	SMOOTH_TANGENTS: "T",
};
```

## Bonnes Pratiques

1. **Organisation**

    - Grouper les pistes logiquement
    - Utiliser des couleurs cohérentes
    - Maintenir une hiérarchie claire

2. **Édition**

    - Utiliser le snapping pour la précision
    - Maintenir des courbes lisses
    - Éviter les changements brusques

3. **Performance**

    - Optimiser le rendu des courbes
    - Utiliser la virtualisation
    - Gérer efficacement le cache

4. **Interface Utilisateur**
    - Fournir des retours visuels
    - Supporter les raccourcis clavier
    - Maintenir une interface réactive

## Voir aussi

-   [Timeline](./timeline.md)
-   [Système de Flow](../systems/flow.md)
-   [Éditeur de Graphes](./graph-editor.md)
-   [Workspace](./workspace.md)
