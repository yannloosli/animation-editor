# Vue d'ensemble de l'Architecture

## Composants Principaux

### 1. Interface Utilisateur

L'interface utilisateur est divisée en plusieurs zones principales :

```
+------------------------+
|       Toolbar         |
+------------------------+
|        |              |
| Project |  Workspace  |
| Panel   |            |
|        |              |
+------------------------+
|      Timeline         |
+------------------------+
```

-   **Toolbar** : Accès aux outils principaux
-   **Project Panel** : Gestion des compositions et calques
-   **Workspace** : Zone d'édition principale
-   **Timeline** : Contrôle des animations

### 2. Système de Calques

Le système de calques est organisé hiérarchiquement :

```
Composition
├── Layer Group
│   ├── Shape Layer
│   └── Rectangle Layer
├── Composition Layer
│   └── Nested Layers
└── Array Modifier Layer
    └── Repeated Elements
```

### 3. Système de Flow

Le système de Flow utilise un graphe dirigé acyclique (DAG) :

```
[Input Node] → [Transform Node] → [Expression Node]
     ↓              ↓                    ↓
[Color Node] → [Interpolation] → [Property Output]
```

### 4. Pipeline de Rendu

```
User Input → State Update → Diff Generation → State Application → Render
   ↑                                                               |
   +---------------------------------------------------------------+
```

## Interactions entre Systèmes

### 1. Flow ↔ Calques

-   Les nœuds de Flow peuvent modifier les propriétés des calques
-   Les calques peuvent utiliser des graphes de Flow pour l'animation
-   Les modificateurs utilisent Flow pour les transformations

### 2. Diff ↔ État

-   Chaque modification génère un diff
-   Les diffs sont appliqués à l'état
-   L'historique est construit à partir des diffs

### 3. Rendu ↔ Calques

-   Les calques définissent la structure de rendu
-   Le système de rendu optimise l'affichage
-   Les transformations sont appliquées via PIXI.js

## Gestion des Données

### 1. État Global

```typescript
interface ApplicationState {
	compositions: Record<string, Composition>;
	layers: Record<string, Layer>;
	properties: Record<string, Property>;
	flowGraphs: Record<string, FlowGraph>;
	ui: UIState;
}
```

### 2. Actions

Les actions suivent un flux unidirectionnel :

1. Déclenchement d'action
2. Middleware de validation
3. Génération de diff
4. Application de l'état
5. Mise à jour du rendu

### 3. Optimisations

-   Mise en cache des calculs de Flow
-   Rendu sélectif des calques modifiés
-   Compilation des expressions
-   Gestion efficace de la mémoire

## Extensibilité

### 1. Plugins

Le système est conçu pour supporter des plugins :

-   Nouveaux types de nœuds
-   Nouveaux types de calques
-   Nouveaux outils
-   Extensions de l'interface

### 2. API

L'API publique permet :

-   L'intégration avec d'autres outils
-   L'automatisation des tâches
-   La création de scripts personnalisés

## Sécurité et Stabilité

### 1. Validation

-   Validation des types TypeScript
-   Vérification des entrées utilisateur
-   Validation des graphes de Flow

### 2. Récupération

-   Sauvegarde automatique
-   Restauration de l'état
-   Gestion des erreurs

## Pour en savoir plus

-   [Flux de données](./data-flow.md)
-   [Système d'état](./state.md)
-   [Systèmes Principaux](../systems/README.md)
