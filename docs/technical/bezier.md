# Courbes de Bézier

## Vue d'ensemble

Le système de courbes de Bézier est utilisé pour représenter et manipuler les courbes vectorielles dans l'éditeur d'animation. Il prend en charge les courbes de Bézier cubiques et quadratiques.

## Types de Courbes

### 1. Courbes Cubiques

```typescript
interface CubicBezier {
	p0: Vec2; // Point de départ
	p1: Vec2; // Premier point de contrôle
	p2: Vec2; // Deuxième point de contrôle
	p3: Vec2; // Point d'arrivée
}
```

### 2. Courbes Quadratiques

```typescript
interface QuadraticBezier {
	p0: Vec2; // Point de départ
	p1: Vec2; // Point de contrôle
	p2: Vec2; // Point d'arrivée
}
```

## API Principale

```typescript
interface BezierSystem {
	// Création
	createCubic: (p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2) => CubicBezier;
	createQuadratic: (p0: Vec2, p1: Vec2, p2: Vec2) => QuadraticBezier;

	// Évaluation
	evaluate: (curve: Bezier, t: number) => Vec2;
	evaluateDerivative: (curve: Bezier, t: number) => Vec2;

	// Manipulation
	split: (curve: Bezier, t: number) => [Bezier, Bezier];
	join: (curve1: Bezier, curve2: Bezier) => Bezier | null;

	// Analyse
	getBoundingBox: (curve: Bezier) => BBox;
	getLength: (curve: Bezier, precision?: number) => number;
}
```

## Fonctionnalités Avancées

### 1. Interpolation

```typescript
interface BezierInterpolation {
	// Interpolation entre courbes
	interpolate: (curve1: Bezier, curve2: Bezier, t: number) => Bezier;

	// Interpolation de points de contrôle
	interpolateControlPoints: (points1: Vec2[], points2: Vec2[], t: number) => Vec2[];

	// Lissage
	smooth: (curves: Bezier[]) => Bezier[];
}
```

### 2. Approximation

```typescript
interface BezierApproximation {
	// Approximation de points
	fitCurve: (points: Vec2[], error: number) => Bezier[];

	// Simplification
	simplify: (curve: Bezier, tolerance: number) => Bezier;

	// Conversion
	toPolyline: (curve: Bezier, tolerance: number) => Vec2[];
}
```

### 3. Opérations Géométriques

```typescript
interface BezierGeometry {
	// Intersection
	findIntersections: (curve1: Bezier, curve2: Bezier) => Vec2[];

	// Projection
	projectPoint: (
		point: Vec2,
		curve: Bezier,
	) => {
		point: Vec2;
		t: number;
		distance: number;
	};

	// Offset
	offset: (curve: Bezier, distance: number) => Bezier[];
}
```

## Optimisations

### 1. Cache de Calculs

```typescript
interface BezierCache {
	// Gestion du cache
	setCached: (key: string, value: any) => void;
	getCached: (key: string) => any | null;

	// Types de cache
	lengthCache: Map<string, number>;
	boundingBoxCache: Map<string, BBox>;
	derivativeCache: Map<string, Vec2[]>;
}
```

### 2. Précision Adaptative

```typescript
interface AdaptiveSampling {
	// Configuration
	setMinQuality: (quality: number) => void;
	setMaxQuality: (quality: number) => void;

	// Échantillonnage
	sample: (curve: Bezier) => Vec2[];
	sampleWithCurvature: (curve: Bezier) => {
		points: Vec2[];
		curvature: number[];
	};
}
```

## Utilitaires

### 1. Manipulation des Points de Contrôle

```typescript
interface ControlPointUtils {
	// Déplacement
	movePoint: (curve: Bezier, index: number, newPos: Vec2) => Bezier;

	// Contraintes
	constrainHandles: (curve: Bezier, constraints: PointConstraints) => Bezier;

	// Symétrie
	makeSymmetric: (curve: Bezier, index: number) => Bezier;
}
```

### 2. Analyse de Courbe

```typescript
interface CurveAnalysis {
	// Propriétés
	getCurvature: (curve: Bezier, t: number) => number;
	getTangent: (curve: Bezier, t: number) => Vec2;
	getNormal: (curve: Bezier, t: number) => Vec2;

	// Analyse globale
	getInflectionPoints: (curve: Bezier) => number[];
	getExtremaPoints: (curve: Bezier) => number[];
}
```

## Bonnes Pratiques

1. **Performance**

    - Utiliser le cache pour les calculs coûteux
    - Adapter la précision au contexte
    - Optimiser les opérations fréquentes

2. **Précision**

    - Gérer les cas dégénérés
    - Valider les entrées
    - Utiliser une tolérance appropriée

3. **Manipulation**

    - Maintenir la continuité C1
    - Préserver la symétrie des poignées
    - Éviter les auto-intersections

4. **Optimisation**
    - Simplifier les courbes complexes
    - Fusionner les segments colinéaires
    - Réduire le nombre de points de contrôle

## Voir aussi

-   [Tessellation](./shape-tessellation.md)
-   [Performance](./performance.md)
-   [Calques de Forme](./shape-layers.md)
