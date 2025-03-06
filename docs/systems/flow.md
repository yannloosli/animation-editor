# Système de Flow

## Vue d'ensemble

Le système de flow permet de créer des animations complexes à travers des graphes de nœuds interconnectés. Il gère la compilation, l'évaluation et l'exécution des graphes de flow.

## Types de Nœuds

```typescript
enum FlowNodeType {
	// Nœuds numériques
	num_input = "num_input",
	num_cap = "num_cap",
	num_lerp = "num_lerp",

	// Nœuds vectoriels
	vec2_add = "vec2_add",
	vec2_lerp = "vec2_lerp",
	vec2_factors = "vec2_factors",
	vec2_input = "vec2_input",

	// Conversions
	deg_to_rad = "deg_to_rad",
	rad_to_deg = "rad_to_deg",

	// Transformations
	rect_translate = "rect_translate",

	// Expressions
	expr = "expr",

	// Couleurs
	color_from_hsl_factors = "color_from_hsl_factors",
	color_to_hsl_factors = "color_to_hsl_factors",
	color_from_rgba_factors = "color_from_rgba_factors",
	color_to_rgba_factors = "color_to_rgba_factors",
	color_input = "color_input",

	// Propriétés
	property_output = "property_output",
	property_input = "property_input",

	// Modificateurs
	array_modifier_index = "array_modifier_index",

	// Composition
	composition = "composition",
	empty = "empty",
}
```

## Structure des Graphes

### Graph de Flow

```typescript
interface FlowGraph {
	type: "layer_graph" | "array_modifier_graph";
	layerId: string;
	propertyId: string;
	id: string;
	nodes: string[];
	_addNodeOfTypeOnClick: { type: FlowNodeType; io?: FlowNodeIO } | null;
	_dragSelectRect: Rect | null;
}
```

### Nœud de Flow

```typescript
interface FlowNode<T extends FlowNodeType = FlowNodeType> {
	graphId: string;
	id: string;
	type: T;
	position: Vec2;
	width: number;
	inputs: FlowNodeInput[];
	outputs: FlowNodeOutput[];
	state: FlowNodeState<T>;
}
```

## Système de Compilation

### Flow Compilé

```typescript
interface CompiledFlow {
	nodes: Record<string, CompiledFlowNode>;
	toCompute: CompiledFlowNode[]; // Ordre de calcul
	externals: FlowGraphExternals; // Dépendances externes
	expressions: Record<string, EvalFunction>; // Expressions compilées
}
```

### Nœud Compilé

```typescript
interface CompiledFlowNode {
	id: string;
	next: CompiledFlowNode[];
	affectedExternals: FlowNodeAffectedExternals;
	computeIndex: number;
}
```

## Gestion des Entrées/Sorties

### Entrées

```typescript
interface FlowNodeInput<T = any> {
	type: ValueType;
	name: string;
	value: T;
	pointer: {
		nodeId: string;
		outputIndex: number;
	} | null;
}
```

### Sorties

```typescript
interface FlowNodeOutput {
	name: string;
	type: ValueType;
}
```

## Types de Valeurs

```typescript
enum ValueType {
	Number,
	Vec2,
	Rect,
	RGBAColor,
	RGBColor,
	TransformBehavior,
	OriginBehavior,
	Path,
	FillRule,
	LineCap,
	LineJoin,
	Any,
}
```

## Gestion des Erreurs

```typescript
type CompositionError =
	| IFlowNodeError // Erreurs spécifiques aux nœuds
	| IGeneralError; // Erreurs générales
```

## Intégration avec le Système de Diff

Le système de Flow s'intègre avec le système de Diff pour :

-   Suivre les modifications des nœuds
-   Gérer les mises à jour des connexions
-   Maintenir la cohérence du graphe

## Utilisation Pratique

1. **Création d'Animations** :

    - Connexion de nœuds pour créer des animations complexes
    - Utilisation d'expressions mathématiques
    - Manipulation de propriétés multiples

2. **Optimisation** :

    - Compilation des graphes pour des performances optimales
    - Ordre de calcul optimisé
    - Gestion efficace des dépendances

3. **Extensibilité** :
    - Système modulaire de nœuds
    - Support pour de nouveaux types de nœuds
    - Intégration facile avec d'autres systèmes

## Voir aussi

-   [Système de Calques](./layers.md)
-   [Système de Diff](./diff.md)
-   [Expressions Mathématiques](../technical/expressions.md)
