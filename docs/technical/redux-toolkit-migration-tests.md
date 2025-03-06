# Tests de Migration vers Redux Toolkit

## Vue d'ensemble

Ce document détaille la stratégie de test pour assurer une migration sûre et fiable vers Redux Toolkit. Il couvre les différents types de tests nécessaires et fournit des exemples concrets.

## Types de Tests

### 1. Tests Unitaires

#### Tests des Slices

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { shapeHistorySlice } from "./shapeHistorySlice";

describe("Shape History Slice", () => {
	let store;

	beforeEach(() => {
		store = configureStore({
			reducer: {
				shapeHistory: shapeHistorySlice.reducer,
			},
		});
	});

	test("should handle initial state", () => {
		const state = store.getState().shapeHistory;
		expect(state).toEqual({
			type: "normal",
			list: [],
			index: -1,
			indexDirection: 1,
			action: null,
		});
	});

	test("should handle moveHistoryIndex", () => {
		store.dispatch(shapeHistorySlice.actions.moveHistoryIndex(1));
		const state = store.getState().shapeHistory;
		expect(state.index).toBe(1);
		expect(state.indexDirection).toBe(1);
	});

	test("should handle startHistoryAction", () => {
		const actionId = "test-action";
		store.dispatch(shapeHistorySlice.actions.startHistoryAction(actionId));
		const state = store.getState().shapeHistory;
		expect(state.action).toEqual({
			id: actionId,
			state: expect.any(Object),
		});
	});
});
```

#### Tests des Sélecteurs

```typescript
import { selectCurrentShapeState, selectCanUndo } from "./shapeSelectors";

describe("Shape Selectors", () => {
	const mockState = {
		shapeHistory: {
			list: [
				{ state: { id: 1 }, name: "Initial" },
				{ state: { id: 2 }, name: "Updated" },
			],
			index: 1,
			// ... autres propriétés
		},
	};

	test("selectCurrentShapeState returns current state", () => {
		const result = selectCurrentShapeState(mockState);
		expect(result).toEqual({ id: 2 });
	});

	test("selectCanUndo returns correct value", () => {
		const result = selectCanUndo(mockState);
		expect(result).toBe(true);
	});
});
```

### 2. Tests d'Intégration

#### Tests des Opérations Composées

```typescript
describe("Complex Shape Operations", () => {
	let store;

	beforeEach(() => {
		store = configureStore({
			reducer: {
				shapeHistory: shapeHistorySlice.reducer,
				properties: propertiesSlice.reducer,
			},
			middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(historyMiddleware),
		});
	});

	test("should handle complex shape update", async () => {
		const operation = createHistoryOperation("updateShapeWithProperties", async (params) => {
			await updateShape(params.shape);
			await updateProperties(params.properties);
		});

		await store.dispatch(
			operation({
				shape: { id: 1, type: "rectangle" },
				properties: { width: 100, height: 100 },
			}),
		);

		const state = store.getState();
		expect(state.shapeHistory.list).toHaveLength(1);
		expect(state.properties).toMatchObject({
			width: 100,
			height: 100,
		});
	});
});
```

#### Tests du Système d'Historique

```typescript
describe("History System Integration", () => {
	test("should handle undo/redo sequence", () => {
		const store = configureStore({
			reducer: {
				shapeHistory: shapeHistorySlice.reducer,
			},
		});

		// Action 1
		store.dispatch(shapeHistorySlice.actions.startHistoryAction("action1"));
		store.dispatch(
			shapeHistorySlice.actions.submitHistoryAction({
				name: "First Update",
				state: { id: 1 },
				diffs: [],
			}),
		);

		// Action 2
		store.dispatch(shapeHistorySlice.actions.startHistoryAction("action2"));
		store.dispatch(
			shapeHistorySlice.actions.submitHistoryAction({
				name: "Second Update",
				state: { id: 2 },
				diffs: [],
			}),
		);

		// Undo
		store.dispatch(shapeHistorySlice.actions.moveHistoryIndex(0));
		expect(selectCurrentShapeState(store.getState())).toEqual({ id: 1 });

		// Redo
		store.dispatch(shapeHistorySlice.actions.moveHistoryIndex(1));
		expect(selectCurrentShapeState(store.getState())).toEqual({ id: 2 });
	});
});
```

### 3. Tests de Migration

#### Tests de Conversion d'État

```typescript
describe("State Migration", () => {
	test("should convert legacy state to RTK state", () => {
		const legacyState = {
			// Ancien format d'état
			shapeState: {
				type: "normal",
				list: [
					/* ... */
				],
				index: 0,
			},
		};

		const convertedState = convertLegacyState(legacyState);
		expect(convertedState).toMatchObject({
			shapeHistory: {
				// Nouveau format d'état
				type: "normal",
				list: expect.any(Array),
				index: 0,
			},
		});
	});
});
```

#### Tests de Compatibilité des Actions

```typescript
describe("Action Compatibility", () => {
	test("should handle legacy actions", () => {
		const store = configureStore({
			reducer: {
				shapeHistory: shapeHistorySlice.reducer,
			},
			middleware: (getDefaultMiddleware) =>
				getDefaultMiddleware().concat(legacyActionMiddleware),
		});

		// Dispatch d'une ancienne action
		store.dispatch({
			type: "LEGACY_UPDATE_SHAPE",
			payload: {
				/* ... */
			},
		});

		const state = store.getState();
		// Vérifier que l'état a été mis à jour correctement
	});
});
```

### 4. Tests de Performance

```typescript
describe("Performance Tests", () => {
	test("should handle large history efficiently", async () => {
		const store = configureStore({
			reducer: {
				shapeHistory: shapeHistorySlice.reducer,
			},
		});

		const startTime = performance.now();

		// Générer beaucoup d'actions
		for (let i = 0; i < 1000; i++) {
			store.dispatch(shapeHistorySlice.actions.startHistoryAction(`action${i}`));
			store.dispatch(
				shapeHistorySlice.actions.submitHistoryAction({
					name: `Update ${i}`,
					state: { id: i },
					diffs: [],
				}),
			);
		}

		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(duration).toBeLessThan(1000); // moins d'une seconde
		expect(store.getState().shapeHistory.list).toHaveLength(1000);
	});

	test("should optimize memory usage", () => {
		const store = configureStore({
			reducer: {
				shapeHistory: shapeHistorySlice.reducer,
			},
		});

		const getMemoryUsage = () => process.memoryUsage().heapUsed;
		const initialMemory = getMemoryUsage();

		// Générer beaucoup d'actions
		for (let i = 0; i < 1000; i++) {
			store.dispatch(shapeHistorySlice.actions.startHistoryAction(`action${i}`));
			store.dispatch(
				shapeHistorySlice.actions.submitHistoryAction({
					name: `Update ${i}`,
					state: { id: i },
					diffs: [],
				}),
			);
		}

		const finalMemory = getMemoryUsage();
		const memoryIncrease = finalMemory - initialMemory;

		expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // moins de 50MB
	});
});
```

## Outils de Test

### 1. Utilitaires de Test

```typescript
export const createTestStore = (initialState = {}) => {
	return configureStore({
		reducer: {
			shapeHistory: shapeHistorySlice.reducer,
			// ... autres reducers
		},
		preloadedState: initialState,
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(historyMiddleware),
	});
};

export const createMockState = (overrides = {}) => {
	return {
		shapeHistory: {
			type: "normal",
			list: [],
			index: -1,
			indexDirection: 1,
			action: null,
			...overrides,
		},
	};
};
```

### 2. Mocks pour les Effets de Bord

```typescript
export const mockHistoryEffects = {
	generateDiffs: jest.fn(),
	applyDiffs: jest.fn(),
	revertDiffs: jest.fn(),
};

export const mockMiddleware = () => (next) => (action) => {
	if (action.type.includes("history")) {
		// Simuler les effets de bord
		mockHistoryEffects.generateDiffs();
	}
	return next(action);
};
```

## Validation de la Migration

### 1. Liste de Contrôle

```typescript
describe('Migration Validation', () => {
  const validationChecklist = [
    'État initial correct',
    'Actions de base fonctionnelles',
    'Système d'historique opérationnel',
    'Performance acceptable',
    'Mémoire optimisée',
  ];

  validationChecklist.forEach(item => {
    test(`should validate: ${item}`, () => {
      // Tests spécifiques pour chaque point
    });
  });
});
```

### 2. Tests de Régression

```typescript
describe("Regression Tests", () => {
	const legacyOperations = [
		"CREATE_SHAPE",
		"UPDATE_SHAPE",
		"DELETE_SHAPE",
		// ... autres opérations
	];

	legacyOperations.forEach((operation) => {
		test(`should maintain ${operation} functionality`, () => {
			// Comparer ancien et nouveau comportement
		});
	});
});
```
