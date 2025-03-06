# Système de Composition

## Vue d'ensemble

Le système de composition est le cœur de l'éditeur d'animation, permettant la création et la manipulation de compositions animées. Une composition est une collection de calques et de propriétés qui peuvent être animés dans le temps.

## Structure

### Composition

```typescript
interface Composition {
	id: string;
	name: string;
	layers: string[];
	width: number;
	height: number;
	length: number;
	frameIndex: number; // Temps courant
}
```

### Calque (Layer)

```typescript
interface Layer {
	id: string;
	compositionId: string;
	graphId: string;
	type: LayerType;
	name: string;
	index: number; // Frame de début
	length: number; // Durée en frames
	playbackStartsAtIndex: number;
	properties: string[]; // Propriétés de premier niveau
	collapsed: boolean;
	parentLayerId: string;
	viewProperties: string[];
}
```

### Propriétés

#### Groupe de Propriétés

```typescript
interface PropertyGroup {
	type: "group";
	name: PropertyGroupName;
	id: string;
	layerId: string;
	compositionId: string;
	properties: string[];
	collapsed: boolean;
	graphId: string; // Pour les groupes ArrayModifier
	viewProperties: string[];
}
```

#### Propriété Composée

```typescript
interface CompoundProperty {
	type: "compound";
	name: CompoundPropertyName;
	id: string;
	layerId: string;
	compositionId: string;
	properties: string[];
	separated: boolean;
	allowMaintainProportions: boolean;
	maintainProportions: boolean;
}
```

#### Propriété Simple

```typescript
interface Property {
	type: "property";
	id: string;
	layerId: string;
	compositionId: string;
	name: PropertyName;
	timelineId: string;
	compoundPropertyId: string;
	value: any;
}
```

## Fonctionnalités

### Lecture

```typescript
interface CompositionPlayback {
	play(): void;
	pause(): void;
	setFrame(frame: number): void;
	setPlaybackRange(start: number, end: number): void;
	toggleLoop(): void;
}
```

### Sélection

```typescript
interface CompositionSelection {
	layers: KeySelectionMap;
	properties: KeySelectionMap;
}
```

### Transformations

```typescript
interface TransformUtils {
	// Transformations de base
	translate(layer: Layer, delta: Vec2): void;
	rotate(layer: Layer, angle: number): void;
	scale(layer: Layer, scale: Vec2): void;

	// Transformations composées
	transform(layer: Layer, matrix: Matrix): void;
	applyParentTransform(layer: Layer): Matrix;
}
```

### Raccourcis Clavier

```typescript
const compositionShortcuts = {
	DELETE_SELECTED: "Delete",
	DUPLICATE: "Ctrl+D",
	GROUP: "Ctrl+G",
	UNGROUP: "Ctrl+Shift+G",
	SELECT_ALL: "Ctrl+A",
	DESELECT: "Ctrl+D",
	PLAY_PAUSE: "Space",
	NEXT_FRAME: ".",
	PREV_FRAME: ",",
};
```

## Gestion des Calques

### Types de Calques

```typescript
enum LayerType {
	Shape = "shape",
	Composition = "composition",
	Null = "null",
	Text = "text",
	Image = "image",
}
```

### Opérations sur les Calques

```typescript
interface LayerOperations {
	createLayer(type: LayerType, options?: LayerOptions): Layer;
	deleteLayer(id: string): void;
	moveLayer(id: string, newIndex: number): void;
	duplicateLayer(id: string): Layer;
	setParent(id: string, parentId: string): void;
}
```

## Gestion des Propriétés

### Création de Propriétés

```typescript
interface CreatePropertyOptions {
	createId: () => string;
	compositionId: string;
	layerId: string;
}

interface PropertyFactory {
	createPropertyGroup(options: CreatePropertyOptions): CreateLayerPropertyGroup;
	createCompoundProperty(
		name: CompoundPropertyName,
		options: CreatePropertyOptions,
	): CompoundProperty;
	createProperty(name: PropertyName, options: CreatePropertyOptions): Property;
}
```

### Modification de Propriétés

```typescript
interface PropertyModifier {
	setValue(property: Property, value: any): void;
	setKeyframe(property: Property, frame: number, value: any): void;
	removeKeyframe(property: Property, frame: number): void;
	interpolate(property: Property, frame: number): any;
}
```

## Bonnes Pratiques

1. **Performance**

    - Utiliser des références pour les objets volumineux
    - Mettre en cache les calculs de transformation
    - Optimiser les mises à jour de rendu

2. **Organisation**

    - Maintenir une hiérarchie claire des calques
    - Grouper les propriétés logiquement
    - Utiliser des noms descriptifs

3. **Animation**

    - Utiliser des keyframes stratégiquement
    - Optimiser les courbes d'interpolation
    - Maintenir une timeline propre

4. **Maintenance**
    - Documenter les transformations complexes
    - Tester les cas limites
    - Gérer proprement les dépendances

## Voir aussi

-   [Timeline](../ui/timeline.md)
-   [Propriétés](./properties.md)
-   [Système de Rendu](../technical/render.md)
