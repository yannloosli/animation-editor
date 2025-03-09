# Fonctionnalités de Dessin sur le Canvas

## Vue d'ensemble

L'éditeur d'animation fournit un ensemble complet d'outils de dessin vectoriel basés sur PIXI.js. Ces outils permettent la création et la manipulation de formes vectorielles complexes avec un contrôle précis sur les courbes.

## État Actuel et Limitations

### Fonctionnalités Implémentées
- Création et manipulation de formes vectorielles
- Système complet de points de contrôle et courbes de Bézier
- Sélection et édition multi-objets
- Raccourcis clavier pour une édition efficace
- Support basique de l'importation SVG

### Fonctionnalités en Développement
- Support avancé des styles (dégradés, motifs)
- Système complet de masques et modes de fusion
- Optimisations de performance (mise en cache, rendu sélectif)
- Métriques de performance et monitoring

### Limitations Actuelles
- Pas de support pour les dégradés et motifs complexes
- Optimisations de performance limitées
- Support partiel des masques et modes de fusion
- Métriques de performance non implémentées

## Architecture

### Structure Modulaire
- Séparation claire entre les handlers d'interaction (`penToolHandlers`)
- Système de propriétés pour les styles de base
- Pipeline de rendu avec PIXI.js
- Gestion d'état via un système d'actions et de réduction

### Système de Rendu

#### Pipeline PIXI.js
- Utilisation de `PIXI.Graphics` pour le rendu vectoriel
- Support des courbes de Bézier via la bibliothèque `bezier-js`
- Tesselation des chemins pour le remplissage via `newTess`

#### Prévisualisation
- Rendu en temps réel pendant le dessin
- Affichage des points de contrôle et des guides
- Support du magnétisme (snapping) à 45° avec la touche Shift

## Outils Principaux

### 1. Outil Pen (Crayon)

L'outil principal pour la création de formes vectorielles. Il permet de :
- Créer de nouveaux chemins vectoriels
- Continuer des chemins existants
- Fermer des chemins
- Manipuler des points de contrôle pour des courbes de Bézier

#### Structure des Chemins
```typescript
interface ShapePath {
    id: string;
    shapeId: string;
    items: ShapePathItem[];
}

interface ShapePathItem {
    nodeId: string;
    reflectControlPoints: boolean;
    left: {
        edgeId: string;
        controlPointId: string;
    } | null;
    right: {
        edgeId: string;
        controlPointId: string;
    } | null;
}
```

### 2. Système de Points et Contrôles

#### Points d'Ancrage (Nodes)
```typescript
interface ShapeNode {
    id: string;
    shapeId: string;
    position: Vec2;
}
```

#### Points de Contrôle
```typescript
interface ShapeControlPoint {
    id: string;
    edgeId: string;
    position: Vec2;
}

interface ShapeEdge {
    id: string;
    shapeId: string;
    n0: string; // ID du premier nœud
    n1: string; // ID du second nœud
    cp0: string; // ID du premier point de contrôle
    cp1: string; // ID du second point de contrôle
}
```

### 3. Styles et Apparence

#### Remplissage (Fill)
- Couleur RGBA
- Opacité (0-1)
- Règle de remplissage (fillRule)
- Support prévu pour les dégradés et motifs (non implémenté)

#### Contour (Stroke)
```typescript
interface StrokeStyle {
    color: RGB;
    opacity: number;
    lineWidth: number;
    lineCap: "butt" | "round" | "square";
    lineJoin: "miter" | "round" | "bevel";
    miterLimit: number;
}
```

## Interactions

### 1. Contrôles Utilisateur

#### Sélection
```typescript
interface SelectionState {
    nodes: Set<string>;
    controlPoints: Set<string>;
    edges: Set<string>;
    paths: Set<string>;
}
```

#### Déplacement
- Translation libre
- Translation contrainte (avec Shift pour 45°)
- Support du magnétisme (snapping)
- Déplacement groupé de points

### 2. Raccourcis Clavier et Modificateurs
- `Shift`: Contraindre les mouvements à 45°
- `Alt`: Modifier les points de contrôle de manière symétrique
- `Ctrl/Command`: Ajouter à la sélection
- `Space + Drag`: Navigation temporaire

## Système de Calques

### 1. Types de Calques
- Calques de forme vectorielle
- Support basique des masques et modes de fusion (fonctionnalités avancées en développement)

### 2. Propriétés
- Propriétés héritées et locales
- Styles de calque de base
- Transformations

## Importation SVG

### 1. Support des Standards
- Attributs SVG standards (fill, stroke, etc.)
- Conversion basique des chemins
- Préservation des styles de base

### 2. Conversion
- Transformation des chemins SVG en chemins natifs
- Mappage des propriétés SVG de base
- Support limité des groupes et transformations

## Roadmap

### Court Terme
1. Amélioration du système de styles
   - Implémentation des dégradés
   - Support des motifs
   - Styles de contour avancés

2. Optimisations de Performance
   - Mise en cache des géométries
   - Rendu sélectif
   - Monitoring des performances

### Long Terme
1. Support Avancé
   - Masques complexes
   - Modes de fusion avancés
   - Effets et filtres

2. Améliorations UX
   - Guides intelligents
   - Magnétisme contextuel
   - Historique d'actions amélioré

## Performances

### 1. Optimisations
- Utilisation de PIXI.Graphics pour le rendu efficace
- Mise en cache des géométries complexes
- Actualisation sélective des zones modifiées
- Gestion optimisée des points de contrôle

### 2. Limitations et Considérations
- Nombre maximal recommandé de points par forme : ~1000
- Complexité maximale recommandée des courbes de Bézier
- Impact des transformations sur les performances
- Gestion de la mémoire pour les grandes compositions

### 3. Métriques de Performance
- Temps de rendu par frame
- Utilisation mémoire
- Temps de réponse aux interactions
- Optimisation des calculs géométriques
