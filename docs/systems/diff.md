# Système de Diff

Le système de Diff est un composant crucial qui gère le suivi des modifications et permet l'historique des actions dans l'éditeur d'animation.

## Types de Différences

```typescript
enum DiffType {
	// Modifications de Composition
	ModifyCompositionDimensions = 5, // Dimensions de la composition
	ModifyCompositionView = 6, // Vue de la composition
	CompositionSelection = 22, // Sélection dans la composition

	// Gestion des Calques
	RemoveLayer = 2, // Suppression de calque
	AddLayer = 3, // Ajout de calque
	Layer = 4, // Modification de calque
	LayerParent = 19, // Parent du calque
	LayerIndexOrLength = 20, // Index ou longueur du calque

	// Gestion des Propriétés
	ModifyProperty = 10, // Modification de propriété
	PropertyStructure = 11, // Structure de propriété
	TogglePropertyAnimated = 12, // Activation/désactivation de l'animation
	ModifyMultipleLayerProperties = 13, // Modifications multiples

	// Système de Flow
	FlowNodeState = 14, // État d'un nœud
	FlowNodeExpression = 15, // Expression d'un nœud
	UpdateNodeConnection = 17, // Connexion entre nœuds
	AddFlowNode = 18, // Ajout d'un nœud

	// Interface Utilisateur
	ResizeAreas = 8, // Redimensionnement des zones
	MouseMove = 23, // Mouvement de souris
	MouseOut = 24, // Sortie de souris
	Tool = 25, // Changement d'outil

	// Autres
	FrameIndex = 9, // Index de frame
	ModifierOrder = 21, // Ordre des modificateurs
}
```

## Structure des Diffs

### Modifications de Composition

```typescript
interface ModifyCompositionViewDiff extends _C {
	type: DiffType.ModifyCompositionView;
	scale: number;
}

interface ModifyCompositionDimensions extends _C {
	type: DiffType.ModifyCompositionDimensions;
}
```

### Modifications de Calques

```typescript
interface RemoveLayerDiff extends _L {
	type: DiffType.RemoveLayer;
}

interface AddLayerDiff extends _L {
	type: DiffType.AddLayer;
}

interface LayerDiff extends _L {
	type: DiffType.Layer;
}
```

### Modifications de Propriétés

```typescript
interface ModifyPropertyDiff extends _P {
	type: DiffType.ModifyProperty;
}

interface TogglePropertyAnimatedDiff extends _P {
	type: DiffType.TogglePropertyAnimated;
}

interface ModifyMultipleLayerPropertiesDiff {
	type: DiffType.ModifyMultipleLayerProperties;
	propertyIds: string[];
}
```

### Modifications de Flow

```typescript
interface FlowNodeStateDiff {
	type: DiffType.FlowNodeState;
	nodeId: string;
}

interface FlowNodeExpressionDiff {
	type: DiffType.FlowNodeExpression;
	nodeId: string;
}

interface AddFlowNodeDiff {
	type: DiffType.AddFlowNode;
	nodeId: string;
}
```

## Utilisation du Système

### 1. Création de Diffs

```typescript
// Exemple de création d'un diff pour une modification de propriété
const diff: ModifyPropertyDiff = {
	type: DiffType.ModifyProperty,
	propertyId: "prop_id",
};
```

### 2. Application des Modifications

Le système de diff est utilisé pour :

-   Suivre les modifications en temps réel
-   Permettre l'annulation/rétablissement
-   Synchroniser l'état entre différents composants

### 3. Gestion de l'Historique

Les diffs sont utilisés pour :

-   Construire l'historique des modifications
-   Permettre la navigation dans l'historique
-   Fusionner les modifications si nécessaire

## Intégration avec d'autres Systèmes

### 1. Système de Calques

-   Suivi des modifications de calques
-   Gestion de la hiérarchie
-   Modifications des propriétés

### 2. Système de Flow

-   Modifications des nœuds
-   Connexions entre nœuds
-   États des nœuds

### 3. Interface Utilisateur

-   Modifications de la vue
-   Interactions utilisateur
-   Changements d'outils

## Bonnes Pratiques

1. **Création de Diffs**

    - Créer des diffs atomiques
    - Inclure toutes les informations nécessaires
    - Éviter les dépendances circulaires

2. **Application des Modifications**

    - Appliquer les modifications de manière synchrone
    - Valider les modifications avant application
    - Gérer les erreurs appropriément

3. **Gestion de l'Historique**
    - Grouper les modifications logiques
    - Optimiser le stockage des diffs
    - Nettoyer l'historique si nécessaire

## Voir aussi

-   [Système de Flow](./flow.md)
-   [Système de Calques](./layers.md)
-   [Gestion de l'État](../architecture/state.md)
