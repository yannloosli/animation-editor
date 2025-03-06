# Système de Différences (Diff)

## Vue d'ensemble

Le système de différences permet de suivre et d'appliquer des modifications à l'état de l'application de manière efficace et cohérente. Il est particulièrement utile pour la gestion des opérations composées et l'historique des modifications.

## Structure des Fichiers

```typescript
interface DiffSystem {
	// Types de Différences
	types: {
		PropertyDiff: typeof PropertyDiff;
		LayerDiff: typeof LayerDiff;
		CompositionDiff: typeof CompositionDiff;
		FlowDiff: typeof FlowDiff;
		ShapeDiff: typeof ShapeDiff;
		TimelineDiff: typeof TimelineDiff;
	};

	// Fabrique de Différences
	factory: typeof diffFactory;

	// Utilitaires
	utils: {
		filterIncomingTopLevelDiff: typeof filterIncomingTopLevelDiff;
		adjustDiffsToChildComposition: typeof adjustDiffsToChildComposition;
	};
}
```

## Types de Différences

```typescript
// Types de base pour les différences
interface _C {
	compositionId: string;
}

interface _L extends _C {
	layerId: string;
}

interface _P extends _L {
	propertyId: string;
}

// Différences de Composition
interface ModifyCompositionViewDiff extends _C {
	type: "modifyCompositionView";
	before: CompositionView;
	after: CompositionView;
}

// Différences de Calque
interface RemoveLayerDiff extends _L {
	type: "removeLayer";
	layer: Layer;
}

interface AddLayerDiff extends _L {
	type: "addLayer";
	layer: Layer;
}

interface LayerDiff extends _L {
	type: "modifyLayer";
	before: Partial<Layer>;
	after: Partial<Layer>;
}

// Différences de Propriétés
interface ModifyPropertyDiff extends _P {
	type: "modifyProperty";
	before: any;
	after: any;
}

interface TogglePropertyAnimatedDiff extends _P {
	type: "togglePropertyAnimated";
	before: boolean;
	after: boolean;
}

interface ModifyMultipleLayerPropertiesDiff {
	type: "modifyMultipleLayerProperties";
	layerIds: string[];
	compositionId: string;
	propertyId: string;
	before: any[];
	after: any[];
}

// Différences de Flow
interface FlowNodeStateDiff {
	type: "flowNodeState";
	nodeId: string;
	before: any;
	after: any;
}

interface FlowNodeExpressionDiff {
	type: "flowNodeExpression";
	nodeId: string;
	before: string;
	after: string;
}

interface AddFlowNodeDiff {
	type: "addFlowNode";
	node: FlowNode;
}

interface UpdateNodeConnectionDiff {
	type: "updateNodeConnection";
	connection: NodeConnection;
}

// Autres Différences
interface LayerParentDiff {
	type: "layerParent";
	layerId: string;
	compositionId: string;
	before: string | null;
	after: string | null;
}

interface PropertyStructureDiff {
	type: "propertyStructure";
	propertyId: string;
	before: PropertyStructure;
	after: PropertyStructure;
}

interface ModifierOrderDiff {
	type: "modifierOrder";
	layerId: string;
	before: string[];
	after: string[];
}

interface CompositionSelectionDiff {
	type: "compositionSelection";
	compositionId: string;
	before: string[];
	after: string[];
}

interface MouseMoveDiff {
	type: "mouseMove";
	position: Vec2;
	compositionId: string;
}

interface MouseOutDiff {
	type: "mouseOut";
	compositionId: string;
}

interface ToolDiff {
	type: "tool";
	before: string;
	after: string;
}

// Union de tous les types de différences
type Diff =
	| ModifyCompositionViewDiff
	| RemoveLayerDiff
	| AddLayerDiff
	| LayerDiff
	| ModifyPropertyDiff
	| TogglePropertyAnimatedDiff
	| ModifyMultipleLayerPropertiesDiff
	| FlowNodeStateDiff
	| FlowNodeExpressionDiff
	| AddFlowNodeDiff
	| UpdateNodeConnectionDiff
	| LayerParentDiff
	| PropertyStructureDiff
	| ModifierOrderDiff
	| CompositionSelectionDiff
	| MouseMoveDiff
	| MouseOutDiff
	| ToolDiff;
```

## Fabrique de Différences

```typescript
interface DiffFactory {
	// Création de différences de composition
	createModifyCompositionViewDiff: (params: {
		compositionId: string;
		before: CompositionView;
		after: CompositionView;
	}) => ModifyCompositionViewDiff;

	// Création de différences de calque
	createRemoveLayerDiff: (params: {
		layerId: string;
		compositionId: string;
		layer: Layer;
	}) => RemoveLayerDiff;

	createAddLayerDiff: (params: {
		layerId: string;
		compositionId: string;
		layer: Layer;
	}) => AddLayerDiff;

	createLayerDiff: (params: {
		layerId: string;
		compositionId: string;
		before: Partial<Layer>;
		after: Partial<Layer>;
	}) => LayerDiff;

	// Création de différences de propriétés
	createModifyPropertyDiff: (params: {
		propertyId: string;
		layerId: string;
		compositionId: string;
		before: any;
		after: any;
	}) => ModifyPropertyDiff;

	// ... autres méthodes de création
}
```

## Ajustement des Différences

```typescript
interface DiffAdjustment {
	// Filtrage des différences de niveau supérieur
	filterIncomingTopLevelDiff: (diff: Diff, compositionId: string) => boolean;

	// Ajustement pour les compositions enfants
	adjustDiffsToChildComposition: (
		diffs: Diff[],
		parentCompositionId: string,
		childCompositionId: string,
		options?: {
			includeParentDiffs?: boolean;
			adjustLayerIds?: boolean;
		},
	) => Diff[];
}
```

## Utilisation

### Création de Différences

```typescript
// Création d'une différence de propriété
const propertyDiff = createPropertyDiff(state, "property-1", oldValue, newValue);

// Création d'une différence de calque
const layerDiff = createLayerDiff(state, "layer-1", { opacity: 0.5 }, { opacity: 1.0 });
```

### Application de Différences

```typescript
// Dans une opération
operation.addDiff((state) => [
	createPropertyDiff(state, "prop-1", 0, 1),
	createLayerDiff(state, "layer-1", { visible: false }, { visible: true }),
]);

// Ajustement pour les compositions enfants
const adjustedDiffs = adjustDiffsToChildComposition(diffs, parentCompositionId, childCompositionId);
```

## Bonnes Pratiques

1. **Création de Différences**

    - Créer des différences atomiques
    - Inclure toutes les informations nécessaires
    - Valider les valeurs avant et après

2. **Performance**

    - Minimiser la taille des différences
    - Regrouper les différences liées
    - Optimiser les ajustements

3. **Maintenance**

    - Documenter les types de différences
    - Maintenir la cohérence des IDs
    - Gérer les cas d'erreur

4. **Tests**
    - Tester les cas limites
    - Valider les ajustements
    - Vérifier la réversibilité

## Voir aussi

-   [Gestion d'État](./state.md)
-   [Système de Composition](../systems/composition.md)
-   [Historique](./history.md)
