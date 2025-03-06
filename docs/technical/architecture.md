# Architecture Technique

## Vue d'ensemble

L'éditeur d'animation est construit sur une architecture modulaire qui sépare les différentes responsabilités en systèmes distincts mais interconnectés.

## Systèmes Principaux

### 1. Système de Composition

-   Gestion des compositions
-   Organisation des calques
-   Gestion des propriétés
-   Intégration avec le système de rendu
-   Gestion des erreurs de composition

### 2. Système de Timeline

-   Gestion du temps et des keyframes
-   Contrôles de lecture
-   Édition des pistes
-   Synchronisation avec le rendu
-   Éditeur de tracks avancé

### 3. Système de Rendu

-   Rendu WebGL via PIXI.js
-   Gestion des assets graphiques
-   Pipeline de rendu optimisé
-   Gestion des caches
-   Traitement des dimensions des calques

### 4. Système de Flow

-   Éditeur de graphes de node
-   Logique de flux de données
-   Expressions et formules
-   Validation des connexions
-   Gestion des erreurs de graphe

### 5. Système de Diff

-   Comparaison de versions
-   Fusion de modifications
-   Résolution de conflits
-   Historique des changements
-   Factory de diff pour les opérations

## Architecture des Données

```typescript
// Structure principale du projet
interface Project {
	compositions: Composition[];
	assets: Asset[];
	settings: ProjectSettings;
}

// Composition
interface Composition {
	id: string;
	name: string;
	layers: Layer[];
	duration: number;
	width: number;
	height: number;
	errors?: CompositionError[];
}

// Calque
interface Layer {
	id: string;
	type: LayerType;
	properties: Property[];
	timeline: Timeline;
	transform: LayerTransform;
}

// Types de calques supportés
enum LayerType {
	Rect = 0,
	Ellipse = 1,
	Composition = 2,
	Shape = 3,
	Line = 4,
}

// Transformation de calque
interface LayerTransform {
	origin: Vec2;
	originBehavior: OriginBehavior;
	translate: Vec2;
	anchor: Vec2;
	rotation: number;
	scaleX: number;
	scaleY: number;
	matrix: Mat2;
}

// Propriété
interface Property {
	id: string;
	type: ValueType;
	value: any;
	keyframes?: Keyframe[];
}

// Types de valeurs supportés
enum ValueType {
	Number = "number",
	Vec2 = "vec2",
	Rect = "rect",
	RGBAColor = "rgba",
	RGBColor = "rgb",
	Path = "path",
	TransformBehavior = "transform_behavior",
	OriginBehavior = "origin_behavior",
	FillRule = "fill_rule",
	LineCap = "line_cap",
	LineJoin = "line_join",
	Any = "any",
}

// Gestion des erreurs
type CompositionError = IFlowNodeError | IGeneralError;

interface IFlowNodeError {
	type: CompositionErrorType.FlowNode;
	graphId: string;
	nodeId: string;
	error: Error;
}
```

## Flux de Données

1. **État Global**

    - Redux pour la gestion d'état
    - Actions et réducteurs typés
    - Middleware pour les effets secondaires
    - Gestion des opérations asynchrones

2. **État Local**

    - React hooks personnalisés
    - État composant
    - Memoization
    - Gestion des dimensions des calques

3. **Communication**
    - Events système
    - Pub/sub pour les notifications
    - WebWorkers pour les calculs lourds
    - Système de raccourcis clavier

## Pipeline de Rendu

```
[Layer Dimension] → [Transform Resolution] → [Array Modifier Processing] → [Composition] → [Property Resolution]
         ↓                    ↓                         ↓                        ↓               ↓
[Matrix Calc] → [Transform Behavior] → [Origin Processing] → [WebGL Batch] → [PIXI Render] → [Display]
     ↑                 ↑                      ↑                   ↑               ↑
[Assets] → [Cache] → [Optimizations] → [Batch Processing] → [GPU Upload]
```

## Systèmes Transversaux

### 1. Gestion des Assets

-   Chargement asynchrone
-   Gestion du cache
-   Optimisation des ressources
-   Préchargement intelligent

### 2. Performance

-   Virtualisation des listes
-   Rendu différé
-   Memoization des calculs
-   Optimisation WebGL
-   Gestion efficace des matrices

### 3. Sécurité

-   Validation des entrées
-   Sanitization des données
-   Gestion des permissions
-   Sécurité des assets

### 4. Interactions Utilisateur

-   Système de raccourcis clavier
-   Gestion des modificateurs
-   Menus contextuels
-   Drag and drop
-   Historique des actions

### 5. Debugging

-   Gestion des erreurs de composition
-   Logging avancé
-   Outils de développement
-   Validation des graphes
-   Traçage des performances

## Organisation du Code

```
src/
├── area/           # Gestion des zones de l'interface
├── components/     # Composants React réutilisables
├── composition/    # Système de composition
├── contextMenu/    # Menus contextuels
├── diff/          # Système de différences et versions
├── flow/          # Éditeur de graphes
├── graphEditor/    # Éditeur de graphes avancé
├── historyEditor/ # Gestion de l'historique
├── hook/          # Hooks React personnalisés
├── layer/         # Gestion des calques
├── listener/      # Gestionnaires d'événements
├── property/      # Système de propriétés
├── render/        # Système de rendu
├── shape/         # Formes géométriques
├── state/         # Gestion d'état (Redux)
├── timeline/      # Système de timeline
├── toolbar/       # Barre d'outils
├── trackEditor/   # Éditeur de pistes
├── types/         # Types TypeScript
├── util/          # Utilitaires
├── value/         # Gestion des valeurs
└── workspace/     # Espace de travail principal
```

## Technologies Clés

-   **Frontend**: React, TypeScript
-   **État**: Redux
-   **Rendu**: PIXI.js, WebGL
-   **Styling**: Emotion
-   **Build**: Vite
-   **Tests**: Jest, Testing Library

## Bonnes Pratiques

1. **Code**

    - TypeScript strict
    - Tests unitaires
    - Documentation inline
    - Code review
    - Gestion des erreurs systématique

2. **Performance**

    - Profiling régulier
    - Optimisations ciblées
    - Monitoring des performances
    - Benchmarks
    - Optimisation des matrices

3. **Maintenance**
    - Documentation à jour
    - Versioning sémantique
    - Changelog détaillé
    - Revues de code
    - Gestion des dépendances

## Voir aussi

-   [Performance](./performance.md)
-   [Maintenance](./maintenance.md)
-   [Tests](./testing.md)
