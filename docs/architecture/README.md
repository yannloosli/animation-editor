# Architecture Générale

Cette section décrit l'architecture globale de l'éditeur d'animation.

## Vue d'ensemble

L'éditeur d'animation est construit autour de plusieurs systèmes principaux qui interagissent entre eux :

1. **Système de Calques**

    - Gestion de la hiérarchie des éléments
    - Transformations et propriétés
    - Modificateurs et effets

2. **Système de Flow**

    - Graphes de nœuds pour l'animation
    - Compilation et exécution
    - Gestion des dépendances

3. **Système de Diff**

    - Suivi des modifications
    - Historique des actions
    - Synchronisation d'état

4. **Système de Rendu**
    - Intégration avec PIXI.js
    - Optimisation des performances
    - Gestion des graphiques vectoriels

## Structure du Projet

```
src/
├── animation/      # Logique d'animation
├── components/     # Composants React
├── composition/    # Gestion des compositions
├── core/          # Fonctionnalités essentielles
├── flow/          # Système de nœuds
├── layer/         # Gestion des calques
├── property/      # Gestion des propriétés
├── render/        # Système de rendu
├── state/         # Gestion d'état
├── timeline/      # Interface timeline
├── toolbar/       # Barre d'outils
└── types/         # Définitions TypeScript
```

## Flux de Données

Le flux de données suit un modèle unidirectionnel :

1. Actions utilisateur
2. Dispatch des modifications
3. Mise à jour de l'état
4. Rendu des composants

## Technologies Clés

-   **React** : Interface utilisateur
-   **TypeScript** : Typage statique
-   **Redux** : Gestion d'état
-   **PIXI.js** : Rendu graphique
-   **Emotion** : Styling
-   **MathJS** : Calculs mathématiques

## Pour en savoir plus

-   [Vue d'ensemble détaillée](./overview.md)
-   [Flux de données](./data-flow.md)
-   [Système d'état](./state.md)
