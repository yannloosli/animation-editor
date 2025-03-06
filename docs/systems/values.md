# Système de Valeurs

## Vue d'ensemble

Le système de valeurs définit les types de données fondamentaux utilisés dans l'éditeur d'animation, leur représentation et leur manipulation.

## Types de Valeurs

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

## Formats de Valeurs

```typescript
enum ValueFormat {
	Percentage,
	Rotation,
}
```

## Types de Couleurs

```typescript
type HSLColor = [number, number, number];
type RGBColor = [number, number, number];
type RGBAColor = [number, number, number, number];
```

## Comportements

```typescript
type TransformBehavior = "recursive" | "absolute_for_computed";
type OriginBehavior = "relative" | "absolute";
type FillRule = "evenodd" | "nonzero";
type LineCap = "butt" | "round" | "square";
type LineJoin = "miter" | "round" | "bevel";
```

## Représentation Visuelle

### 1. Labels

```typescript
const valueTypeToLabel: Record<ValueType, string> = {
	[ValueType.Number]: "Number",
	[ValueType.Vec2]: "Vec2",
	[ValueType.Rect]: "Rect",
	[ValueType.RGBAColor]: "RGBA Color",
	[ValueType.RGBColor]: "RGB Color",
	[ValueType.TransformBehavior]: "Transform Behavior",
	[ValueType.OriginBehavior]: "Origin Behavior",
	[ValueType.Path]: "Path",
	[ValueType.FillRule]: "Fill Rule",
	[ValueType.LineCap]: "Line Cap",
	[ValueType.LineJoin]: "Line Join",
	[ValueType.Any]: "Any",
};
```

### 2. Couleurs

```typescript
const valueTypeToColor: Partial<Record<ValueType, string>> = {
	[ValueType.Number]: "#5189BD",
	[ValueType.Vec2]: "#56BA45",
	[ValueType.Rect]: "#F8C43E",
	[ValueType.RGBAColor]: "#EA3878",
	[ValueType.RGBColor]: "#EA3878",
	[ValueType.Any]: "#BEBEBE",
};
```

## Propriétés

### 1. Groupes de Propriétés

```typescript
enum PropertyGroupName {
	Transform = 5000,
	Dimensions = 5001,
	Content = 5002,
	Structure = 5003,
	Modifiers = 5004,
	Shape = 5006,
	Fill = 5007,
	Stroke = 5008,
	ArrayModifier = 5005,
}
```

### 2. Propriétés Composées

```typescript
enum CompoundPropertyName {
	Anchor = 1000,
	Scale = 1001,
	Position = 1002,
	ArrayModifier_Origin = 1003,
}
```

### 3. Propriétés Simples

```typescript
enum PropertyName {
	// Transform Properties
	AnchorX = 0,
	AnchorY = 1,
	Scale = 2,
	ScaleX = 24,
	ScaleY = 25,
	PositionX = 3,
	PositionY = 4,
	Rotation = 5,
	Opacity = 6,

	// Rect properties
	Width = 7,
	Height = 8,

	// Look properties
	Fill = 9,
	StrokeColor = 10,
	StrokeWidth = 11,
	BorderRadius = 12,
	RGBAColor = 18,
	RGBColor = 23,

	// Ellipse properties
	OuterRadius = 13,
	InnerRadius = 14,

	// Array Modifier
	ArrayModifier_Count = 15,
	ArrayModifier_TransformBehavior = 16,
	ArrayModifier_RotationCorrection = 26,
	ArrayModifier_OriginX = 27,
	ArrayModifier_OriginY = 28,
	ArrayModifier_OriginBehavior = 29,

	// Shape Layer
	ShapeLayer_Path = 17,
	FillRule = 19,
	LineCap = 20,
	LineJoin = 21,
	MiterLimit = 22,
}
```

## Transformations

```typescript
interface LayerTransform {
	origin: Vec2;
	originBehavior: OriginBehavior;
	translate: Vec2;
	anchor: Vec2;
	rotation: number; // Radians
	scaleX: number;
	scaleY: number;
	matrix: Mat2;
}
```

## Utilitaires

```typescript
interface ValueUtils {
	// Formatage
	formatValue(value: any, type: ValueType, format?: ValueFormat): string;
	parseValue(str: string, type: ValueType): any;

	// Conversion
	convertValue(value: any, fromType: ValueType, toType: ValueType): any;
	validateValue(value: any, type: ValueType): boolean;

	// Interpolation
	interpolateValue(a: any, b: any, t: number, type: ValueType): any;
	getDefaultValue(type: ValueType): any;
}
```

## Intégration

### 1. Avec le Système de Flow

```typescript
interface ValueFlowIntegration {
	// Conversion
	flowValueToPropertyValue(value: any, type: ValueType): any;
	propertyValueToFlowValue(value: any, type: ValueType): any;

	// Validation
	validateFlowValue(value: any, type: ValueType): boolean;
}
```

### 2. Avec l'Éditeur de Propriétés

```typescript
interface ValuePropertyEditorIntegration {
	// Édition
	getEditorForType(type: ValueType): PropertyEditor;
	getValidatorsForType(type: ValueType): PropertyValidator[];

	// Interface
	getControlsForType(type: ValueType): PropertyControls;
}
```

## Bonnes Pratiques

1. **Types**

    - Utiliser les types appropriés
    - Valider les conversions
    - Gérer les cas d'erreur

2. **Performance**

    - Optimiser les conversions fréquentes
    - Mettre en cache les validations
    - Minimiser les allocations

3. **Interface Utilisateur**

    - Fournir des contrôles adaptés
    - Afficher des erreurs claires
    - Supporter la validation en temps réel

4. **Maintenance**
    - Documenter les types personnalisés
    - Centraliser les conversions
    - Maintenir la cohérence des validations

## Voir aussi

-   [Système de Flow](./flow.md)
-   [Éditeur de Propriétés](../ui/properties.md)
-   [Système de Calques](./layers.md)
