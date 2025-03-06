# Documentation Technique - Éditeur d'Animation

Cette documentation technique détaille l'architecture et le fonctionnement de l'éditeur d'animation.

## Structure de la Documentation

1. **Documentation Technique**

    - [Architecture](./technical/architecture.md)
    - [Gestion d'État](./technical/state.md)
    - [Système de Propriétés](./technical/properties.md)
    - [Système de Valeurs](./technical/values.md)
    - [Système de Rendu](./technical/render.md)
    - [Calques de Forme](./technical/shape-layers.md)
    - [Optimisation des Formes](./technical/shape-optimizations.md)
    - [Tessellation des Formes](./technical/shape-tessellation.md)
    - [Courbes de Bézier](./technical/bezier.md)
    - [Système de Cache](./technical/caching.md)
    - [Hooks Personnalisés](./technical/hooks.md)
    - [Gestion des Assets](./technical/assets.md)
    - [Listeners](./technical/listeners.md)
    - [Performance](./technical/performance.md)
    - [Sécurité](./technical/security.md)
    - [Tests](./technical/testing.md)
    - [Maintenance](./technical/maintenance.md)
    - [Transformations](./technical/transforms.md)
    - [Composants Partagés](./technical/shared.md)
    - [Système de Diff](./technical/diff.md)
    - [Système de Flow](./technical/flow.md)
    - [Système SVG](./technical/svg.md)
    - [Système de Composition](./technical/composition.md)

2. **Documentation Core**

    - [Composition](./core/composition.md)
    - [Timeline](./core/timeline.md)
    - [Projet](./core/project.md)

3. **Documentation UI**

    - [Workspace](./ui/workspace.md)
    - [Timeline](./ui/timeline.md)
    - [Éditeur de Pistes](./ui/track-editor.md)
    - [Éditeur de Graphes](./ui/graph-editor.md)
    - [Éditeur d'Historique](./ui/history-editor.md)
    - [Menus Contextuels](./ui/context-menus.md)
    - [Barre d'Outils](./ui/toolbar.md)
    - [Zones d'Interface](./ui/areas.md)
    - [Projet](./ui/project.md)

4. **Composants**

    - [Icons](./components/icons.md) : Bibliothèque d'icônes réutilisables
    - [Common](./components/common.md) : Composants communs partagés
    - [ColorPicker](./components/color-picker.md) : Sélecteur de couleurs avancé

## Technologies Utilisées

-   React - Framework UI
-   TypeScript - Typage statique
-   Redux - Gestion d'état
-   PIXI.js - Rendu WebGL
-   Emotion - Styling
-   SVG - Gestion des graphiques vectoriels
-   Clipper - Manipulation de formes géométriques

## Structure des Dossiers

```
src/
├── area/         # Gestion des zones de l'interface
├── composition/  # Gestion des compositions
├── components/   # Composants React réutilisables
│   ├── icons/   # Bibliothèque d'icônes
│   ├── common/  # Composants communs
│   └── colorPicker/ # Sélecteur de couleurs
├── contextMenu/  # Menus contextuels
├── diff/        # Gestion des différences
├── flow/        # Système de flux
├── graphEditor/ # Éditeur de graphes
├── historyEditor/ # Gestion de l'historique
├── hook/        # Hooks personnalisés
├── layer/       # Gestion des calques
├── listener/    # Gestionnaires d'événements
├── project/     # Gestion du projet
├── property/    # Gestion des propriétés
├── render/      # Système de rendu
├── shared/      # Composants et utilitaires partagés
├── shape/       # Gestion des formes
├── state/       # Gestion d'état Redux
│   ├── history/ # Gestion de l'historique
│   ├── store.ts # Configuration du store
│   ├── reducers.ts # Reducers principaux
│   ├── undoRedo.ts # Système d'annulation/rétablissement
│   ├── saveState.ts # Sauvegarde de l'état
│   ├── stateUtils.ts # Utilitaires d'état
│   ├── operation.ts # Gestion des opérations
│   └── createApplicationStateFromActionState.ts # Création d'état
├── svg/         # Gestion des SVG
├── timeline/    # Interface de timeline
├── toolbar/     # Barre d'outils
├── trackEditor/ # Éditeur de pistes
├── types/       # Types TypeScript
├── util/        # Utilitaires
├── value/       # Gestion des valeurs
└── workspace/   # Espace de travail principal

Fichiers principaux :
├── App.tsx      # Composant racine de l'application
├── main.tsx     # Point d'entrée de l'application
├── constants.ts # Constantes globales
├── globals.ts   # Variables globales
├── cssVariables.ts # Variables CSS
└── types.ts     # Types principaux de l'application
```

## Pour Commencer

Pour comprendre l'architecture globale du projet, commencez par la section [Architecture](./technical/architecture.md). Ensuite, explorez les différentes fonctionnalités dans l'ordre qui vous intéresse.

La documentation est organisée en sections logiques qui correspondent à la structure du code source. Chaque section contient des informations détaillées sur son fonctionnement, son API et ses cas d'utilisation.

## Contribution

Pour contribuer à la documentation :

1. Assurez-vous que vos modifications correspondent à la structure du code
2. Suivez le format Markdown existant
3. Incluez des exemples de code pertinents
4. Mettez à jour le README principal si nécessaire
5. Vérifiez les liens entre les documents
