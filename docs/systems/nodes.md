# Système de Nœuds (Flow)

## Vue d'ensemble

Le système de nœuds (Flow) permet de créer des graphes de calcul visuels pour manipuler et transformer des valeurs dans l'éditeur d'animation. Il fournit une interface visuelle pour définir des relations complexes entre les propriétés et les valeurs.

## Structure

### Graphe de Nœuds

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

### Nœud

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

### Entrées/Sorties

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

interface FlowNodeOutput {
	name: string;
	type: ValueType;
}
```

## Types de Nœuds

```typescript
enum FlowNodeType {
	// Basiques
	empty = "empty",

	// Numériques
	num_input = "num_input",
	num_cap = "num_cap",
	num_lerp = "num_lerp",

	// Vecteurs
	vec2_add = "vec2_add",
	vec2_lerp = "vec2_lerp",
	vec2_factors = "vec2_factors",
	vec2_input = "vec2_input",

	// Angles
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

	// Compositions
	composition = "composition",
}
```

## Compilation

### Graphe Compilé

```typescript
interface CompiledFlow {
	// Nœuds compilés
	nodes: Record<string, CompiledFlowNode>;

	// Ordre de calcul
	toCompute: CompiledFlowNode[];

	// Dépendances externes
	externals: FlowGraphExternals;

	// Expressions compilées
	expressions: Record<string, EvalFunction>;
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

## Dépendances Externes

```typescript
interface FlowGraphExternals {
	// Modificateur de tableau
	arrayModifierCount: {
		[arrayModifierCountPropertyId: string]: CompiledFlowNode[];
	};
	arrayModifierIndex: CompiledFlowNode[];

	// Animation
	frameIndex: CompiledFlowNode[];

	// Propriétés
	propertyValue: {
		[propertyId: string]: CompiledFlowNode[];
	};
}
```

## Opérations

### Manipulation de Graphe

```typescript
interface FlowOperations {
	// Nœuds
	addNode(type: FlowNodeType, position: Vec2): void;
	removeNode(nodeId: string): void;
	moveNode(nodeId: string, position: Vec2): void;

	// Connexions
	connect(
		sourceNodeId: string,
		outputIndex: number,
		targetNodeId: string,
		inputIndex: number,
	): void;
	disconnect(nodeId: string, inputIndex: number): void;

	// Sélection
	select(nodeIds: string[]): void;
	deselect(): void;
}
```

### Calcul de Valeurs

```typescript
interface FlowComputation {
	// Calcul d'un nœud
	computeNode(nodeId: string): ComputeFlowNodeResult;

	// Calcul du graphe
	computeGraph(graphId: string): void;

	// Mise à jour des valeurs
	updateValues(values: Record<string, any>): void;
}
```

## Bonnes Pratiques

1. **Performance**

    - Optimiser l'ordre de calcul
    - Mettre en cache les résultats intermédiaires
    - Minimiser les recalculs

2. **Organisation**

    - Maintenir des graphes clairs
    - Grouper les nœuds logiquement
    - Nommer les connexions clairement

3. **Validation**

    - Vérifier les types de données
    - Détecter les cycles
    - Gérer les erreurs proprement

4. **Maintenance**
    - Documenter les graphes complexes
    - Tester les cas limites
    - Maintenir la cohérence des données

## Voir aussi

-   [Système de Propriétés](./properties.md)
-   [Système de Composition](./composition.md)
-   [Éditeur de Flow](../ui/flow-editor.md)
