# Gestion des Assets

Ce document détaille la gestion des assets dans l'éditeur d'animation, en particulier les SVG et les formes.

## Système SVG

Le système SVG est composé de plusieurs modules clés :

### Structure des fichiers

-   `svgTypes.ts` : Définitions des types pour les éléments SVG
-   `svgUtils.ts` : Utilitaires pour la manipulation des SVG
-   `svgTransform.ts` : Gestion des transformations SVG
-   `svgStylesheet.ts` : Gestion des styles SVG
-   `parse/` : Parseurs SVG
-   `composition/` : Intégration avec le système de composition

### Fonctionnalités principales

1. **Parsing SVG**

    - Import de fichiers SVG
    - Conversion en structure interne
    - Validation des éléments

2. **Transformations**

    - Rotation
    - Mise à l'échelle
    - Translation
    - Matrices de transformation

3. **Stylisation**
    - Gestion des styles CSS
    - Application des styles inline
    - Héritage des propriétés

## Système de Formes

Le système de formes gère la manipulation et l'édition des formes géométriques.

### Structure des fichiers

-   `shapeTypes.ts` : Types de base pour les formes
-   `shapeUtils.ts` : Utilitaires de manipulation des formes
-   `shapeReducer.ts` : Gestion d'état des formes
-   `shapeSelectionReducer.ts` : Gestion de la sélection des formes

### Fonctionnalités principales

1. **Gestion des formes**

    - Création de formes basiques
    - Modification des propriétés
    - Opérations booléennes

2. **Sélection**

    - Sélection simple et multiple
    - Modes de sélection
    - Gestion des groupes

3. **Manipulation**
    - Redimensionnement
    - Rotation
    - Déformation
    - Points de contrôle

## Intégration avec Clipper

L'éditeur utilise la bibliothèque Clipper pour les opérations géométriques avancées :

1. **Opérations booléennes**

    - Union
    - Intersection
    - Différence
    - XOR

2. **Optimisation**
    - Simplification des chemins
    - Réduction des points
    - Lissage des courbes

## Bonnes Pratiques

1. **Performance**

    - Optimisation des transformations
    - Mise en cache des calculs complexes
    - Utilisation de Web Workers pour les opérations lourdes

2. **Compatibilité**

    - Support des standards SVG
    - Gestion des cas particuliers
    - Validation des entrées

3. **Maintenance**
    - Documentation des modifications
    - Tests unitaires
    - Gestion des versions

## Ressources

-   [Documentation Clipper](http://www.angusj.com/delphi/clipper.php)
-   [Spécification SVG](https://www.w3.org/TR/SVG2/)
-   [Guide des transformations SVG](https://developer.mozilla.org/fr/docs/Web/SVG/Attribute/transform)
