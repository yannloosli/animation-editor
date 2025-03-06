# Système de Propriétés

## Vue d'ensemble

Le système de propriétés est un composant fondamental qui gère toutes les propriétés modifiables des éléments de l'animation. Il fournit une structure type-safe et extensible pour la manipulation des valeurs et leur organisation.

## Structure

```typescript
src/property/
├── propertyConstants.ts  # Définitions et mappings des propriétés
└── propertyOperations.ts # Opérations sur les propriétés
```

## Types de Propriétés

### Propriétés de Base

```typescript
interface Property {
	id: string;
	type: "property";
	name: PropertyName;
	layerId: string;
	compositionId: string;
	timelineId?: string;
	value: any;
}
```

### Groupes de Propriétés

```typescript
interface PropertyGroup {
	id: string;
	type: "group";
	name: PropertyGroupName;
	properties: string[];
}
```

### Propriétés Composées

```typescript
interface CompoundProperty {
	type: "compound";
	name: CompoundPropertyName;
	id: string;
	layerId: string;
	compositionId: string;
	properties: string[];
	separated: boolean;
	allowMaintainProportions: boolean;
	maintainProportions: boolean;
}
```

## Valeurs et Formats

### Types de Valeurs

```typescript
enum ValueType {
	Number = "number",
	Vec2 = "vec2",
	Rect = "rect",
	RGBAColor = "rgba",
	RGBColor = "rgb",
	TransformBehavior = "transform_behavior",
	OriginBehavior = "origin_behavior",
	Path = "path",
	FillRule = "fill_rule",
	LineCap = "line_cap",
	LineJoin = "line_join",
	Any = "any",
}
```

### Formats d'Affichage

```typescript
enum ValueFormat {
	Percentage,
	Rotation,
}
```

## Contraintes et Limites

### Valeurs Minimales

```typescript
const propertyNameToMinValue = {
	Width: 0,
	Height: 0,
	InnerRadius: 0,
	OuterRadius: 0,
	StrokeWidth: 0,
	BorderRadius: 0,
	Opacity: 0,
	MiterLimit: 1,
};
```

### Valeurs Maximales

```typescript
const propertyNameToMaxValue = {
	Opacity: 1,
};
```

## Organisation des Propriétés

### Groupes Standards

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

## Opérations sur les Propriétés

### Opérations de Base

```typescript
const propertyOperations = {
    // Suppression récursive d'une propriété d'un groupe
    removePropertyFromGroupRecursive: (
        op: Operation,
        groupId: string,
        propertyId: string
    ) => void,

    // Autres opérations...
};
```

### Gestion des Dépendances

-   Nettoyage des timelines associées
-   Suppression des graphes liés
-   Mise à jour des références

## Visualisation et Interface

### Couleurs Timeline

```typescript
const propertyTimelineColor = {
	PositionX: "#FF3434",
	PositionY: "#5BE719",
	Width: "#32E8E8",
	Height: "#EE30F2",
};
```

### Formats d'Affichage

-   Pourcentage pour l'opacité
-   Degrés pour la rotation
-   Valeurs numériques standard

## Intégration avec d'autres Systèmes

### Timeline

-   Association propriété-timeline
-   Gestion des keyframes
-   Animation des valeurs

### Système de Composition

-   Organisation hiérarchique
-   Héritage des propriétés
-   Synchronisation des états

### Système de Rendu

-   Conversion des valeurs
-   Application des styles
-   Mise à jour des graphiques

## Bonnes Pratiques

1. **Gestion des Valeurs**

    - Valider les entrées
    - Respecter les limites
    - Gérer les cas spéciaux

2. **Performance**

    - Minimiser les mises à jour
    - Utiliser le cache
    - Optimiser les calculs

3. **Maintenance**
    - Documenter les contraintes
    - Suivre les conventions
    - Tester les cas limites

## Exemples d'Utilisation

### Création d'une Propriété

```typescript
const createProperty = (options: {
	name: PropertyName;
	value: any;
	layerId: string;
	compositionId: string;
}) => {
	return {
		id: generateId(),
		type: "property",
		...options,
	};
};
```

### Modification d'une Valeur

```typescript
const updatePropertyValue = (propertyId: string, value: any, op: Operation) => {
	op.add(compositionActions.setPropertyValue(propertyId, value));
};
```

## Gestion des Erreurs

1. **Validation des Types**

    - Vérification des types de valeurs
    - Conversion automatique si possible
    - Messages d'erreur explicites

2. **Contraintes**

    - Respect des limites min/max
    - Validation des formats
    - Gestion des dépendances

3. **Récupération**
    - Valeurs par défaut
    - État de secours
    - Journalisation des erreurs

## Voir aussi

-   [Système de Valeurs](./values.md)
-   [Timeline](../ui/timeline.md)
-   [Transformations](./transforms.md)
