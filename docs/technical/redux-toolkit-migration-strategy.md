# Stratégie de Migration Progressive vers Redux Toolkit

## Vue d'ensemble

Ce document détaille l'ordre et la stratégie de migration de notre système Redux vers Redux Toolkit, en tenant compte des interdépendances entre les différents états.

## Migration depuis typesafe-actions

### État Actuel avec typesafe-actions

```typescript
// Exemple de l'état actuel avec typesafe-actions
import { createAction } from "typesafe-actions";

// Définition des actions typées
const setTool = createAction("SET_TOOL")<string>();
const updateToolOptions = createAction("UPDATE_TOOL_OPTIONS")<Record<string, any>>();

// Reducer avec typesafe-actions
const toolReducer = (state = initialState, action: ActionType) => {
	switch (action.type) {
		case setTool.type:
			return { ...state, activeTool: action.payload };
		case updateToolOptions.type:
			return { ...state, options: { ...state.options, ...action.payload } };
		default:
			return state;
	}
};
```

### Étapes de Transition

1. **Installation et Configuration**

```typescript
// 1. Désinstaller typesafe-actions
npm remove typesafe-actions

// 2. Installer Redux Toolkit
npm install @reduxjs/toolkit

// 3. Mettre à jour tsconfig.json si nécessaire
{
  "compilerOptions": {
    "strict": true,
    // Autres options nécessaires pour RTK
  }
}
```

2. **Migration des Types**

```typescript
// Avant (typesafe-actions)
type ActionType = ReturnType<typeof setTool | typeof updateToolOptions>;

// Après (Redux Toolkit)
import { PayloadAction } from "@reduxjs/toolkit";
type ToolAction = PayloadAction<string> | PayloadAction<Record<string, any>>;
```

3. **Conversion des Actions**

```typescript
// Avant (typesafe-actions)
const setTool = createAction("SET_TOOL")<string>();

// Après (Redux Toolkit)
const toolSlice = createSlice({
	name: "tool",
	initialState,
	reducers: {
		setTool: (state, action: PayloadAction<string>) => {
			state.activeTool = action.payload;
		},
	},
});

// Les actions sont maintenant générées automatiquement
export const { setTool } = toolSlice.actions;
```

4. **Adaptation des Reducers**

```typescript
// Avant (typesafe-actions)
const toolReducer = (state = initialState, action: ActionType) => {
	switch (action.type) {
		case setTool.type:
			return { ...state, activeTool: action.payload };
		default:
			return state;
	}
};

// Après (Redux Toolkit)
const toolSlice = createSlice({
	name: "tool",
	initialState,
	reducers: {
		setTool: (state, action: PayloadAction<string>) => {
			// Mutation directe possible grâce à Immer
			state.activeTool = action.payload;
		},
	},
});

// Le reducer est généré automatiquement
export const toolReducer = toolSlice.reducer;
```

5. **Middleware de Compatibilité**

```typescript
// Pour gérer la transition, créer un middleware qui convertit
// les anciennes actions typesafe-actions en actions RTK
const compatibilityMiddleware = (store) => (next) => (action) => {
	// Détecter les anciennes actions typesafe-actions
	if (action.type === "SET_TOOL") {
		// Convertir en nouvelle action RTK
		return next(toolSlice.actions.setTool(action.payload));
	}
	return next(action);
};
```

### Points de Migration Spécifiques

1. **Gestion des Types**

    - typesafe-actions utilise des types générés
    - RTK fournit `PayloadAction` et d'autres utilitaires de typage
    - Mettre à jour les types dans les composants qui utilisent `useDispatch`

2. **Dispatch d'Actions**

```typescript
// Avant (typesafe-actions)
dispatch(setTool("rectangle"));

// Après (Redux Toolkit)
dispatch(toolSlice.actions.setTool("rectangle"));
```

3. **Tests**

```typescript
// Avant (typesafe-actions)
expect(setTool("rectangle")).toEqual({
	type: "SET_TOOL",
	payload: "rectangle",
});

// Après (Redux Toolkit)
expect(toolSlice.actions.setTool("rectangle")).toEqual({
	type: "tool/setTool",
	payload: "rectangle",
});
```

### Validation de la Transition

Pour chaque module migré :

1. Vérifier que les types sont correctement inférés
2. Tester la rétrocompatibilité avec le middleware
3. Valider le fonctionnement des actions dans les composants
4. Confirmer que les tests passent avec les nouvelles actions

## Ordre de Migration

### 1. Première Phase - États Simples (ActionBasedState)

Ces états sont les plus simples car ils n'utilisent pas le système d'historique :

```typescript
// Ordre de migration recommandé :
1. ToolState       // État des outils de l'éditeur
2. ContextMenuState // État des menus contextuels
3. AreaReducerState // État des zones de l'interface
```

### 2. Deuxième Phase - États de Sélection (HistoryState)

Ces états dépendent uniquement de leur état parent respectif :

```typescript
// Ordre de migration recommandé :
1. ShapeSelectionState      // Sélection des formes
2. CompositionSelectionState // Sélection des compositions
3. TimelineSelectionState    // Sélection dans la timeline
4. FlowSelectionState       // Sélection dans le flow
```

### 3. Troisième Phase - États de Base (HistoryState)

Ces états forment le cœur du système :

```typescript
// Ordre de migration recommandé :
1. ProjectState      // État global du projet
2. ShapeState       // État des formes
3. CompositionState // État des compositions
```

### 4. Quatrième Phase - États Spécialisés (HistoryState)

Ces états dépendent des états précédents :

```typescript
// Ordre de migration recommandé :
1. TimelineState // État de la timeline
2. FlowState     // État du flow
```

### 5. Phase Finale

Migration du système d'historique lui-même et finalisation :

-   Système de diffs
-   Opérations composées
-   Tests d'intégration finaux

## Processus de Migration par État

Pour chaque état à migrer, suivre ce processus en 3 étapes :

### 1. Préparation

```typescript
// 1. Créer le nouveau slice
const toolSlice = createSlice({
  name: 'tool',
  initialState,
  reducers: {
    // Nouveaux reducers avec Immer
  }
});

// 2. Conserver l'ancien reducer temporairement
const oldToolReducer = /* ancien reducer */;
```

### 2. Migration Progressive

```typescript
// 3. Utiliser un reducer de transition
const toolReducer = (state, action) => {
	// Utiliser le nouveau slice pour les nouvelles actions
	if (action.type.startsWith("tool/")) {
		return toolSlice.reducer(state, action);
	}
	// Utiliser l'ancien reducer pour les actions existantes
	return oldToolReducer(state, action);
};
```

### 3. Validation

```typescript
// 4. Tests de coexistence
store.dispatch(oldAction); // Doit continuer à fonctionner
store.dispatch(toolSlice.actions.newAction()); // Nouvelles actions
```

## Exemple Détaillé : Migration du ToolState

### 1. Création du Nouveau Slice

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const toolSlice = createSlice({
	name: "tool",
	initialState: {
		activeTool: null,
		options: {},
	},
	reducers: {
		setActiveTool: (state, action: PayloadAction<string>) => {
			state.activeTool = action.payload;
		},
		updateOptions: (state, action: PayloadAction<Record<string, any>>) => {
			state.options = { ...state.options, ...action.payload };
		},
	},
});
```

### 2. Middleware de Transition

```typescript
const toolMiddleware = (store) => (next) => (action) => {
	// Conversion des anciennes actions en nouvelles
	if (action.type === "SET_TOOL") {
		return next(toolSlice.actions.setActiveTool(action.payload));
	}
	return next(action);
};
```

### 3. Configuration du Store

```typescript
const store = configureStore({
	reducer: {
		tool: toolSlice.reducer,
		// ... autres reducers existants
	},
	middleware: (getDefault) => getDefault().concat(toolMiddleware),
});
```

## Points d'Attention

### 1. Gestion des Dépendances

-   Identifier toutes les dépendances avant de commencer la migration d'un état
-   Maintenir une liste des dépendances migrées et non migrées
-   Gérer les conversions d'état si nécessaire

### 2. Tests

Pour chaque état migré :

-   Tester les anciennes fonctionnalités
-   Tester les nouvelles fonctionnalités
-   Tester les interactions avec les états non migrés

### 3. Performance

-   Surveiller les performances après chaque migration
-   Optimiser si nécessaire
-   Documenter les changements de performance

## Validation de la Migration

### 1. Critères de Validation

Pour chaque état migré, vérifier :

-   Fonctionnalités préservées
-   Performance acceptable
-   Pas de régressions
-   Tests passants

### 2. Documentation

Maintenir pour chaque état :

-   État de la migration
-   Problèmes rencontrés
-   Solutions appliquées
-   Tests effectués

## Rollback

### 1. Plan de Rollback

Pour chaque migration :

-   Conserver l'ancien code
-   Documenter les étapes de rollback
-   Prévoir des points de restauration

### 2. Critères de Rollback

Définir clairement :

-   Quand effectuer un rollback
-   Comment effectuer un rollback
-   Comment valider le rollback

## Conclusion

Cette approche progressive permet de :

1. Minimiser les risques
2. Maintenir l'application fonctionnelle
3. Valider chaque étape
4. Revenir en arrière si nécessaire

La clé du succès est de :

-   Prendre son temps
-   Tester abondamment
-   Documenter les changements
-   Valider chaque étape
