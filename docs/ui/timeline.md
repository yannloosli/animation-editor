# Système de Timeline

## Vue d'ensemble

Le système de timeline est responsable de la gestion et de l'édition des animations dans le temps. Il permet de visualiser et de modifier les keyframes des propriétés animées, avec un support pour l'interpolation et les points de contrôle.

## Structure des Fichiers

```typescript
interface TimelineSystem {
	// Composants Principaux
	components: {
		Timeline: typeof Timeline; // Composant principal
		TimelineHeader: typeof TimelineHeader; // En-tête avec contrôles
		TimelineLayerList: typeof TimelineLayerList; // Liste des calques
		TimelineViewBounds: typeof TimelineViewBounds; // Limites de vue
	};

	// État et Réduction
	state: {
		timelineReducer: typeof TimelineReducer;
		selectionReducer: typeof TimelineSelectionReducer;
		areaReducer: typeof TimelineAreaReducer;
	};

	// Sous-systèmes
	subsystems: {
		scrubber: ScrubberSystem; // Contrôle de lecture
		property: PropertySystem; // Gestion des propriétés
		layer: LayerSystem; // Gestion des calques
		context: ContextSystem; // Menus contextuels
		value: ValueSystem; // Manipulation des valeurs
	};

	// Gestionnaires
	handlers: {
		timeline: typeof timelineHandlers;
		viewBounds: typeof timelineViewBoundsHandlers;
	};

	// Actions et Opérations
	operations: {
		actions: typeof timelineActions;
		contextMenu: typeof timelineContextMenu;
		shortcuts: typeof timelineShortcuts;
	};
}
```

## Types Principaux

```typescript
interface Timeline {
	id: string;
	keyframes: TimelineKeyframe[];
	_yBounds: [number, number] | null;
	_yPan: number;
	_indexShift: number | null;
	_valueShift: number | null;
	_controlPointShift: ControlPointShift | null;
	_newControlPointShift: NewControlPointShift | null;
	_dragSelectRect: Rect | null;
}

interface TimelineKeyframe {
	id: string;
	index: number;
	value: number;
	reflectControlPoints: boolean;
	controlPointLeft: TimelineKeyframeControlPoint | null;
	controlPointRight: TimelineKeyframeControlPoint | null;
}

interface TimelineKeyframeControlPoint {
	tx: number;
	value: number;
	relativeToDistance: number;
}
```

## Actions

```typescript
const timelineActions = {
	// Gestion des keyframes
	addKeyframe: (timelineId: string, keyframe: TimelineKeyframe) => Action;
	removeKeyframe: (timelineId: string, keyframeId: string) => Action;
	updateKeyframe: (timelineId: string, keyframeId: string, fields: Partial<TimelineKeyframe>) => Action;

	// Points de contrôle
	setControlPoint: (timelineId: string, keyframeId: string, direction: "left" | "right", point: TimelineKeyframeControlPoint) => Action;
	removeControlPoint: (timelineId: string, keyframeId: string, direction: "left" | "right") => Action;

	// Navigation et sélection
	setYBounds: (timelineId: string, bounds: [number, number]) => Action;
	setYPan: (timelineId: string, pan: number) => Action;
	setDragSelectRect: (timelineId: string, rect: Rect | null) => Action;
};
```

## Gestionnaires d'Événements

```typescript
const timelineHandlers = {
	// Gestion des keyframes
	onKeyframeMouseDown: (e: MouseEvent, keyframe: TimelineKeyframe) => void;
	onKeyframeDrag: (e: MouseEvent, keyframe: TimelineKeyframe) => void;
	onKeyframeMouseUp: (e: MouseEvent, keyframe: TimelineKeyframe) => void;

	// Points de contrôle
	onControlPointMouseDown: (e: MouseEvent, point: TimelineKeyframeControlPoint) => void;
	onControlPointDrag: (e: MouseEvent, point: TimelineKeyframeControlPoint) => void;
	onControlPointMouseUp: (e: MouseEvent, point: TimelineKeyframeControlPoint) => void;

	// Sélection
	onDragSelectStart: (e: MouseEvent) => void;
	onDragSelectMove: (e: MouseEvent) => void;
	onDragSelectEnd: (e: MouseEvent) => void;
};
```

## Styles

```typescript
const TimelineStyles = {
	// Conteneur principal
	container: css`
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	`,

	// Zone de keyframes
	keyframeArea: css`
		position: relative;
		flex: 1;
		overflow: hidden;
	`,

	// En-tête
	header: css`
		height: 40px;
		background: var(--timelineHeaderBg);
		border-bottom: 1px solid var(--timelineHeaderBorder);
	`,

	// Liste des calques
	layerList: css`
		width: 200px;
		border-right: 1px solid var(--timelineLayerListBorder);
	`,
};
```

## Bonnes Pratiques

1. **Organisation**

    - Séparer les composants logiquement
    - Maintenir une structure claire des fichiers
    - Centraliser les types et interfaces

2. **Performance**

    - Optimiser le rendu des keyframes
    - Mettre en cache les calculs d'interpolation
    - Gérer efficacement les mises à jour

3. **Interaction**

    - Fournir des retours visuels clairs
    - Supporter les raccourcis clavier standards
    - Gérer les cas d'erreur gracieusement

4. **Maintenance**
    - Documenter les interactions complexes
    - Suivre les conventions de nommage
    - Maintenir la cohérence des données

## Voir aussi

-   [Système de Composition](../systems/composition.md)
-   [Système de Propriétés](../systems/properties.md)
-   [Interface Utilisateur](./interface.md)
