# Système de Rendu

## Vue d'ensemble

Le système de rendu est basé sur PIXI.js et gère l'affichage graphique de tous les éléments de l'éditeur d'animation. Il prend en charge le rendu des formes, des transformations, et des compositions imbriquées.

## Architecture

### Composants Principaux

1. **Gestionnaire de Calques**

    - Conversion des calques en graphiques PIXI
    - Gestion des transformations
    - Support des différents types de calques

2. **Gestionnaire de Transformations**

    - Matrices de transformation
    - Gestion des pivots et ancres
    - Support des transformations imbriquées

3. **Gestionnaire de Formes**
    - Rendu des formes géométriques
    - Support des chemins complexes
    - Gestion des styles de remplissage et de contour

## Types de Calques

### Calque Rectangle

```typescript
const updateRectLayerGraphic = (
	graphic: PIXI.Graphics,
	map: RectLayerPropertyMap,
	getPropertyValue: (propertyId: string) => any,
) => {
	// Propriétés
	const width = getPropertyValue(map[PropertyName.Width]);
	const height = getPropertyValue(map[PropertyName.Height]);
	const fill = getPropertyValue(map[PropertyName.Fill]);
	const strokeColor = getPropertyValue(map[PropertyName.StrokeColor]);
	const strokeWidth = getPropertyValue(map[PropertyName.StrokeWidth]);
	const borderRadius = getPropertyValue(map[PropertyName.BorderRadius]);

	// Rendu
	graphic.beginFill(color, alpha);
	graphic.lineStyle(strokeWidth, strokeColor, strokeAlpha);
	graphic.drawRoundedRect(0, 0, width, height, borderRadius);
	graphic.endFill();
};
```

### Calque Ellipse

```typescript
const updateEllipseLayerGraphic = (
	graphic: PIXI.Graphics,
	map: EllipseLayerPropertyMap,
	getPropertyValue: (propertyId: string) => any,
) => {
	// Propriétés
	const outerRadius = getPropertyValue(map[PropertyName.OuterRadius]);
	const fill = getPropertyValue(map[PropertyName.Fill]);
	const strokeWidth = getPropertyValue(map[PropertyName.StrokeWidth]);
	const strokeColor = getPropertyValue(map[PropertyName.StrokeColor]);

	// Rendu
	graphic.beginFill(color, alpha);
	graphic.lineStyle(strokeWidth, strokeColor, strokeAlpha);
	graphic.drawEllipse(0, 0, outerRadius, outerRadius);
};
```

### Calque de Forme

```typescript
interface ShapeRenderOptions {
	fill?: {
		color: RGBColor;
		opacity: number;
	};
	stroke?: {
		color: RGBColor;
		opacity: number;
		width: number;
		cap: LineCap;
		join: LineJoin;
		miterLimit: number;
	};
}
```

## Système de Transformation

### Matrice de Transformation

```typescript
interface LayerTransform {
	position: Vec2;
	anchor: Vec2;
	scale: Vec2;
	rotation: number;
	matrix: PIXI.Matrix;
}
```

### Hiérarchie des Transformations

-   Support des transformations parentes
-   Calcul des matrices composées
-   Gestion des pivots relatifs/absolus

## Pipeline de Rendu

1. **Préparation**

    - Création des conteneurs PIXI
    - Configuration des propriétés
    - Initialisation des transformations

2. **Mise à jour**

    - Calcul des transformations
    - Application des styles
    - Génération des chemins

3. **Rendu**
    - Application des matrices
    - Rendu des formes
    - Gestion des calques

## Optimisations

### Cache de Rendu

-   Mise en cache des formes statiques
-   Réutilisation des graphiques
-   Gestion de la mémoire

### Performance

-   Minimisation des recalculs
-   Optimisation des transformations
-   Gestion efficace des ressources

## Tests de Collision

### Graphiques de Test

```typescript
interface HitTestGraphic {
	graphic: PIXI.Graphics;
	bounds: PIXI.Rectangle;
	transform: PIXI.Matrix;
}
```

### Types de Tests

-   Test de point
-   Test de rectangle
-   Test de chemin

## Styles et Apparence

### Styles de Ligne

```typescript
type LineCap = "butt" | "round" | "square";
type LineJoin = "miter" | "round" | "bevel";
```

### Gestion des Couleurs

-   Support RGB/RGBA
-   Conversion HSL
-   Gestion de l'opacité

## Bonnes Pratiques

1. **Performance**

    - Utiliser le cache quand possible
    - Minimiser les opérations de rendu
    - Optimiser les transformations

2. **Mémoire**

    - Nettoyer les ressources inutilisées
    - Réutiliser les objets graphiques
    - Gérer efficacement les textures

3. **Maintenance**
    - Suivre les conventions PIXI.js
    - Documenter les optimisations
    - Tester les performances

## Intégration

Le système de rendu s'intègre avec :

-   Le système de composition
-   Le système de propriétés
-   Le système d'animation
-   Le système d'interaction
-   Le système de cache
