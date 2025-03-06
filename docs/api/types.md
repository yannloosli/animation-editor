# Types et Interfaces

## Vue d'ensemble

Ce document détaille les principaux types et interfaces utilisés dans l'éditeur d'animation.

## Types de Base

### 1. Types Géométriques

```typescript
// Vecteur 2D
interface Vec2 {
	x: number;
	y: number;
}

// Rectangle
interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

// Matrice 2D
interface Mat2 {
	a: number;
	b: number;
	c: number;
	d: number;
	tx: number;
	ty: number;
}
```

### 2. Types de Couleur

```typescript
type HSLColor = [number, number, number];
type RGBColor = [number, number, number];
type RGBAColor = [number, number, number, number];

interface ColorTypes {
	hex: string;
	rgb: RGBColor;
	rgba: RGBAColor;
	hsl: HSLColor;
}
```

## Types de Calques

### 1. Types de Base

```typescript
enum LayerType {
	Rect = 0,
	Ellipse = 1,
	Composition = 2,
	Shape = 3,
	Line = 4,
}

interface BaseLayer {
	id: string;
	name: string;
	type: LayerType;
	visible: boolean;
	locked: boolean;
	parentId: string | null;
	compositionId: string;
}
```

### 2. Types Spécifiques

```typescript
interface RectLayer extends BaseLayer {
	type: LayerType.Rect;
	width: number;
	height: number;
	cornerRadius: number;
}

interface EllipseLayer extends BaseLayer {
	type: LayerType.Ellipse;
	radiusX: number;
	radiusY: number;
}

interface ShapeLayer extends BaseLayer {
	type: LayerType.Shape;
	path: Path2D;
	closed: boolean;
}
```

## Types de Propriétés

### 1. Types de Valeurs

```typescript
enum ValueType {
	Number = "number",
	Vec2 = "vec2",
	Rect = "rect",
	RGBAColor = "rgba",
	RGBColor = "rgb",
	TransformBehavior = "transform_behavior",
	OriginBehavior = "origin_behavior",
	Path = "path",
	FillRule = "fill_rule",
	LineCap = "line_cap",
	LineJoin = "line_join",
	Any = "any",
}

enum ValueFormat {
	Percentage,
	Rotation,
	Default,
}
```

### 2. Propriétés

```typescript
interface Property<T = any> {
	id: string;
	name: string;
	type: ValueType;
	value: T;
	defaultValue: T;
	animated: boolean;
	expression: string | null;
	format?: ValueFormat;
}

interface PropertyGroup {
	id: string;
	name: PropertyGroupName;
	properties: Array<Property | PropertyGroup>;
}
```

## Types de Flow

### 1. Nœuds

```typescript
interface FlowNode<T extends FlowNodeType = FlowNodeType> {
	id: string;
	type: T;
	position: Vec2;
	inputs: FlowNodeInput[];
	outputs: FlowNodeOutput[];
	state: FlowNodeState<T>;
}

interface FlowNodeInput<T = any> {
	type: ValueType;
	name: string;
	value: T;
	pointer: {
		nodeId: string;
		outputIndex: number;
	} | null;
}

interface FlowNodeOutput {
	name: string;
	type: ValueType;
}
```

### 2. Graphes

```typescript
interface FlowGraph {
	id: string;
	type: "layer_graph" | "array_modifier_graph";
	nodes: string[];
	connections: Array<{
		fromNode: string;
		fromOutput: number;
		toNode: string;
		toInput: number;
	}>;
}
```

## Types d'État

### 1. État de l'Application

```typescript
interface ApplicationState {
	compositions: Record<string, Composition>;
	layers: Record<string, Layer>;
	properties: Record<string, Property>;
	flowGraphs: Record<string, FlowGraph>;
	ui: UIState;
}

interface UIState {
	selectedTool: Tool;
	workspace: WorkspaceState;
	timeline: TimelineState;
	panels: PanelState;
}
```

### 2. État de l'Historique

```typescript
interface HistoryState {
	past: Diff[];
	future: Diff[];
	current: ApplicationState;
	index: number;
}
```

## Types d'Actions

```typescript
interface Action<T = any> {
	type: string;
	payload: T;
	meta?: {
		timestamp: number;
		source: "user" | "system" | "automation";
	};
}

interface ActionCreator<T> {
	type: string;
	(payload: T): Action<T>;
}
```

## Types d'Événements

```typescript
interface EditorEvent {
	type: string;
	target: any;
	timestamp: number;
	data: any;
}

interface MouseEvent extends EditorEvent {
	position: Vec2;
	button: number;
	modifiers: {
		shift: boolean;
		ctrl: boolean;
		alt: boolean;
	};
}
```

## Types Utilitaires

### 1. Géométrie

```typescript
type Point = Vec2;
type Size = Vec2;

interface Line {
	start: Point;
	end: Point;
}

interface Circle {
	center: Point;
	radius: number;
}

interface Path {
	commands: PathCommand[];
	closed: boolean;
}
```

### 2. Transformations

```typescript
interface Transform {
	origin: Vec2;
	translate: Vec2;
	rotation: number;
	scale: Vec2;
	matrix: Mat2;
}

type TransformBehavior = "recursive" | "absolute_for_computed";
type OriginBehavior = "relative" | "absolute";
```

## Types de Rendu

```typescript
interface RenderNode {
	id: string;
	type: LayerType;
	container: PIXI.Container;
	graphics: PIXI.Graphics;
	transform: Transform;
	visible: boolean;
	parent: RenderNode | null;
	children: RenderNode[];
}

interface RenderOptions {
	resolution: number;
	antialias: boolean;
	transparent: boolean;
	backgroundColor: number;
}
```

## Bonnes Pratiques

1. **Typage Strict**

    - Utiliser des types stricts
    - Éviter `any` quand possible
    - Documenter les types complexes

2. **Organisation**

    - Grouper les types logiquement
    - Maintenir la cohérence des noms
    - Utiliser des interfaces pour l'extension

3. **Documentation**
    - Documenter les propriétés importantes
    - Inclure des exemples d'utilisation
    - Expliquer les cas particuliers

## Voir aussi

-   [Architecture Générale](../architecture/README.md)
-   [Système de Calques](../systems/layers.md)
-   [Système de Flow](../systems/flow.md)
