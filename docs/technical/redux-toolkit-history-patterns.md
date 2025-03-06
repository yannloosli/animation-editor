# Patterns de Migration du Système d'Historique vers Redux Toolkit

## Vue d'ensemble

Ce document détaille les patterns spécifiques pour migrer le système d'historique complexe de l'éditeur d'animation vers Redux Toolkit, en préservant toutes les fonctionnalités existantes.

## Architecture Actuelle

Le système d'historique actuel est basé sur :

-   `HistoryState<T>` pour les états avec historique
-   Un système de diffs pour les modifications
-   Des actions composées pour les opérations complexes

## Patterns de Migration

### 1. Structure de Base avec createSlice

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface HistorySliceState<T> {
	type: "normal" | "selection";
	list: Array<{
		state: T;
		name: string;
		modifiedRelated: boolean;
		allowIndexShift: boolean;
		diffs: Diff[];
	}>;
	index: number;
	indexDirection: -1 | 1;
	action: null | {
		id: string;
		state: T;
	};
}

export const createHistorySlice = <T>(name: string, initialState: T) => {
	return createSlice({
		name,
		initialState: {
			type: "normal",
			list: [],
			index: -1,
			indexDirection: 1,
			action: null,
		} as HistorySliceState<T>,
		reducers: {
			moveHistoryIndex(state, action: PayloadAction<number>) {
				state.index = action.payload;
				state.indexDirection = action.payload > state.index ? 1 : -1;
			},

			startHistoryAction(state, action: PayloadAction<string>) {
				state.action = {
					id: action.payload,
					state: state.list[state.index]?.state || initialState,
				};
			},

			submitHistoryAction(
				state,
				action: PayloadAction<{
					name: string;
					modifiedRelated: boolean;
					allowIndexShift: boolean;
					diffs: Diff[];
				}>,
			) {
				const { name, modifiedRelated, allowIndexShift, diffs } = action.payload;

				if (state.action) {
					state.list.splice(state.index + 1);
					state.list.push({
						state: state.action.state,
						name,
						modifiedRelated,
						allowIndexShift,
						diffs,
					});
					state.index++;
					state.action = null;
				}
			},

			cancelHistoryAction(state) {
				state.action = null;
			},
		},
	});
};
```

### 2. Middleware pour la Gestion des Diffs

```typescript
import { createListenerMiddleware } from "@reduxjs/toolkit";

export const createHistoryMiddleware = () => {
	const middleware = createListenerMiddleware();

	// Écoute des actions de soumission
	middleware.startListening({
		predicate: (action) => action.type.endsWith("/submitHistoryAction"),
		effect: async (action, listenerApi) => {
			const state = listenerApi.getState();
			// Génération et application des diffs
			const diffs = generateDiffs(state);

			// Mise à jour de l'historique avec les diffs
			listenerApi.dispatch({
				type: `${action.type}/withDiffs`,
				payload: {
					...action.payload,
					diffs,
				},
			});
		},
	});

	return middleware;
};
```

### 3. Hooks Personnalisés pour l'Historique

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const createHistoryHooks = <T>(sliceName: string) => {
	const useHistoryState: TypedUseSelectorHook<HistorySliceState<T>> = (selector) =>
		useSelector((state) => selector(state[sliceName]));

	const useHistoryActions = () => {
		const dispatch = useDispatch();

		return {
			undo: () => {
				const state = useHistoryState((s) => s);
				if (state.index > 0) {
					dispatch(moveHistoryIndex(state.index - 1));
				}
			},

			redo: () => {
				const state = useHistoryState((s) => s);
				if (state.index < state.list.length - 1) {
					dispatch(moveHistoryIndex(state.index + 1));
				}
			},

			startAction: (id: string) => {
				dispatch(startHistoryAction(id));
			},

			submitAction: (params: SubmitActionParams) => {
				dispatch(submitHistoryAction(params));
			},

			cancelAction: () => {
				dispatch(cancelHistoryAction());
			},
		};
	};

	return {
		useHistoryState,
		useHistoryActions,
	};
};
```

### 4. Gestion des Opérations Composées

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createHistoryOperation = <T>(
	operationName: string,
	operationFn: (params: T) => Promise<void>,
) => {
	return createAsyncThunk(
		`history/${operationName}`,
		async (params: T, { dispatch, getState }) => {
			const operationId = generateUniqueId();

			dispatch(startHistoryAction(operationId));

			try {
				await operationFn(params);

				dispatch(
					submitHistoryAction({
						name: operationName,
						modifiedRelated: true,
						allowIndexShift: true,
						diffs: [],
					}),
				);

				return true;
			} catch (error) {
				dispatch(cancelHistoryAction());
				throw error;
			}
		},
	);
};
```

### 5. Sélecteurs Optimisés

```typescript
import { createSelector } from "@reduxjs/toolkit";

export const createHistorySelectors = <T>(selectSlice: (state: any) => HistorySliceState<T>) => {
	const selectCurrentState = createSelector(
		[selectSlice],
		(historyState) =>
			historyState.action?.state || historyState.list[historyState.index]?.state,
	);

	const selectCanUndo = createSelector([selectSlice], (historyState) => historyState.index > 0);

	const selectCanRedo = createSelector(
		[selectSlice],
		(historyState) => historyState.index < historyState.list.length - 1,
	);

	const selectCurrentDiffs = createSelector(
		[selectSlice],
		(historyState) => historyState.list[historyState.index]?.diffs || [],
	);

	return {
		selectCurrentState,
		selectCanUndo,
		selectCanRedo,
		selectCurrentDiffs,
	};
};
```

## Exemples d'Utilisation

### 1. Création d'un Slice avec Historique

```typescript
// shapeHistorySlice.ts
const shapeHistorySlice = createHistorySlice<ShapeState>("shapeHistory", initialShapeState);

// Hooks personnalisés pour les formes
const { useHistoryState: useShapeHistoryState, useHistoryActions: useShapeHistoryActions } =
	createHistoryHooks<ShapeState>("shapeHistory");

// Sélecteurs pour les formes
const {
	selectCurrentState: selectCurrentShapeState,
	selectCanUndo: selectCanUndoShape,
	selectCanRedo: selectCanRedoShape,
} = createHistorySelectors<ShapeState>((state) => state.shapeHistory);
```

### 2. Utilisation dans les Composants

```typescript
const ShapeEditor = () => {
  const shapeState = useShapeHistoryState(selectCurrentShapeState);
  const { startAction, submitAction } = useShapeHistoryActions();

  const handleShapeUpdate = (update: ShapeUpdate) => {
    const actionId = generateUniqueId();
    startAction(actionId);

    // Mise à jour de la forme
    // ...

    submitAction({
      name: 'Update Shape',
      modifiedRelated: false,
      allowIndexShift: true,
      diffs: [],
    });
  };

  return (
    // JSX du composant
  );
};
```

### 3. Opérations Composées

```typescript
const complexShapeOperation = createHistoryOperation(
	"complexShapeOperation",
	async (params: ComplexOperationParams) => {
		// Séquence d'opérations
		await updateShape(params.shapeId);
		await updateProperties(params.properties);
		await updateTransform(params.transform);
	},
);
```

## Considérations de Performance

### 1. Optimisation des Diffs

```typescript
const optimizeDiffs = (diffs: Diff[]): Diff[] => {
	return diffs.reduce((acc, diff) => {
		// Logique d'optimisation des diffs
		return acc;
	}, [] as Diff[]);
};
```

### 2. Mémoisation des Sélecteurs

```typescript
const memoizedHistorySelector = createSelector(
	[selectHistoryState, selectDependentState],
	(historyState, dependentState) => {
		// Logique de sélection complexe
		return computedValue;
	},
);
```

### 3. Gestion de la Mémoire

```typescript
const historySlice = createSlice({
	name: "history",
	initialState,
	reducers: {
		pruneHistory: (state) => {
			// Limiter la taille de l'historique
			if (state.list.length > MAX_HISTORY_LENGTH) {
				state.list = state.list.slice(-MAX_HISTORY_LENGTH);
				state.index = Math.min(state.index, state.list.length - 1);
			}
		},
	},
});
```

## Tests

### 1. Tests des Reducers

```typescript
describe("historySlice", () => {
	it("should handle moveHistoryIndex", () => {
		const initialState = createInitialState();
		const nextState = historySlice.reducer(initialState, moveHistoryIndex(1));
		expect(nextState.index).toBe(1);
	});
});
```

### 2. Tests des Middleware

```typescript
describe("historyMiddleware", () => {
	it("should handle diff generation", async () => {
		const middleware = createHistoryMiddleware();
		// Tests du middleware
	});
});
```

### 3. Tests d'Intégration

```typescript
describe("history integration", () => {
	it("should handle complex operations", async () => {
		const store = configureStore({
			reducer: {
				history: historySlice.reducer,
			},
			middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(historyMiddleware),
		});

		// Tests d'intégration
	});
});
```
