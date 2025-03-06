# Système de Calques

Le système de calques est l'un des composants fondamentaux de l'éditeur d'animation. Il gère la hiérarchie, les transformations et les propriétés des éléments animés.

## Types de Calques

```typescript
enum LayerType {
	Rect = 0, // Calques rectangulaires
	Ellipse = 1, // Calques elliptiques
	Composition = 2, // Calques de composition
	Shape = 3, // Calques de forme
	Line = 4, // Calques de ligne
}
```

## Structure des Transformations

Chaque calque possède une transformation définie par l'interface `LayerTransform` :

```typescript
interface LayerTransform {
	origin: Vec2; // Point d'origine
	originBehavior: "relative" | "absolute"; // Comportement de l'origine
	translate: Vec2; // Translation
	anchor: Vec2; // Point d'ancrage
	rotation: number; // Rotation (en radians)
	scaleX: number; // Échelle sur X
	scaleY: number; // Échelle sur Y
	matrix: Mat2; // Matrice de transformation
}
```

## Propriétés des Calques

### Groupes de Propriétés

Les propriétés sont organisées en groupes logiques :

```typescript
enum PropertyGroupName {
	Transform = 5000, // Transformations
	Dimensions = 5001, // Dimensions
	Content = 5002, // Contenu
	Structure = 5003, // Structure
	Modifiers = 5004, // Modificateurs
	Shape = 5006, // Forme
	Fill = 5007, // Remplissage
	Stroke = 5008, // Contour
}
```

### Propriétés Individuelles

Les propriétés principales incluent :

-   **Transformation** :

    -   Position (X, Y)
    -   Ancrage (X, Y)
    -   Échelle (X, Y)
    -   Rotation
    -   Opacité

-   **Dimensions** :

    -   Largeur/Hauteur
    -   Rayons (pour ellipses)

-   **Apparence** :
    -   Remplissage
    -   Couleur de contour
    -   Épaisseur de contour
    -   Rayon de bordure

## Modificateurs de Tableau

Le système inclut un modificateur de tableau puissant avec les propriétés suivantes :

```typescript
PropertyName {
    ArrayModifier_Count,              // Nombre d'instances
    ArrayModifier_TransformBehavior,  // Comportement de transformation
    ArrayModifier_RotationCorrection, // Correction de rotation
    ArrayModifier_OriginX,           // Point d'origine X
    ArrayModifier_OriginY,           // Point d'origine Y
    ArrayModifier_OriginBehavior     // Comportement de l'origine
}
```

## Opérations sur les Calques

### Gestion de la Hiérarchie

```typescript
const layerOperations = {
	setLayerParentLayer, // Définir le calque parent
	removeLayerParentLayer, // Supprimer le parent
	removeArrayModifier, // Supprimer un modificateur
};
```

### Dimensions des Calques

Les calques peuvent avoir différents types de dimensions :

```typescript
type LayerDimension =
	| { type: "array" | "parent"; count: number; matrix: PIXI.Matrix }
	| {
			type: "array_with_graph";
			count: number;
			matrix: PIXI.Matrix;
			absoluteMatrices: PIXI.Matrix[];
	  }
	| { type: "array_with_graph_recursive"; count: number; matrices: PIXI.Matrix[] };
```

## Intégration avec le Système de Rendu

Le système de calques s'intègre avec PIXI.js pour le rendu :

-   Utilisation de matrices de transformation PIXI
-   Gestion optimisée du rendu
-   Support des graphiques vectoriels

## Voir aussi

-   [Système de Flow](./flow.md)
-   [Transformations](../technical/transforms.md)
-   [Gestion des Propriétés](../ui/properties.md)
