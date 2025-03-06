# Actions de l'Area

## Vue d'ensemble

Les actions de l'area gèrent la manipulation et l'organisation des zones dans l'interface de l'éditeur d'animation.

## Actions Disponibles

### setFields

```typescript
setFields: (fields: Partial<AreaReducerState>) => Action;
```

Permet de mettre à jour plusieurs champs de l'état de l'area en une seule action.

### setJoinAreasPreview

```typescript
setJoinAreasPreview: (
	areaId: string | null,
	from: CardinalDirection | null,
	eligibleAreaIds: string[],
) => Action;
```

Configure la prévisualisation de la fusion des zones. Utilisé lors du drag & drop pour fusionner des zones.

### joinAreas

```typescript
joinAreas: (areaRowId: string, areaIndex: number, mergeInto: -1 | 1) => Action;
```

Fusionne deux zones adjacentes dans une rangée. Le paramètre `mergeInto` indique la direction de fusion (-1 pour gauche/haut, 1 pour droite/bas).

### insertAreaIntoRow

```typescript
insertAreaIntoRow: (rowId: string, area: Area, insertIndex: number) => Action;
```

Insère une nouvelle zone dans une rangée existante à l'index spécifié.

### convertAreaToRow

```typescript
convertAreaToRow: (
	areaId: string,
	cornerParts: [CardinalDirection, CardinalDirection],
	horizontal: boolean,
) => Action;
```

Convertit une zone simple en une rangée, permettant d'organiser plusieurs zones horizontalement ou verticalement.

### setRowSizes

```typescript
setRowSizes: (rowId: string, sizes: number[]) => Action;
```

Définit les tailles relatives des zones dans une rangée.

### wrapAreaInRow

```typescript
wrapAreaInRow: (areaId: string, orientation: AreaRowOrientation) => Action;
```

Enveloppe une zone existante dans une nouvelle rangée avec l'orientation spécifiée.

### setAreaType

```typescript
setAreaType: <T extends AreaType>(areaId: string, type: T, initialState?: AreaState<T>) => Action;
```

Change le type d'une zone et initialise son état si nécessaire.

### dispatchToAreaState

```typescript
dispatchToAreaState: (areaId: string, action: any) => Action;
```

Dispatch une action au reducer d'état spécifique d'une zone.

## Utilisation

```typescript
// Exemple de création d'une nouvelle rangée horizontale
dispatch(areaActions.convertAreaToRow("area1", ["left", "right"], true));

// Exemple de redimensionnement des zones dans une rangée
dispatch(
	areaActions.setRowSizes(
		"row1",
		[0.3, 0.7], // 30% pour la première zone, 70% pour la seconde
	),
);
```

## Bonnes Pratiques

1. **Gestion des Zones**

    - Toujours vérifier l'existence des zones avant de les manipuler
    - Utiliser des proportions relatives pour les tailles
    - Maintenir une structure cohérente des rangées

2. **Performance**

    - Éviter les modifications fréquentes de la structure
    - Grouper les modifications de taille quand possible
    - Utiliser setFields pour les mises à jour multiples

3. **Interface Utilisateur**
    - Fournir un retour visuel lors des opérations de fusion
    - Maintenir des proportions raisonnables entre les zones
    - Respecter les contraintes d'espace minimum

## Voir aussi

-   [Architecture des Areas](../architecture/areas.md)
-   [Système de Layout](../technical/layout.md)
-   [Guide d'Interface Utilisateur](../ui/layout.md)

> Pour une vue d'ensemble des flux d'actions et de leur intégration avec les actions d'area, consultez [Flux des Actions](./action-flows.md#flux-de-gestion-des-areas).
