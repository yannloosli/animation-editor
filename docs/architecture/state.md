# Système d'État

## Vue d'ensemble

Le système d'état gère l'état global de l'application en utilisant Redux, avec des fonctionnalités supplémentaires pour l'historique des actions, la sauvegarde et la restauration d'état.

## Structure

### 1. Store

```typescript
interface Store {
	// Configuration du store Redux
	configureStore(): EnhancedStore;

	// Middleware personnalisés
	middleware: [
		undoRedoMiddleware,
		saveStateMiddleware,
		// ...autres middleware
	];
}
```

### 2. Réducteurs

```typescript
interface Reducers {
	// Réducteurs principaux
	composition: CompositionReducer;
	workspace: WorkspaceReducer;
	project: ProjectReducer;
	timeline: TimelineReducer;
	history: HistoryReducer;
	// ...autres réducteurs
}
```

## Gestion de l'Historique

```typescript
interface UndoRedo {
	// Actions
	undo(): void;
	redo(): void;

	// État
	canUndo: boolean;
	canRedo: boolean;

	// Configuration
	maxHistoryLength: number;
}

interface HistoryState {
	past: ActionState[];
	present: ActionState;
	future: ActionState[];
}
```

## Sauvegarde d'État

```typescript
interface SaveState {
	// Sauvegarde
	saveState(state: ActionState): void;
	loadState(): ActionState;

	// Options
	autoSaveInterval: number;
	maxSavedStates: number;
}
```

## Opérations

```typescript
interface Operation {
	// Actions
	add: (...actions: Action[]) => void;
	clear: () => void;
	addDiff: (fn: DiffFactoryFn) => void;
	performDiff: (fn: DiffFactoryFn) => void;
	submit: () => void;

	// État
	state: ActionState;
}
```

## Utilitaires d'État

```typescript
interface StateUtils {
	// Création d'état
	createApplicationStateFromActionState(actionState: ActionState): ApplicationState;

	// Manipulation d'état
	getLayerState(state: ActionState, layerId: string): LayerState;
	getPropertyState(state: ActionState, propertyId: string): PropertyState;

	// Validation
	validateState(state: ActionState): boolean;
	migrateState(state: ActionState): ActionState;
}
```

## Slices Redux

```typescript
interface StateSlices {
	// Composition
	compositionSlice: {
		actions: CompositionActions;
		reducer: CompositionReducer;
	};

	// Workspace
	workspaceSlice: {
		actions: WorkspaceActions;
		reducer: WorkspaceReducer;
	};

	// Project
	projectSlice: {
		actions: ProjectActions;
		reducer: ProjectReducer;
	};

	// ...autres slices
}
```

## Middleware

```typescript
interface Middleware {
	// Undo/Redo
	undoRedoMiddleware: Middleware;

	// Sauvegarde
	saveStateMiddleware: Middleware;

	// Performance
	batchActionsMiddleware: Middleware;

	// Validation
	stateValidationMiddleware: Middleware;
}
```

## Bonnes Pratiques

1. **Performance**

    - Utiliser le batching d'actions
    - Optimiser la taille de l'historique
    - Minimiser les mises à jour d'état

2. **Maintenance**

    - Suivre les conventions Redux
    - Documenter les migrations d'état
    - Valider les états

3. **Historique**

    - Grouper les actions logiques
    - Limiter la taille de l'historique
    - Gérer les conflits de fusion

4. **Sauvegarde**
    - Implémenter la sauvegarde automatique
    - Valider les états chargés
    - Gérer les erreurs de chargement

## Voir aussi

-   [Architecture Générale](./overview.md)
-   [Système de Diff](../systems/diff.md)
-   [Gestion des Actions](../api/actions.md)
