# Système de Propriétés

## Vue d'ensemble

Le système de propriétés gère les attributs animables des calques dans l'éditeur d'animation. Il fournit une structure hiérarchique flexible pour organiser et manipuler les valeurs qui définissent l'apparence et le comportement des calques.

## Structure

### Registre des Propriétés

```typescript
interface PropertyInfoRegistry {
	layerIdSet: Set<string>;
	properties: { [propertyId: string]: PropertyInfo };
	propertyIdsByLayer: { [layerId: string]: string[] };
	addLayer: (actionState: ActionState, layerId: string) => void;
	getAnimatedPropertyIds: () => string[];
}
```

### Information de Propriété

```typescript
interface PropertyInfo {
	// Action à exécuter lors de la mise à jour
	performable: Performable;

	// Indique si la propriété est animée
	isAnimated: boolean;

	// Nœuds affectant la valeur calculée
	affectedByNodesInGraph: Set<string>;
}
```

## Types de Propriétés

### Propriété Simple

```typescript
interface Property {
	type: "property";
	id: string;
	layerId: string;
	compositionId: string;
	name: PropertyName;
	timelineId: string;
	compoundPropertyId: string;
	value: any;
}
```

### Propriété Composée

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

### Groupe de Propriétés

```typescript
interface PropertyGroup {
	type: "group";
	name: PropertyGroupName;
	id: string;
	layerId: string;
	compositionId: string;
	properties: string[];
	collapsed: boolean;
	graphId: string;
	viewProperties: string[];
}
```

## Actions Performables

```typescript
enum Performable {
	UpdatePosition = "updatePosition",
	UpdateTransform = "updateTransform",
	UpdateArrayModifierCount = "updateArrayModifierCount",
	UpdateArrayModifierTransform = "updateArrayModifierTransform",
	DrawLayer = "drawLayer",
}
```

## Valeurs Brutes

```typescript
interface PropertyRawValues {
	// Valeurs actuelles
	current: { [propertyId: string]: any };

	// Valeurs précédentes
	previous: { [propertyId: string]: any };

	// Méthodes
	getValue(propertyId: string): any;
	setPrevious(): void;
	update(propertyId: string, value: any): void;
}
```

## Gestion des Dépendances

### Affectation par les Nœuds

```typescript
interface NodeAffectedProperties {
	// Obtenir les IDs des propriétés affectées
	getPropertyIdsAffectedByNodes(nodeIds: string[]): string[];

	// Recalculer les valeurs affectées
	recomputePropertyValuesAffectedByNode(
		nodeId: string,
		registry: PropertyInfoRegistry,
		rawValues: PropertyRawValues,
	): void;
}
```

## Opérations

### Création

```typescript
interface PropertyCreation {
	createProperty(options: {
		name: PropertyName;
		layerId: string;
		compositionId: string;
		initialValue?: any;
	}): Property;

	createCompoundProperty(options: {
		name: CompoundPropertyName;
		layerId: string;
		compositionId: string;
	}): CompoundProperty;

	createPropertyGroup(options: {
		name: PropertyGroupName;
		layerId: string;
		compositionId: string;
	}): PropertyGroup;
}
```

### Modification

```typescript
interface PropertyModification {
	setValue(propertyId: string, value: any): void;
	setKeyframe(propertyId: string, frame: number, value: any): void;
	removeKeyframe(propertyId: string, frame: number): void;
	toggleSeparation(compoundPropertyId: string): void;
	toggleMaintainProportions(compoundPropertyId: string): void;
}
```

## Bonnes Pratiques

1. **Performance**

    - Minimiser les recalculs de valeurs
    - Mettre en cache les valeurs intermédiaires
    - Optimiser les mises à jour en cascade

2. **Organisation**

    - Grouper les propriétés logiquement
    - Utiliser des noms descriptifs
    - Maintenir une hiérarchie claire

3. **Animation**

    - Gérer efficacement les keyframes
    - Optimiser les interpolations
    - Maintenir la cohérence temporelle

4. **Maintenance**
    - Documenter les dépendances
    - Gérer proprement les suppressions
    - Valider les valeurs

## Voir aussi

-   [Système de Composition](./composition.md)
-   [Timeline](../ui/timeline.md)
-   [Système de Nœuds](./nodes.md)
