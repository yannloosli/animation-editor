# Migration vers Redux Toolkit

Ce dossier contient la nouvelle structure du store utilisant Redux Toolkit, qui remplace l'ancienne implémentation Redux.

## Structure du Store

La structure du store est organisée comme suit :

```
store/
├── hooks.ts              # Hooks typés pour useSelector et useDispatch
├── initialState.ts       # État initial du store
├── rootReducer.ts        # Combinaison de tous les reducers
├── store.ts              # Configuration du store avec Redux Toolkit
├── types.ts              # Types pour le store
└── slices/               # Slices Redux Toolkit
    ├── actionSlice.ts    # Slice pour les actions
    ├── compositionSlice.ts # Slice pour les compositions
    ├── toolSlice.ts      # Slice pour les outils
    └── ...               # Autres slices
```

## Types d'États

Le store contient deux types principaux d'états :

1. **États avec Historique** (utilisant redux-undo)
   - CompositionState
   - CompositionSelectionState
   - FlowState
   - FlowSelectionState
   - ProjectState
   - ShapeState
   - ShapeSelectionState
   - TimelineState
   - TimelineSelectionState

2. **États basés sur les Actions**
   - AreaState
   - ContextMenuState
   - ToolState
   - WorkspaceState
   - TimelineAreaState
   - PenToolState

## Utilisation des Hooks

Pour accéder au store, utilisez les hooks typés :

```typescript
import { useAppDispatch, useAppSelector } from '~/store/hooks';

// Dans un composant
const Component = () => {
  const dispatch = useAppDispatch();
  const someState = useAppSelector(state => state.someSlice);
  
  // Utilisation
  const handleClick = () => {
    dispatch(someAction());
  };
  
  return <div>{/* ... */}</div>;
};
```

Pour les états avec historique, utilisez les hooks spécifiques :

```typescript
import { useCompositionState } from '~/store/hooks';

// Dans un composant
const Component = () => {
  const composition = useCompositionState(state => state.compositions['default']);
  
  return <div>{composition.name}</div>;
};
```

## Migration depuis l'Ancienne Structure

La migration depuis l'ancienne structure Redux vers Redux Toolkit implique :

1. **Remplacement des Reducers par des Slices**
   - Utilisation de `createSlice` pour définir les reducers et les actions
   - Utilisation d'Immer pour les mises à jour d'état immuables

2. **Configuration du Store avec configureStore**
   - Remplacement de `createStore` par `configureStore`
   - Configuration des middlewares

3. **Intégration avec redux-undo**
   - Utilisation de redux-undo pour les états avec historique
   - Configuration des options d'historique

4. **Hooks Typés**
   - Utilisation de hooks typés pour useSelector et useDispatch
   - Création de hooks spécifiques pour accéder aux différentes parties de l'état

## Bonnes Pratiques

- Utilisez les hooks typés pour accéder au store
- Préférez les sélecteurs mémorisés pour les calculs coûteux
- Utilisez les actions générées par createSlice
- Évitez de modifier l'état directement (Redux Toolkit utilise Immer en interne)
- Utilisez les extraReducers pour réagir aux actions d'autres slices 
