# Actions de Composition

> Pour une vue d'ensemble des flux d'actions et de leur intégration avec les actions de composition, consultez [Flux des Actions](./action-flows.md#flux-de-gestion-des-compositions).

## Vue d'ensemble

Les actions de composition gèrent la création, la modification et la manipulation des compositions d'animation, y compris leurs calques et propriétés.

## Actions Disponibles

### Gestion des Calques

#### applyLayerIndexShift

```typescript
applyLayerIndexShift: (
	compositionId: string,
	layerIndexShift: number,
	selectionState: CompositionSelectionState,
) => Action;
```

Applique un décalage à l'index des calques sélectionnés dans une composition.

#### setLayerIndex

```typescript
setLayerIndex: (layerId: string, index: number) => Action;
```

Définit l'index d'un calque spécifique dans sa composition.

#### setLayerPlaybackIndex

```typescript
setLayerPlaybackIndex: (layerId: string, index: number) => Action;
```

Définit l'index de lecture d'un calque pour l'animation.

#### setLayerIndexAndLength

```typescript
setLayerIndexAndLength: (layerId: string, index: number, length: number) => Action;
```

Définit simultanément l'index et la durée d'un calque.

#### moveLayers

```typescript
moveLayers: (
	compositionId: string,
	moveLayers: {
		type: "above" | "below";
		layerId: string;
	},
	selectionState: CompositionSelectionState,
) => Action;
```

Déplace les calques sélectionnés au-dessus ou en-dessous d'un calque cible.

### Gestion des Compositions

#### setComposition

```typescript
setComposition: (composition: Composition) => Action;
```

Définit ou met à jour une composition complète.

#### setCompositionName

```typescript
setCompositionName: (compositionId: string, name: string) => Action;
```

Modifie le nom d'une composition.

#### setCompositionDimension

```typescript
setCompositionDimension: (compositionId: string, which: "width" | "height", value: number) =>
	Action;
```

Modifie une dimension (largeur ou hauteur) d'une composition.

#### setCompositionLength

```typescript
setCompositionLength: (compositionId: string, value: number) => Action;
```

Définit la durée totale d'une composition.

#### removeComposition

```typescript
removeComposition: (compositionId: string) => Action;
```

Supprime une composition et tous ses calques associés.

### Gestion des Propriétés

#### setPropertyValue

```typescript
setPropertyValue: (propertyId: string, value: number | RGBColor | RGBAColor | TransformBehavior) =>
	Action;
```

Définit la valeur d'une propriété.

#### setPropertyGroupCollapsed

```typescript
setPropertyGroupCollapsed: (propertyId: string, collapsed: boolean) => Action;
```

Définit l'état de collapse d'un groupe de propriétés.

#### setPropertyTimelineId

```typescript
setPropertyTimelineId: (propertyId: string, timelineId: string) => Action;
```

Associe une timeline à une propriété pour l'animation.

### Gestion des Calques Avancée

#### createLayer

```typescript
createLayer: (compositionId: string, type: LayerType, options?: Partial<CreateLayerOptions>) =>
	Action;
```

Crée un nouveau calque dans une composition.

#### createNonCompositionLayer

```typescript
createNonCompositionLayer: ({ layer, propertiesToAdd }: ReturnType<typeof layerFactory>) => Action;
```

Crée un calque qui n'est pas lié à une composition.

#### createCompositionLayerReference

```typescript
createCompositionLayerReference: (layerId: string, compositionId: string) => Action;
```

Crée une référence de calque vers une composition existante.

## Utilisation

```typescript
// Exemple de création d'un nouveau calque
dispatch(compositionActions.createLayer("comp1", "shape", { name: "Rectangle 1" }));

// Exemple de modification des dimensions
dispatch(compositionActions.setCompositionDimension("comp1", "width", 1920));

// Exemple de déplacement de calques
dispatch(
	compositionActions.moveLayers("comp1", { type: "above", layerId: "layer2" }, selectionState),
);
```

## Bonnes Pratiques

1. **Gestion des Calques**

    - Maintenir une hiérarchie logique des calques
    - Utiliser des noms descriptifs
    - Gérer correctement les références entre compositions

2. **Performance**

    - Éviter les modifications inutiles de l'état
    - Grouper les modifications liées
    - Optimiser la gestion des propriétés animées

3. **Organisation**
    - Structurer les compositions de manière modulaire
    - Utiliser des groupes de propriétés appropriés
    - Maintenir une nomenclature cohérente

## Voir aussi

-   [Architecture des Compositions](../architecture/compositions.md)
-   [Gestion des Calques](../technical/layers.md)
-   [Système d'Animation](../technical/animation.md)
