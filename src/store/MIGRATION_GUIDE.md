# Guide de Migration vers Redux Toolkit

Ce guide détaille le processus de migration des reducers existants vers des slices Redux Toolkit.

## Étapes de Migration

### 1. Migrer un Reducer Standard vers un Slice

**Avant (Reducer standard) :**

```typescript
// Ancien reducer
const initialState = {
  value: 0,
  status: 'idle',
};

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'counter/increment':
      return { ...state, value: state.value + 1 };
    case 'counter/decrement':
      return { ...state, value: state.value - 1 };
    case 'counter/incrementByAmount':
      return { ...state, value: state.value + action.payload };
    default:
      return state;
  }
}

// Actions
export const increment = () => ({ type: 'counter/increment' });
export const decrement = () => ({ type: 'counter/decrement' });
export const incrementByAmount = (amount) => ({ 
  type: 'counter/incrementByAmount', 
  payload: amount 
});
```

**Après (Slice Redux Toolkit) :**

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  status: 'idle',
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      // Redux Toolkit permet de "muter" l'état grâce à Immer
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

// Actions générées automatiquement
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Reducer
export default counterSlice.reducer;
```

### 2. Migrer un Reducer avec Historique (redux-undo)

**Avant (Reducer avec redux-undo) :**

```typescript
import undoable from 'redux-undo';

const initialState = {
  compositions: {},
  layers: {},
};

function compositionReducer(state = initialState, action) {
  switch (action.type) {
    case 'composition/addComposition':
      return {
        ...state,
        compositions: {
          ...state.compositions,
          [action.payload.id]: action.payload,
        },
      };
    // Autres cas...
    default:
      return state;
  }
}

// Configuration redux-undo
const undoableConfig = {
  limit: 50,
  filter: (action) => action.type !== 'composition/VIEW_ONLY_ACTION',
};

// Export du reducer avec historique
export default undoable(compositionReducer, undoableConfig);
```

**Après (Slice avec redux-undo) :**

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import undoable from 'redux-undo';

const initialState = {
  compositions: {},
  layers: {},
};

const compositionSlice = createSlice({
  name: 'composition',
  initialState,
  reducers: {
    addComposition: (state, action: PayloadAction<Composition>) => {
      state.compositions[action.payload.id] = action.payload;
    },
    // Autres reducers...
  },
});

// Configuration redux-undo
const undoableConfig = {
  limit: 50,
  filter: (action: any) => action.type !== 'composition/viewOnlyAction',
};

// Export des actions
export const { addComposition } = compositionSlice.actions;

// Export de l'état initial
export { initialState };

// Export du reducer avec historique
export default undoable(compositionSlice.reducer, undoableConfig);
```

### 3. Migrer un Reducer basé sur les Actions

**Avant (Reducer basé sur les actions) :**

```typescript
import { createActionBasedReducer } from '~/state/history/actionBasedReducer';

const initialState = {
  selected: 'select',
  openGroupIndex: null,
};

function toolReducer(state = initialState, action) {
  switch (action.type) {
    case 'tool/selectTool':
      return { ...state, selected: action.payload };
    case 'tool/openToolGroup':
      return { ...state, openGroupIndex: action.payload };
    default:
      return state;
  }
}

// Export du reducer avec support d'actions
export default createActionBasedReducer(initialState, toolReducer);
```

**Après (Slice avec support d'actions) :**

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createActionBasedSlice } from '~/state/history/actionBasedSlice';

const initialState = {
  selected: 'select',
  openGroupIndex: null,
};

const toolSlice = createSlice({
  name: 'tool',
  initialState,
  reducers: {
    selectTool: (state, action: PayloadAction<string>) => {
      state.selected = action.payload;
    },
    openToolGroup: (state, action: PayloadAction<number | null>) => {
      state.openGroupIndex = action.payload;
    },
  },
});

// Export des actions
export const { selectTool, openToolGroup } = toolSlice.actions;

// Export de l'état initial
export { initialState };

// Export du reducer avec support d'actions
export default createActionBasedSlice(toolSlice);
```

## Bonnes Pratiques pour la Migration

1. **Migrer un Slice à la Fois**
   - Commencez par les slices les plus simples et indépendants
   - Testez chaque slice après la migration

2. **Utiliser TypeScript**
   - Définissez des interfaces pour les états et les actions
   - Utilisez `PayloadAction<T>` pour typer les actions

3. **Organiser les Slices**
   - Regroupez les slices liés dans des dossiers
   - Créez un fichier d'index pour exporter les slices

4. **Utiliser les Extrareducers**
   - Pour réagir aux actions d'autres slices
   - Pour gérer des cas complexes

```typescript
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Reducers standard...
  },
  extraReducers: (builder) => {
    builder
      .addCase(authSlice.actions.logout, (state) => {
        // Réinitialiser l'état utilisateur lors de la déconnexion
        return initialState;
      })
      .addCase(projectSlice.actions.deleteProject, (state, action) => {
        // Mettre à jour l'état utilisateur lorsqu'un projet est supprimé
        state.projects = state.projects.filter(id => id !== action.payload);
      });
  },
});
```

5. **Utiliser les Sélecteurs**
   - Créez des sélecteurs pour accéder à l'état
   - Utilisez `createSelector` pour la mémorisation

```typescript
import { createSelector } from '@reduxjs/toolkit';

// Sélecteur simple
export const selectCompositions = (state) => state.composition.present.compositions;

// Sélecteur mémorisé
export const selectCompositionById = createSelector(
  [selectCompositions, (_, id) => id],
  (compositions, id) => compositions[id]
);
```

## Résolution des Problèmes Courants

1. **Problème d'Immuabilité**
   - Redux Toolkit utilise Immer, qui permet de "muter" l'état
   - Évitez de mélanger les approches immuables et mutables

2. **Problèmes de Typage**
   - Utilisez `PayloadAction<T>` pour typer les actions
   - Définissez des interfaces pour les états

3. **Intégration avec redux-undo**
   - Appliquez redux-undo après avoir créé le slice
   - Configurez correctement les options d'historique

4. **Middleware**
   - Utilisez `getDefaultMiddleware` pour inclure les middlewares par défaut
   - Configurez les middlewares personnalisés avec `configureStore`

```typescript
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(customMiddleware),
});
```

## Ressources Utiles

- [Documentation Redux Toolkit](https://redux-toolkit.js.org/)
- [Guide de Migration Redux](https://redux-toolkit.js.org/introduction/getting-started#purpose)
- [Documentation redux-undo](https://github.com/omnidan/redux-undo)
- [Utilisation d'Immer avec Redux](https://immerjs.github.io/immer/docs/example-setstate) 
