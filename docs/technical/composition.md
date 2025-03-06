# Système de Composition

## Vue d'ensemble

Le système de composition est un composant central de l'éditeur d'animation qui gère la structure hiérarchique des animations. Il permet de créer, manipuler et rendre des compositions complexes composées de plusieurs calques et propriétés.

## Architecture

### Composants Principaux

1. **CompositionManager**

    - Gère l'état et le rendu d'une composition
    - Coordonne les interactions entre les différents gestionnaires
    - Composants :
        - `LayerManager` : Gestion des calques
        - `InteractionManager` : Gestion des interactions utilisateur
        - `PropertyManager` : Gestion des propriétés
        - `HitTestManager` : Gestion des tests de collision

2. **État de la Composition**

```typescript
interface CompositionState {
	compositions: {
		[compositionId: string]: Composition;
	};
	layers: {
		[layerId: string]: Layer;
	};
	properties: {
		[propertyId: string]: Property | CompoundProperty | PropertyGroup;
	};
	compositionLayerIdToComposition: {
		[layerId: string]: string;
	};
}
```

3. **Structure d'une Composition**

```typescript
interface Composition {
	id: string;
	name: string;
	layers: string[];
	width: number;
	height: number;
	length: number;
	frameIndex: number;
}
```

## Gestion des Calques

### Types de Calques

-   Rectangle
-   Ellipse
-   Composition (calques imbriqués)
-   Forme
-   Ligne

### Propriétés des Calques

-   Transformation (position, échelle, rotation)
-   Dimensions
-   Contenu
-   Structure
-   Modificateurs

## Système de Propriétés

### Groupes de Propriétés

Les propriétés sont organisées en groupes pour une meilleure gestion :

-   Transform (5000)
-   Dimensions (5001)
-   Content (5002)
-   Structure (5003)
-   Modifiers (5004)
-   Shape (5006)
-   Fill (5007)
-   Stroke (5008)

### Propriétés Composées

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

## Rendu et Affichage

### Pipeline de Rendu

1. Initialisation du conteneur PIXI
2. Création des gestionnaires
3. Configuration des interactions
4. Mise à jour des propriétés
5. Rendu des calques

### Gestion des Dimensions

```typescript
type LayerDimension =
	| {
			type: "array" | "parent";
			count: number;
			matrix: PIXI.Matrix;
	  }
	| {
			type: "array_with_graph";
			count: number;
			matrix: PIXI.Matrix;
			absoluteMatrices: PIXI.Matrix[];
	  }
	| {
			type: "array_with_graph_recursive";
			count: number;
			matrices: PIXI.Matrix[];
	  };
```

## Interactions Utilisateur

### Sélection

-   Sélection de calques
-   Sélection de propriétés
-   Gestion des états de sélection multiples

### Manipulation

-   Déplacement de calques
-   Modification des propriétés
-   Redimensionnement
-   Rotation

## Système de Lecture

### Contrôle de la Lecture

```typescript
interface Playback {
	frameIndex: number;
	// Autres propriétés de lecture
}
```

### Gestion du Temps

-   Contrôle de l'index de frame
-   Synchronisation des calques
-   Gestion des boucles

## Bonnes Pratiques

1. **Gestion des Ressources**

    - Nettoyer les ressources inutilisées
    - Gérer correctement la mémoire
    - Utiliser les pools d'objets pour les opérations fréquentes

2. **Performance**

    - Minimiser les recalculs
    - Utiliser le cache quand possible
    - Optimiser les mises à jour de rendu

3. **Organisation du Code**
    - Séparer les responsabilités
    - Utiliser des gestionnaires dédiés
    - Maintenir une structure claire des composants

## Intégration

Le système de composition s'intègre avec :

-   Le système de rendu
-   Le système de propriétés
-   Le système d'animation
-   L'interface utilisateur
-   Le système de sauvegarde

## Gestion des Erreurs

```typescript
type CompositionError = IFlowNodeError | IGeneralError;

interface IFlowNodeError extends _ErrorBase {
	type: CompositionErrorType.FlowNode;
	graphId: string;
	nodeId: string;
}

interface IGeneralError extends _ErrorBase {
	type: CompositionErrorType.General;
}
```
