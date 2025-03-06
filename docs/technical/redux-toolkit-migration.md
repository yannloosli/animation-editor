# Guide de Migration vers Redux Toolkit

## Vue d'ensemble

Ce document détaille la stratégie de migration de notre système Redux actuel vers Redux Toolkit, en mettant l'accent sur la préservation des fonctionnalités existantes tout en tirant parti des avantages de Redux Toolkit.

## État Actuel

### Structure du Store

```typescript
// Structure actuelle (store.ts)
const storeInstance: Store<ApplicationState> = createStore(reducers, initialState);
```

### Types d'États

1. **États avec Historique** (HistoryState<T>)

    - CompositionState
    - FlowState
    - ProjectState
    - ShapeState
    - TimelineState
    - États de sélection associés

2. **États basés sur les Actions** (ActionBasedState<T>)
    - AreaReducerState
    - ContextMenuState
    - ToolState

## Plan de Migration

### 1. Configuration du Store

```typescript
// Nouvelle configuration avec Redux Toolkit
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
	reducer: {
		composition: compositionSlice.reducer,
		flow: flowSlice.reducer,
		project: projectSlice.reducer,
		shape: shapeSlice.reducer,
		timeline: timelineSlice.reducer,
		area: areaSlice.reducer,
		contextMenu: contextMenuSlice.reducer,
		tool: toolSlice.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Configuration pour gérer les structures non-sérialisables
				ignoredActions: ["history/RECORD_ACTION"],
				ignoredPaths: ["history.diffs"],
			},
		}),
});
```

### 2. Migration des Reducers vers des Slices

#### Exemple pour HistoryState

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const historySlice = createSlice({
	name: "history",
	initialState: {
		type: "normal",
		list: [],
		index: -1,
		indexDirection: 1,
		action: null,
	} as HistoryState<T>,
	reducers: {
		moveHistoryIndex: (state, action: PayloadAction<number>) => {
			state.index = action.payload;
		},
		startAction: (state, action: PayloadAction<string>) => {
			state.action = {
				id: action.payload,
				state: state.list[state.index]?.state || initialState,
			};
		},
		// ... autres reducers
	},
});
```

#### Exemple pour ActionBasedState

```typescript
export const areaSlice = createSlice({
	name: "area",
	initialState: initialAreaState,
	reducers: {
		updateArea: (state, action: PayloadAction<AreaUpdate>) => {
			// Immer permet la mutation directe
			Object.assign(state, action.payload);
		},
		// ... autres reducers
	},
});
```

### 3. Système d'Historique

Le système d'historique nécessite une attention particulière pour maintenir sa fonctionnalité avec Redux Toolkit :

```typescript
// Middleware d'historique personnalisé
const historyMiddleware = createListenerMiddleware();

historyMiddleware.startListening({
	predicate: (action) => action.type.includes("/submit"),
	effect: async (action, listenerApi) => {
		const state = listenerApi.getState();
		// Logique de gestion de l'historique
	},
});
```

### 4. Sélecteurs avec createSelector

```typescript
import { createSelector } from "@reduxjs/toolkit";

export const selectCompositionState = (state: RootState) => state.composition;

export const selectActiveComposition = createSelector(
	[selectCompositionState],
	(compositionState) => compositionState.list[compositionState.index]?.state,
);
```

### 5. Actions Composées avec createAsyncThunk

```typescript
export const complexOperation = createAsyncThunk(
	"operation/complex",
	async (params, { dispatch, getState }) => {
		dispatch(startAction(generateUniqueId()));
		try {
			// Séquence d'actions
			await dispatch(action1());
			await dispatch(action2());
			await dispatch(
				submitAction({
					name: "Complex Operation",
					modifiesHistory: true,
				}),
			);
		} catch (error) {
			dispatch(cancelAction());
			throw error;
		}
	},
);
```

## Points d'Attention

### 1. Gestion de l'Immer

Redux Toolkit utilise Immer pour la gestion de l'état. Points importants :

-   Les mutations directes sont autorisées dans les reducers
-   Les structures complexes doivent être gérées avec attention
-   Les objets immutables existants doivent être adaptés

### 2. Sérialisation

Configuration spéciale requise pour :

-   Les diffs d'historique
-   Les fonctions de transformation
-   Les références circulaires

### 3. Performance

Optimisations nécessaires pour :

-   La gestion de l'historique
-   Les sélecteurs mémorisés
-   Les mises à jour d'état fréquentes

### 4. Tests

Mise à jour nécessaire des tests pour :

-   Les nouveaux slices
-   Les sélecteurs
-   Les thunks
-   Le middleware d'historique

## Étapes de Migration

1. **Préparation**

    - Audit du code existant
    - Identification des dépendances
    - Création des tests de référence

2. **Migration Progressive**

    - Migration par module
    - Tests continus
    - Validation des fonctionnalités

3. **Validation**
    - Tests de performance
    - Tests d'intégration
    - Validation utilisateur

## Bonnes Pratiques

1. **Structure des Slices**

    - Un slice par domaine fonctionnel
    - Séparation des préoccupations
    - Réutilisation du code

2. **Actions**

    - Nommage cohérent
    - Payload typé
    - Documentation claire

3. **Sélecteurs**

    - Mémoisation appropriée
    - Granularité adaptée
    - Tests de performance

4. **Middleware**
    - Séparation des responsabilités
    - Gestion des effets de bord
    - Logging approprié

## Migration des Cas Spécifiques

### 1. Système de Diff

```typescript
interface DiffState {
	type: string;
	payload: any;
	operations: {
		reverse: () => void;
		apply: () => void;
	};
}

const diffSlice = createSlice({
	name: "diff",
	initialState: [] as DiffState[],
	reducers: {
		addDiff: (state, action: PayloadAction<DiffState>) => {
			state.push(action.payload);
		},
		clearDiffs: (state) => {
			state.length = 0;
		},
	},
});
```

### 2. Gestion des Sélections

```typescript
const selectionSlice = createSlice({
	name: "selection",
	initialState: {
		type: "selection",
		list: [],
		index: -1,
		indexDirection: 1,
		action: null,
	} as HistoryState<SelectionState>,
	reducers: {
		updateSelection: (state, action: PayloadAction<SelectionUpdate>) => {
			// Logique de mise à jour
		},
	},
});
```

### 3. Opérations Composées

```typescript
export const composedOperation = createAsyncThunk(
	"operation/composed",
	async (params: OperationParams, { dispatch, getState }) => {
		const operationId = generateUniqueId();
		dispatch(startOperation(operationId));

		try {
			// Séquence d'actions
			const results = await Promise.all([dispatch(action1()), dispatch(action2())]);

			dispatch(
				submitOperation({
					id: operationId,
					name: "Composed Operation",
					results,
				}),
			);

			return results;
		} catch (error) {
			dispatch(cancelOperation(operationId));
			throw error;
		}
	},
);
```

## Annexes

### A. Types Principaux

```typescript
// Types de base
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

// Hook personnalisés
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### B. Utilitaires de Migration

```typescript
// Convertisseur d'état historique
function convertHistoryState<T>(historyState: HistoryState<T>): RTKHistoryState<T> {
	// Logique de conversion
}

// Convertisseur d'actions
function convertActionToRTK(action: LegacyAction): PayloadAction<any> {
	// Logique de conversion
}
```

### C. Scripts de Migration

```typescript
// Script de validation de migration
async function validateMigration(
	oldState: ApplicationState,
	newState: RootState,
): Promise<ValidationResult> {
	// Logique de validation
}
```
