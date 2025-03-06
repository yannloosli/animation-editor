# Actions de Forme

> Pour une vue d'ensemble des flux d'actions et de leur intégration avec les actions de forme, consultez [Flux des Actions](./action-flows.md#flux-de-gestion-des-formes).

## Vue d'ensemble

Les actions de forme gèrent la création, la modification et la manipulation des formes vectorielles dans l'éditeur d'animation.

## Actions Disponibles

### Gestion de l'État

#### setState

```typescript
setState: (state: ShapeState) => Action;
```

Définit l'état complet d'une forme.

#### setShape

```typescript
setShape: (shape: ShapeGraph) => Action;
```

Définit ou met à jour une forme complète.

#### removeShape

```typescript
removeShape: (shapeId: string) => Action;
```

Supprime une forme spécifique.

### Gestion des Chemins

#### setPath

```typescript
setPath: (path: ShapePath) => Action;
```

Définit ou met à jour un chemin complet dans une forme.

#### setPathItem

```typescript
setPathItem: (pathId: string, itemIndex: number, item: ShapePathItem) => Action;
```

Modifie un élément spécifique d'un chemin.

#### setPathItemPart

```typescript
setPathItemPart: (
	pathId: string,
	itemIndex: number,
	which: "left" | "right",
	part: ShapePathItem["right"],
) => Action;
```

Modifie une partie spécifique (gauche ou droite) d'un élément de chemin.

#### removePath

```typescript
removePath: (pathId: string) => Action;
```

Supprime un chemin complet d'une forme.

#### removePathItem

```typescript
removePathItem: (pathId: string, itemIndex: number) => Action;
```

Supprime un élément spécifique d'un chemin.

### Gestion des Points de Contrôle

#### setPathItemControlPointId

```typescript
setPathItemControlPointId: (
	pathId: string,
	which: "left" | "right",
	itemIndex: number,
	controlPointId: string,
) => Action;
```

Définit l'ID d'un point de contrôle pour un élément de chemin.

#### insertPathItem

```typescript
insertPathItem: (pathId: string, insertIndex: number, item: ShapePathItem) => Action;
```

Insère un nouvel élément dans un chemin à l'index spécifié.

#### appendPathItem

```typescript
appendPathItem: (pathId: string, item: ShapePathItem, direction: "left" | "right") => Action;
```

Ajoute un nouvel élément à la fin ou au début d'un chemin.

## Utilisation

```typescript
// Exemple de création d'un nouveau chemin
dispatch(
	shapeActions.setPath({
		id: "path1",
		items: [],
		closed: false,
	}),
);

// Exemple d'ajout d'un point au chemin
dispatch(
	shapeActions.appendPathItem(
		"path1",
		{
			point: { x: 100, y: 100 },
			left: null,
			right: null,
		},
		"right",
	),
);

// Exemple de modification d'un point de contrôle
dispatch(shapeActions.setPathItemPart("path1", 0, "right", { x: 150, y: 100 }));
```

## Bonnes Pratiques

1. **Gestion des Chemins**

    - Maintenir la cohérence des points de contrôle
    - Gérer correctement les chemins fermés/ouverts
    - Optimiser le nombre de points dans les chemins

2. **Performance**

    - Éviter les modifications fréquentes des chemins
    - Grouper les modifications liées
    - Utiliser setState pour les mises à jour complètes

3. **Qualité Visuelle**
    - Maintenir des courbes lisses
    - Éviter les points superflus
    - Utiliser les points de contrôle de manière appropriée

## Types de Données

```typescript
interface ShapePath {
	id: string;
	items: ShapePathItem[];
	closed: boolean;
}

interface ShapePathItem {
	point: Vec2;
	left: Vec2 | null;
	right: Vec2 | null;
}

interface Vec2 {
	x: number;
	y: number;
}
```

## Voir aussi

-   [Architecture des Formes](../architecture/shapes.md)
-   [Système de Chemins](../technical/paths.md)
-   [Guide de Dessin Vectoriel](../ui/vector-drawing.md)
