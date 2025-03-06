# Transformations

## Vue d'ensemble

Le système de transformations gère toutes les opérations de transformation géométrique dans l'éditeur, incluant les translations, rotations, échelles et leurs compositions.

## Types de Base

### 1. Vecteur 2D

```typescript
interface Vec2 {
	x: number;
	y: number;

	// Opérations
	add(v: Vec2): Vec2;
	subtract(v: Vec2): Vec2;
	multiply(scalar: number): Vec2;
	divide(scalar: number): Vec2;

	// Propriétés
	length(): number;
	normalize(): Vec2;
	dot(v: Vec2): number;
}
```

### 2. Matrice 2D

```typescript
interface Mat2 {
	a: number; // scale X
	b: number; // skew Y
	c: number; // skew X
	d: number; // scale Y
	tx: number; // translate X
	ty: number; // translate Y

	// Opérations
	multiply(m: Mat2): Mat2;
	invert(): Mat2;
	identity(): Mat2;
	clone(): Mat2;
}
```

## Transformations de Base

### 1. Translation

```typescript
interface Translation {
	translate: Vec2;

	// Méthodes
	applyTranslation(point: Vec2): Vec2;
	getTranslationMatrix(): Mat2;
}
```

### 2. Rotation

```typescript
interface Rotation {
	angle: number; // en radians
	origin: Vec2;

	// Méthodes
	applyRotation(point: Vec2): Vec2;
	getRotationMatrix(): Mat2;
}
```

### 3. Échelle

```typescript
interface Scale {
	scaleX: number;
	scaleY: number;
	origin: Vec2;

	// Méthodes
	applyScale(point: Vec2): Vec2;
	getScaleMatrix(): Mat2;
}
```

## Transformation Complète

```typescript
interface Transform {
	// Composants
	origin: Vec2;
	translate: Vec2;
	rotation: number;
	scale: Vec2;

	// Comportement
	originBehavior: "relative" | "absolute";

	// Matrice
	matrix: Mat2;

	// Méthodes
	compose(): Mat2;
	decompose(): TransformComponents;
	apply(point: Vec2): Vec2;
}
```

## Hiérarchie de Transformations

```typescript
interface TransformHierarchy {
	// Gestion de la hiérarchie
	parent: TransformHierarchy | null;
	children: TransformHierarchy[];

	// Transformations
	localTransform: Transform;
	worldTransform: Transform;

	// Méthodes
	updateWorldTransform(): void;
	inverseTransform(): Transform;
}
```

## Interpolation

### 1. Interpolation Linéaire

```typescript
interface LinearInterpolation {
	// Interpolation simple
	lerp(start: number, end: number, t: number): number;
	lerpVec2(start: Vec2, end: Vec2, t: number): Vec2;
	lerpTransform(start: Transform, end: Transform, t: number): Transform;
}
```

### 2. Interpolation de Bézier

```typescript
interface BezierInterpolation {
	// Points de contrôle
	p0: Vec2;
	p1: Vec2;
	p2: Vec2;
	p3: Vec2;

	// Méthodes
	evaluate(t: number): Vec2;
	getDerivative(t: number): Vec2;
	splitCurve(t: number): [BezierCurve, BezierCurve];
}
```

## Optimisations

### 1. Cache de Matrices

```typescript
interface MatrixCache {
	// Gestion du cache
	getCachedMatrix(transform: Transform): Mat2 | null;
	cacheMatrix(transform: Transform, matrix: Mat2): void;
	invalidateCache(transform: Transform): void;

	// Optimisation
	shouldCache(transform: Transform): boolean;
}
```

### 2. Calculs Optimisés

```typescript
interface OptimizedTransforms {
	// Optimisations spécifiques
	fastRotation(angle: number): Mat2;
	fastScale(sx: number, sy: number): Mat2;
	combineTransforms(transforms: Transform[]): Transform;
}
```

## Utilitaires

### 1. Conversion d'Unités

```typescript
interface UnitConversion {
	// Conversions
	degToRad(degrees: number): number;
	radToDeg(radians: number): number;

	// Normalisation
	normalizeAngle(angle: number): number;
	clampScale(scale: number): number;
}
```

### 2. Calculs Géométriques

```typescript
interface GeometryUtils {
	// Calculs
	distance(p1: Vec2, p2: Vec2): number;
	angle(v1: Vec2, v2: Vec2): number;
	projectPoint(point: Vec2, line: Line): Vec2;

	// Tests
	isPointInRect(point: Vec2, rect: Rect): boolean;
	isPointOnLine(point: Vec2, line: Line, tolerance: number): boolean;
}
```

## Intégration PIXI.js

```typescript
interface PixiTransform {
	// Conversion
	toPixiMatrix(transform: Transform): PIXI.Matrix;
	fromPixiMatrix(matrix: PIXI.Matrix): Transform;

	// Application
	applyToContainer(container: PIXI.Container, transform: Transform): void;
	updateFromContainer(container: PIXI.Container): Transform;
}
```

## Bonnes Pratiques

1. **Performance**

    - Minimiser les calculs de matrices
    - Utiliser le cache de manière appropriée
    - Éviter les transformations inutiles

2. **Précision**

    - Gérer les erreurs d'arrondi
    - Normaliser les angles
    - Valider les valeurs d'échelle

3. **Maintenabilité**
    - Documenter les transformations complexes
    - Utiliser des noms explicites
    - Maintenir la cohérence des unités

## Voir aussi

-   [Système de Rendu](../systems/rendering.md)
-   [Système de Calques](../systems/layers.md)
-   [Performance](./performance.md)
