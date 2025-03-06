# Gestion d'État

> Pour une vue détaillée des flux d'actions et leurs interactions, voir [Flux des Actions](../api/action-flows.md).

## Vue d'ensemble

Le système de gestion d'état utilise Redux pour gérer l'état global de l'application. Il est conçu pour gérer efficacement les états complexes de l'éditeur d'animation, avec support pour l'historique des actions, la persistance et les opérations composées.

## Structure des Fichiers

```typescript
src/state/
├── store.ts           # Configuration principale du store Redux
├── reducers.ts        # Combinaison des reducers principaux
├── undoRedo.ts        # Système d'annulation/rétablissement
├── saveState.ts       # Système de sauvegarde d'état
├── stateUtils.ts      # Utilitaires pour la gestion d'état
├── operation.ts       # Gestion des opérations composées
├── history/           # Gestion de l'historique des actions
└── createApplicationStateFromActionState.ts  # Conversion d'état
```

## Types d'États Principaux

L'application utilise deux types principaux d'états :

1. **HistoryState<T>** : Pour les états qui nécessitent un historique des modifications

    - Compositions (`CompositionState`)
    - Sélection des compositions (`CompositionSelectionState`)
    - Flow (`FlowState`)
    - Sélection du flow (`FlowSelectionState`)
    - Projet (`ProjectState`)
    - Formes (`ShapeState`)
    - Sélection des formes (`ShapeSelectionState`)
    - Timeline (`TimelineState`)
    - Sélection de la timeline (`TimelineSelectionState`)

2. **ActionBasedState<T>** : Pour les états qui ne nécessitent pas d'historique
    - Areas (`AreaReducerState`)
    - Menus contextuels (`ContextMenuState`)
    - Outils (`ToolState`)

## Structure de l'État

```typescript
interface ApplicationState {
	// États avec historique
	compositionState: HistoryState<CompositionState>;
	compositionSelectionState: HistoryState<CompositionSelectionState>;
	flowState: HistoryState<FlowState>;
	flowSelectionState: HistoryState<FlowSelectionState>;
	project: HistoryState<ProjectState>;
	shapeState: HistoryState<ShapeState>;
	shapeSelectionState: HistoryState<ShapeSelectionState>;
	timelineState: HistoryState<TimelineState>;
	timelineSelectionState: HistoryState<TimelineSelectionState>;

	// États basés sur les actions
	area: ActionBasedState<AreaReducerState>;
	contextMenu: ActionBasedState<ContextMenuState>;
	tool: ActionBasedState<ToolState>;
}

interface ActionState {
	// États directs sans wrapper
	compositionState: CompositionState;
	compositionSelectionState: CompositionSelectionState;
	flowState: FlowState;
	flowSelectionState: FlowSelectionState;
	project: ProjectState;
	shapeState: ShapeState;
	shapeSelectionState: ShapeSelectionState;
	timelineState: TimelineState;
	timelineSelectionState: TimelineSelectionState;
	area: AreaReducerState;
	contextMenu: ContextMenuState;
	tool: ToolState;
}
```

## Reducers

Les reducers sont combinés dans `reducers.ts` en utilisant deux fonctions principales :

1. `createReducerWithHistory` : Pour les états avec historique
2. `createActionBasedReducer` : Pour les états basés sur les actions

```typescript
const reducers = {
	// États avec historique
	compositionState: createReducerWithHistory(initialCompositionState, compositionReducer),
	compositionSelectionState: createReducerWithHistory(
		initialCompositionSelectionState,
		compositionSelectionReducer,
		{ selectionForKey: "compositionState" },
	),
	// ... autres états avec historique

	// États basés sur les actions
	area: createActionBasedReducer(initialAreaState, areaReducer),
	contextMenu: createActionBasedReducer(initialContextMenuState, contextMenuReducer),
	tool: createActionBasedReducer(initialToolState, toolReducer),
};
```

## Système d'Historique

Le système d'historique est géré par le dossier `history/` qui contient :

1. `actionBasedReducer.ts` : Gestion des états basés sur les actions
2. `historyReducer.ts` : Gestion des états avec historique

### Fonctionnalités principales :

-   Annulation/Rétablissement via `undoRedo.ts`
-   Sauvegarde d'état via `saveState.ts`
-   Utilitaires d'état via `stateUtils.ts`
-   Opérations composées via `operation.ts`

## Mapping d'État

L'application fournit deux types de mapping pour les composants React :

```typescript
type MapApplicationState<StateProps, OwnProps = {}> = (
	state: ApplicationState,
	ownProps: OwnProps,
) => StateProps;

type MapActionState<StateProps, OwnProps = {}> = (
	state: ActionState,
	ownProps: OwnProps,
) => StateProps;
```

Ces types permettent de mapper soit l'état complet de l'application (avec historique), soit l'état des actions (sans historique) vers les props des composants.

## Composants Principaux

### Store et Reducers

Le store est configuré dans `store.ts` et utilise `reducers.ts` pour combiner plusieurs reducers qui gèrent différents aspects de l'application :

-   Area Reducer : Gestion des zones de l'interface (ActionBasedState)
-   Composition Reducer : État des compositions et leur sélection (HistoryState)
-   Flow Reducer : Gestion du système de flow et sa sélection (HistoryState)
-   Timeline Reducer : État de la timeline et sa sélection (HistoryState)
-   Project Reducer : État global du projet (HistoryState)
-   Shape Reducer : Gestion des formes et leur sélection (HistoryState)
-   Tool Reducer : État des outils (ActionBasedState)
-   Context Menu : État des menus contextuels (ActionBasedState)

### Middleware

Les middlewares personnalisés permettent d'intercepter et de modifier les actions avant qu'elles n'atteignent les reducers. Ils sont utilisés pour :

-   Logger les actions en développement
-   Gérer les opérations asynchrones
-   Valider les actions
-   Optimiser les performances

### Système d'Historique

Le système d'historique (`history/`) est un composant central qui :

1. **Gère deux types d'états** :

    - `HistoryState` : Pour les états avec historique complet (compositions, formes, etc.)
    - `ActionBasedState` : Pour les états sans historique (interface, outils)

2. **Fournit les fonctionnalités** :

    - Suivi des modifications de l'état
    - Système d'annulation/rétablissement (`undoRedo.ts`)
    - Points de restauration
    - Fusion d'actions similaires
    - Optimisation de la mémoire

3. **Intègre avec le système de sauvegarde** :
    - Persistance de l'état via `saveState.ts`
    - Restauration de l'état au démarrage
    - Gestion des versions
    - Validation des données

### Sauvegarde d'État

Le système de sauvegarde (`saveState.ts`) gère :

-   La persistance de l'état
-   La restauration de l'état
-   La gestion des versions
-   La validation des données

### Opérations

Les opérations (`operation.ts`) permettent de :

-   Regrouper plusieurs actions
-   Gérer les transformations complexes
-   Assurer la cohérence des données
-   Optimiser les performances

## État Principal

```typescript
interface ApplicationState {
	// État des Areas
	area: ActionBasedState<AreaReducerState>;

	// État des Compositions
	compositionState: HistoryState<CompositionState>;
	compositionSelectionState: HistoryState<CompositionSelectionState>;

	// État du Flow
	flowState: HistoryState<FlowState>;
	flowSelectionState: HistoryState<FlowSelectionState>;

	// État de l'Interface
	contextMenu: ActionBasedState<ContextMenuState>;

	// État du Projet
	project: HistoryState<ProjectState>;

	// État des Formes
	shapeState: HistoryState<ShapeState>;
	shapeSelectionState: HistoryState<ShapeSelectionState>;

	// État de la Timeline
	timelineState: HistoryState<TimelineState>;
	timelineSelectionState: HistoryState<TimelineSelectionState>;

	// État des Outils
	tool: ActionBasedState<ToolState>;
}

interface ActionState {
	area: AreaReducerState;
	compositionState: CompositionState;
	compositionSelectionState: CompositionSelectionState;
	flowState: FlowState;
	flowSelectionState: FlowSelectionState;
	contextMenu: ContextMenuState;
	project: ProjectState;
	shapeState: ShapeState;
	shapeSelectionState: ShapeSelectionState;
	timelineState: TimelineState;
	timelineSelectionState: TimelineSelectionState;
	tool: ToolState;
}
```

## Opérations

```typescript
// Interface d'opération
interface Operation {
	// Gestion des Actions
	add: (...actions: Action[]) => void;
	clear: () => void;

	// Gestion des Différences
	addDiff: (fn: DiffFactoryFn) => void;
	performDiff: (fn: DiffFactoryFn) => void;

	// Exécution
	submit: () => void;

	// État Courant
	state: ActionState;
}

// Création d'opération
function createOperation(params: RequestActionParams): Operation {
	const diffsToAdd: DiffFactoryFn[] = [];
	const diffsToPerform: DiffFactoryFn[] = [];
	const actions: Action[] = [];

	return {
		add: (..._actions) => actions.push(..._actions),
		clear: () => {
			actions.length = 0;
			diffsToAdd.length = 0;
			diffsToPerform.length = 0;
		},
		addDiff: (fn) => diffsToAdd.push(fn),
		performDiff: (fn) => diffsToPerform.push(fn),
		submit: () => {
			params.dispatch(actions);
			diffsToPerform.forEach(params.performDiff);
			diffsToAdd.forEach((diff) => params.addDiff(diff));
			self.state = getActionState();
			self.clear();
		},
		state: getActionState(),
	};
}

// Exécution d'opération
function performOperation(params: RequestActionParams, fn: (op: Operation) => void): void {
	const op = createOperation(params);
	fn(op);
	op.submit();
}

// Types d'actions
type Action = { type: string; payload: any };
type ToDispatch = Action[];

// Types de valeurs
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

enum ValueFormat {
	Percentage,
	Rotation,
}

// Types de calques
enum LayerType {
	Rect = 0,
	Ellipse = 1,
	Composition = 2,
	Shape = 3,
	Line = 4,
}

// Types de transformations
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

// Types de comportements
type TransformBehavior = "recursive" | "absolute_for_computed";
type OriginBehavior = "relative" | "absolute";
type FillRule = "evenodd" | "nonzero";
type LineCap = "butt" | "round" | "square";
type LineJoin = "miter" | "round" | "bevel";

// Types d'erreurs
enum CompositionErrorType {
	FlowNode,
	General,
}

interface IFlowNodeError {
	type: CompositionErrorType.FlowNode;
	graphId: string;
	nodeId: string;
	error: Error;
}

interface IGeneralError {
	type: CompositionErrorType.General;
	error: Error;
}

type CompositionError = IFlowNodeError | IGeneralError;

// Types de dimensions
type LayerDimension =
	| {
			type: "array" | "parent";
			count: number;
			matrix: PIXI.Matrix;
	  }
	| {
			type: "array_with_graph";
			count: number;
			matrix: PIXI.Matrix;
			absoluteMatrices: PIXI.Matrix[];
	  }
	| {
			type: "array_with_graph_recursive";
			count: number;
			matrices: PIXI.Matrix[];
	  };

// Types de raccourcis clavier
type ShortcutFn = (areaId: string, params: RequestActionParams) => void;
interface KeyboardShortcut {
	name: string;
	key: keyof typeof keys;
	modifierKeys?: Array<"Command" | "Alt" | "Shift">;
	optionalModifierKeys?: Array<"Command" | "Alt" | "Shift">;
	fn: ShortcutFn;
	history?: boolean;
	shouldAddToStack?: ShouldAddShortcutToStackFn;
}
```

## Historique

```typescript
interface HistoryState<T> {
	// Type d'historique
	type: "normal" | "selection";

	// Liste des états
	list: Array<{
		state: T;
		name: string;
		modifiedRelated: boolean;
		allowIndexShift: boolean;
		diffs: Diff[];
	}>;

	// Position actuelle
	index: number;
	indexDirection: -1 | 1;

	// Action en cours
	action: null | {
		id: string;
		state: T;
	};
}

interface HistoryActions {
	// Navigation dans l'historique
	moveHistoryIndex: (index: number) => Action;

	// Gestion des actions
	startAction: (actionId: string) => Action;
	dispatchToAction: (actionId: string, actionToDispatch: any, modifiesHistory: boolean) => Action;
	dispatchBatchToAction: (
		actionId: string,
		actionBatch: any[],
		modifiesHistory: boolean,
	) => Action;
	submitAction: (
		actionId: string,
		name: string,
		modifiesHistory: boolean,
		modifiedKeys: string[],
		allowIndexShift: boolean,
		diffs: Diff[],
	) => Action;
	cancelAction: (actionId: string) => Action;
}

interface HistoryOptions {
	selectionForKey?: string;
}

// Création d'un reducer avec historique
function createReducerWithHistory<S>(
	initialState: S,
	reducer: (state: S, action: any) => S,
	options: HistoryOptions = {},
): Reducer<HistoryState<S>>;
```

## Persistance

```typescript
// Clé de stockage
const STORAGE_KEY = "__SAVED_ACTION_STATE";

// Fonctions de persistance
interface StatePersistence {
	// Sauvegarde de l'état
	saveActionState: () => void;

	// Chargement de l'état
	getSavedActionState: () => ActionState | null;
}

// Utilitaires de parsing
interface StateParser {
	// Conversion des types spéciaux (Vec2, etc.)
	parseItem: (item: Json) => any;
}

// Types de données supportés
type Json = string | number | boolean | null | JsonObject | Json[];
interface JsonObject {
	[key: string]: Json;
	__objectType?: string;
}

// Exemple d'objet spécial (Vec2)
interface Vec2Json extends JsonObject {
	__objectType: "vec2";
	x: number;
	y: number;
}
```

## Utilitaires

```typescript
interface StateUtils {
	// Accès à l'état
	getActionState: () => ActionState;
	getCurrentState: () => ActionState;
	getActionId: () => string | null;
	getIsActionInProgress: () => boolean;

	// Conversion d'état
	getActionStateFromApplicationState: (state: ApplicationState, index?: number) => ActionState;
	getCurrentStateFromApplicationState: (state: ApplicationState) => ActionState;

	// Utilitaires pour les areas
	areaActionStateFromState: <T extends AreaType>(
		areaId: string,
		actionState: ActionState,
	) => AreaState<T>;
	getAreaActionState: <T extends AreaType>(areaId: string) => AreaState<T>;

	// Connexion React-Redux
	connectActionState: <TStateProps = {}, TOwnProps = {}>(
		mapStateToProps: MapActionState<TStateProps, TOwnProps>,
	) => InferableComponentEnhancerWithProps<TStateProps & DispatchProp, TOwnProps>;
}

// Types de mapping d'état
type MapActionState<StateProps, OwnProps = {}> = (
	state: ActionState,
	ownProps: OwnProps,
) => StateProps;

type MapApplicationState<StateProps, OwnProps = {}> = (
	state: ApplicationState,
	ownProps: OwnProps,
) => StateProps;
```

## Bonnes Pratiques

1. **Gestion de l'État**

    - Utiliser des opérations pour les changements complexes
    - Maintenir un historique cohérent
    - Gérer efficacement la persistance

2. **Performance**

    - Optimiser les sélecteurs avec mémoïsation
    - Limiter la taille de l'historique
    - Minimiser les mises à jour inutiles

3. **Maintenance**

    - Documenter les migrations d'état
    - Centraliser les types d'actions
    - Maintenir des tests de réduction

4. **Débogage**
    - Utiliser le middleware de journalisation
    - Valider les états intermédiaires
    - Maintenir des points de contrôle

## Voir aussi

-   [Architecture](./architecture.md)
-   [Performance](./performance.md)
-   [Tests](./testing.md)

## Organisation des Slices

Les slices d'état sont organisés en modules distincts, chacun gérant un aspect spécifique de l'application :

```typescript
// Structure des Slices
interface SliceStructure {
	// Composition
	composition: {
		state: CompositionState;
		selection: CompositionSelectionState;
		actions: typeof compositionActions;
		selectors: typeof compositionSelectors;
	};

	// Flow
	flow: {
		state: FlowState;
		selection: FlowSelectionState;
		actions: typeof flowActions;
		selectors: typeof flowSelectors;
	};

	// Timeline
	timeline: {
		state: TimelineState;
		selection: TimelineSelectionState;
		actions: typeof timelineActions;
		selectors: typeof timelineSelectors;
	};

	// Area
	area: {
		state: AreaReducerState;
		actions: typeof areaActions;
	};

	// Tool
	tool: {
		state: ToolState;
		actions: typeof toolActions;
	};

	// Context Menu
	contextMenu: {
		state: ContextMenuState;
		actions: typeof contextMenuActions;
	};
}
```

## Propriétés et Groupes

```typescript
// Groupes de propriétés (commencent à 5000 pour éviter les conflits avec les propriétés)
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

// Propriétés composées
enum CompoundPropertyName {
	Anchor = 1000,
	Scale = 1001,
	Position = 1002,
	ArrayModifier_Origin = 1003,
}

// Propriétés simples
enum PropertyName {
	// Propriétés de transformation
	AnchorX = 0,
	AnchorY = 1,
	Scale = 2,
	ScaleX = 24,
	ScaleY = 25,
	PositionX = 3,
	PositionY = 4,
	Rotation = 5,
	Opacity = 6,

	// Propriétés de rectangle
	Width = 7,
	Height = 8,

	// Propriétés d'apparence
	Fill = 9,
	StrokeColor = 10,
	StrokeWidth = 11,
	BorderRadius = 12,
	RGBAColor = 18,
	RGBColor = 23,

	// Propriétés d'ellipse
	OuterRadius = 13,
	InnerRadius = 14,

	// Propriétés de modificateur de tableau
	ArrayModifier_Count = 15,
	ArrayModifier_TransformBehavior = 16,
	ArrayModifier_RotationCorrection = 26,
	ArrayModifier_OriginX = 27,
	ArrayModifier_OriginY = 28,
	ArrayModifier_OriginBehavior = 29,

	// Propriétés de forme
	ShapeLayer_Path = 17,
	FillRule = 19,
	LineCap = 20,
	LineJoin = 21,
	MiterLimit = 22,
}

// Propriétés de transformation
type TransformPropertyName =
	| PropertyName.PositionX
	| PropertyName.PositionY
	| PropertyName.AnchorX
	| PropertyName.AnchorY
	| PropertyName.ScaleX
	| PropertyName.ScaleY
	| PropertyName.Rotation;

const TRANSFORM_PROPERTY_NAMES = [
	PropertyName.PositionX,
	PropertyName.PositionY,
	PropertyName.AnchorX,
	PropertyName.AnchorY,
	PropertyName.ScaleX,
	PropertyName.ScaleY,
	PropertyName.Rotation,
] as const;
```

## Système d'Annulation/Rétablissement

Le système d'annulation/rétablissement (`undoRedo.ts`) fournit une gestion avancée de l'historique des actions :

### Fonctionnalités

-   Pile d'historique bidirectionnelle
-   Fusion intelligente des actions similaires
-   Gestion de la mémoire avec limite d'historique
-   Support des actions composées

### API

```typescript
interface UndoRedoState {
	past: Action[];
	future: Action[];
	present: ApplicationState;
}

interface UndoRedoActions {
	undo: () => void;
	redo: () => void;
	canUndo: () => boolean;
	canRedo: () => boolean;
	clearHistory: () => void;
}
```

## Sauvegarde et Restauration d'État

Le système de sauvegarde (`saveState.ts`) gère la persistance de l'état de l'application :

### Fonctionnalités

-   Sauvegarde automatique périodique
-   Restauration de l'état au démarrage
-   Gestion des versions de sauvegarde
-   Validation des données sauvegardées

### API

```typescript
interface SaveStateOptions {
	autoSaveInterval?: number;
	maxSaveStates?: number;
	onSave?: (state: ApplicationState) => void;
	onRestore?: (state: ApplicationState) => void;
}

interface SaveStateManager {
	save: () => Promise<void>;
	restore: () => Promise<ApplicationState>;
	clearSaved: () => Promise<void>;
}
```

## Utilitaires d'État

Les utilitaires d'état (`stateUtils.ts`) fournissent des fonctions helper pour la manipulation d'état :

### Fonctionnalités

-   Sélecteurs optimisés avec mémoïsation
-   Fonctions de transformation d'état
-   Validateurs d'état
-   Helpers de comparaison

### API

```typescript
interface StateUtils {
	// Sélecteurs
	createSelector: <T>(selector: (state: ApplicationState) => T) => (state: ApplicationState) => T;

	// Transformations
	updateState: <K extends keyof ApplicationState>(
		state: ApplicationState,
		key: K,
		value: ApplicationState[K],
	) => ApplicationState;

	// Validation
	validateState: (state: ApplicationState) => boolean;

	// Comparaison
	areStatesEqual: (a: ApplicationState, b: ApplicationState) => boolean;
}
```

## Création d'État d'Application

Le système de création d'état (`createApplicationStateFromActionState.ts`) gère la conversion entre les différents types d'état :

### Fonctionnalités

-   Conversion d'état d'action en état d'application
-   Validation des données converties
-   Gestion des erreurs de conversion
-   Optimisation des performances

### API

```typescript
interface StateConverter {
	// Conversion principale
	createApplicationState: (actionState: ActionState) => ApplicationState;

	// Validation
	validateConversion: (actionState: ActionState, applicationState: ApplicationState) => boolean;

	// Gestion d'erreurs
	handleConversionError: (error: Error) => ApplicationState;
}
```

## Types de Base

```typescript
// Types de valeurs
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

// Types de calques
enum LayerType {
	Rect = 0,
	Ellipse = 1,
	Composition = 2,
	Shape = 3,
	Line = 4,
}
```

## Exemples Concrets d'Actions Complexes

### 1. Modification d'une Composition avec Historique

```typescript
// Action complexe pour modifier une composition
interface ModifyCompositionAction {
	type: "MODIFY_COMPOSITION";
	payload: {
		compositionId: string;
		modifications: {
			name?: string;
			dimensions?: LayerDimension;
			properties?: PropertyUpdate[];
		};
		// Métadonnées pour l'historique
		historyMetadata: {
			name: string;
			allowIndexShift: boolean;
			modifiedRelated?: boolean;
		};
	};
}

// Exemple d'utilisation dans un reducer
case "MODIFY_COMPOSITION": {
	const { compositionId, modifications } = action.payload;
	return {
		...state,
		compositions: {
			...state.compositions,
			[compositionId]: {
				...state.compositions[compositionId],
				...modifications,
			},
		},
	};
}

// Exemple d'utilisation avec le système d'historique
dispatch({
	type: "MODIFY_COMPOSITION",
	payload: {
		compositionId: "comp-1",
		modifications: {
			name: "Nouvelle Animation",
			dimensions: { width: 1920, height: 1080 },
		},
		historyMetadata: {
			name: "Renommer et redimensionner la composition",
			allowIndexShift: false,
		},
	},
});
```

### 2. Actions de Sélection avec État Lié

```typescript
// Action de sélection avec état lié
interface SelectShapeAction {
	type: "SELECT_SHAPE";
	payload: {
		shapeIds: string[];
		// Indique que cette action modifie un état lié
		modifiedRelated: true;
		// Permet le décalage d'index pour la synchronisation
		allowIndexShift: true;
	};
}

// Exemple de reducer de sélection
case "SELECT_SHAPE": {
	return {
		...state,
		selectedShapeIds: action.payload.shapeIds,
	};
}

// Utilisation avec le système d'historique
dispatch({
	type: "SELECT_SHAPE",
	payload: {
		shapeIds: ["shape-1", "shape-2"],
		modifiedRelated: true,
		allowIndexShift: true,
	},
});
```

## Cas d'Utilisation du Système d'Historique

### 1. Opérations Composées avec Points de Restauration

```typescript
// Création d'une opération composée
const operation = createOperation("Créer une animation complexe");

// Ajout d'actions multiples
operation.add({
	type: "CREATE_COMPOSITION",
	payload: {
		/* ... */
	},
});

operation.add({
	type: "ADD_LAYER",
	payload: {
		/* ... */
	},
});

// Création d'un point de restauration
operation.addDiff((prevState, currentState) => ({
	type: "RESTORE_COMPOSITION_STATE",
	payload: {
		prevState: prevState.compositionState,
		currentState: currentState.compositionState,
	},
}));

// Soumission de l'opération
operation.submit();
```

### 2. Synchronisation des États de Sélection

```typescript
// Configuration du reducer avec synchronisation
const shapeSelectionReducer = createReducerWithHistory(
	initialShapeSelectionState,
	(state, action) => {
		// ... logique du reducer
	},
	{
		// Indique quel état principal est lié à cette sélection
		selectionForKey: "shapeState",
		// Fonction de synchronisation personnalisée
		syncFn: (mainState, selectionState) => {
			// Logique de synchronisation
			return {
				...selectionState,
				// Mise à jour basée sur l'état principal
				selectedIds: selectionState.selectedIds.filter((id) => mainState.shapes[id]),
			};
		},
	},
);
```

### 3. Gestion des Performances avec Fusion d'Actions

```typescript
// Configuration de la fusion d'actions
const timelineReducer = createReducerWithHistory(initialTimelineState, timelineReducer, {
	// Règles de fusion pour optimiser l'historique
	mergeFn: (prevAction, nextAction) => {
		// Fusion des actions de déplacement consécutives
		if (prevAction.type === "MOVE_PLAYHEAD" && nextAction.type === "MOVE_PLAYHEAD") {
			return {
				type: "MOVE_PLAYHEAD",
				payload: {
					frame: nextAction.payload.frame,
				},
				metadata: {
					merged: true,
					originalActions: [prevAction, nextAction],
				},
			};
		}
		return null; // Pas de fusion
	},
});
```

## Patterns d'Optimisation

### 1. Memoization des Sélecteurs

```typescript
// Définition de sélecteurs optimisés
const selectComposition = (state: ActionState, id: string) =>
	state.compositionState.compositions[id];

const selectCompositionLayers = createSelector(
	selectComposition,
	(composition) => composition?.layers ?? [],
);

// Utilisation dans les composants
const CompositionLayers = ({ compositionId }) => {
	const layers = useSelector((state) =>
		selectCompositionLayers(getActionState(state), compositionId),
	);
	// ...
};
```

### 2. Mise à Jour Partielle de l'État

```typescript
// Exemple de mise à jour optimisée
case "UPDATE_LAYER_PROPERTY": {
	const { layerId, propertyId, value } = action.payload;
	return {
		...state,
		layers: {
			...state.layers,
			[layerId]: {
				...state.layers[layerId],
				properties: {
					...state.layers[layerId].properties,
					[propertyId]: value,
				},
			},
		},
	};
}
```

### 3. Gestion des Calculs Coûteux

```typescript
// Utilisation de useCallback pour les fonctions de rappel
const handlePropertyChange = useCallback(
	(propertyId: string, value: any) => {
		dispatch({
			type: "UPDATE_PROPERTY",
			payload: { propertyId, value },
		});
	},
	[dispatch],
);

// Mise en cache des résultats de calcul
const cachedValue = useMemo(() => {
	return expensiveCalculation(dependencies);
}, [dependencies]);
```

Ces exemples illustrent les patterns et cas d'utilisation courants du système de gestion d'état, fournissant une base solide pour la migration vers Redux Toolkit.
