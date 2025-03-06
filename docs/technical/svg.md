# Système SVG

Le système SVG est responsable de l'importation, du traitement et de la manipulation des graphiques vectoriels dans l'éditeur d'animation.

## Architecture

### Types de Nœuds SVG

Le système prend en charge les types de nœuds SVG suivants :

-   `SVGSvgNode` : Nœud racine SVG
-   `SVGRectNode` : Rectangles
-   `SVGLineNode` : Lignes
-   `SVGEllipseNode` : Ellipses
-   `SVGCircleNode` : Cercles
-   `SVGPathNode` : Chemins
-   `SVGGNode` : Groupes

### Structure de Base

Chaque nœud SVG hérite de `SVGNodeBase` qui contient :

-   `transform` : Chaîne de transformation
-   `transformOrigin` : Point d'origine de la transformation
-   `position` : Position dans l'espace
-   `anchor` : Point d'ancrage
-   `rotation` : Rotation en degrés
-   `scale` : Échelle sur les axes X et Y

## Fonctionnalités

### Parsing SVG

Le système utilise un parser SVG pour :

1. Analyser le document SVG
2. Extraire les attributs et propriétés
3. Construire une structure de nœuds
4. Gérer les styles et transformations

### Conversion en Chemins

Le système peut convertir différentes formes en chemins (`pathifySvgNode`) :

-   Cercles en courbes de Bézier
-   Rectangles en lignes
-   Ellipses en courbes de Bézier
-   Lignes en chemins simples
-   Polygones en séquences de lignes

### Gestion des Attributs

Support complet des attributs SVG :

-   Remplissage et couleurs
-   Contours et épaisseurs
-   Règles de remplissage
-   Jointures et extrémités de lignes
-   Transformations

### Intégration avec la Composition

Le système fournit des factory pour :

-   Créer des calques à partir de nœuds SVG
-   Appliquer les transformations
-   Gérer les propriétés visuelles
-   Maintenir la hiérarchie des groupes

## Utilitaires

Le système inclut des utilitaires pour :

-   Calculer les boîtes englobantes
-   Gérer les transformations SVG
-   Convertir les unités
-   Manipuler les chemins

## Bonnes Pratiques

1. Préférer les chemins pour les formes complexes
2. Optimiser les transformations
3. Utiliser les groupes pour l'organisation
4. Maintenir la compatibilité avec les standards SVG
5. Valider les entrées SVG

## Limitations

-   Certaines fonctionnalités SVG avancées ne sont pas supportées
-   Les filtres SVG ne sont pas implémentés
-   Les animations SVG natives ne sont pas prises en charge
-   Les masques et les motifs sont limités
