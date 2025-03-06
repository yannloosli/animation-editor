# Système de Composition

Le système de composition est un composant central de l'éditeur d'animation qui gère la création, la manipulation et le rendu des compositions animées.

## Architecture

Le système de composition est organisé en plusieurs modules et gestionnaires :

### Gestionnaires Principaux (`manager/`)

-   **Gestionnaire de Composition** (`compositionManager.ts`)

    -   Point d'entrée principal du système
    -   Coordination des autres gestionnaires
    -   Gestion du cycle de vie des compositions

-   **Gestionnaire de Calques** (`layer/LayerManager.ts`)

    -   Gestion des conteneurs de calques
    -   Rendu et mise à jour des calques
    -   Sous-compositions

-   **Gestionnaire de Propriétés** (`property/propertyManager.ts`)

    -   Gestion des propriétés des calques
    -   Validation et mise à jour des valeurs
    -   Gestion des erreurs

-   **Gestionnaire d'Interactions** (`interaction/interactionManager.ts`)

    -   Gestion des événements utilisateur
    -   Manipulation directe
    -   État d'interaction

-   **Gestionnaire de Tests de Collision** (`hitTest/HitTestManager.ts`)
    -   Détection des collisions
    -   Sélection précise des éléments

### Types et Structures de Base (`compositionTypes.ts`)

```typescript
export interface Composition {
	id: string;
	name: string;
	layers: string[];
	width: number;
	height: number;
	length: number;
	frameIndex: number;
}

export interface CompositionSelection {
	layers: KeySelectionMap;
	properties: KeySelectionMap;
}
```

### État et Réduction (`compositionReducer.ts`)

```typescript
export interface CompositionState {
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

## Fonctionnalités Principales

### 1. Gestion des Compositions

-   Création et destruction des compositions
-   Gestion des dimensions (width, height)
-   Contrôle de la timeline (frameIndex)
-   Gestion des erreurs

### 2. Système de Calques

-   Hiérarchie des calques
-   Sous-compositions
-   Conteneurs PIXI.js
-   Gestion des dimensions parentales

### 3. Lecture et Contrôle

Le système de lecture (`compositionPlayback.ts`) gère :

```typescript
interface Playback {
	frameIndex: number;
}
```

### 4. Sélection et Interaction

-   Sélection multiple via KeySelectionMap
-   Gestion des états de sélection par composition
-   Interactions directes avec les calques

### 5. Gestion des Erreurs

-   Validation des propriétés
-   Remontée des erreurs via les gestionnaires
-   Affichage des erreurs dans l'interface

## Utilisation

### Création d'un Gestionnaire de Composition

```typescript
const manager = manageComposition({
    compositionId: string;
    parentCompContainer: PIXI.Container;
    areaId?: string;
    interactionContainer?: PIXI.Container;
    initialScale?: number;
    depth: number;
    dimensions?: LayerDimension[];
    setErrors: (errors: CompositionError[]) => void;
});
```

### Gestion des Calques

```typescript
manager.layers.addLayer(actionState, layerId);
```

## Bonnes Pratiques

1. **Gestion des Gestionnaires**

    - Utiliser le système de gestionnaires pour les opérations complexes
    - Respecter la hiérarchie des responsabilités
    - Gérer proprement le cycle de vie des ressources

2. **Gestion des Erreurs**

    - Toujours implémenter la fonction setErrors
    - Valider les propriétés avant modification
    - Propager les erreurs aux composants parents

3. **Performance**
    - Utiliser efficacement les conteneurs PIXI.js
    - Gérer correctement la destruction des ressources
    - Optimiser les mises à jour des calques

## Intégration avec d'autres Systèmes

-   **PIXI.js** : Système de rendu principal
-   **Redux** : Gestion de l'état global
-   **Timeline** : Synchronisation avec le système de timeline
-   **Workspace** : Intégration avec les zones de travail

## Ressources

-   [Types de Composition](../technical/types.md)
-   [Guide des Transformations](../technical/transforms.md)
-   [Gestion des Calques](../ui/layer-management.md)
