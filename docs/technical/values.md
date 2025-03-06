# Système de Valeurs

## Vue d'ensemble

Le système de valeurs est un composant fondamental de l'éditeur d'animation qui gère différents types de données utilisées dans l'application. Il fournit une structure type-safe pour manipuler et transformer les valeurs dans l'éditeur.

## Types de Valeurs

Les types de valeurs suivants sont supportés :

| Type              | Description                    | Format                                 |
| ----------------- | ------------------------------ | -------------------------------------- |
| Number            | Valeur numérique simple        | Nombre décimal ou entier               |
| Vec2              | Vecteur 2D                     | [x, y]                                 |
| Rect              | Rectangle                      | {x, y, width, height}                  |
| RGBAColor         | Couleur avec alpha             | [r, g, b, a]                           |
| RGBColor          | Couleur sans alpha             | [r, g, b]                              |
| TransformBehavior | Comportement de transformation | "recursive" \| "absolute_for_computed" |
| OriginBehavior    | Comportement d'origine         | "relative" \| "absolute"               |
| Path              | Chemin SVG                     | String (format SVG)                    |
| FillRule          | Règle de remplissage           | "evenodd" \| "nonzero"                 |
| LineCap           | Style de fin de ligne          | "butt" \| "round" \| "square"          |
| LineJoin          | Style de jointure              | "miter" \| "round" \| "bevel"          |
| Any               | Type générique                 | N'importe quelle valeur                |

## Formats de Valeurs

Les valeurs peuvent être affichées dans différents formats :

-   Percentage : Affiche la valeur en pourcentage
-   Rotation : Affiche la valeur en degrés ou radians

## Propriétés et Groupes

Les valeurs sont organisées en propriétés et groupes de propriétés :

### Groupes de Propriétés

-   Transform (5000)
-   Dimensions (5001)
-   Content (5002)
-   Structure (5003)
-   Modifiers (5004)
-   Shape (5006)
-   Fill (5007)
-   Stroke (5008)

### Propriétés Composées

-   Anchor (1000)
-   Scale (1001)
-   Position (1002)
-   ArrayModifier_Origin (1003)

## Système de Couleurs

Le système supporte trois formats de couleurs :

-   HSL : [hue, saturation, lightness]
-   RGB : [red, green, blue]
-   RGBA : [red, green, blue, alpha]

## Transformations

Les transformations sont gérées via l'interface `LayerTransform` qui inclut :

-   origin : Point d'origine (Vec2)
-   originBehavior : Comportement de l'origine
-   translate : Translation (Vec2)
-   anchor : Point d'ancrage (Vec2)
-   rotation : Rotation en radians
-   scaleX/scaleY : Échelle sur les axes X et Y
-   matrix : Matrice de transformation

## Utilisation

```typescript
// Exemple d'utilisation des valeurs
const color: RGBAColor = [255, 0, 0, 1]; // Rouge opaque
const position: Vec2 = [100, 200]; // Position x: 100, y: 200
const transform: LayerTransform = {
	origin: [0, 0],
	originBehavior: "relative",
	translate: [0, 0],
	anchor: [0.5, 0.5],
	rotation: 0,
	scaleX: 1,
	scaleY: 1,
	matrix: new Mat2(),
};
```

## Bonnes Pratiques

1. Toujours utiliser les types appropriés pour garantir la type-safety
2. Utiliser les énumérations pour les valeurs prédéfinies
3. Respecter les formats de valeurs lors de l'affichage
4. Gérer les transformations via l'interface LayerTransform

## Intégration avec d'autres Systèmes

Le système de valeurs est étroitement intégré avec :

-   Le système de propriétés
-   Le système de rendu
-   Le système de transformation
-   L'éditeur de graphes
