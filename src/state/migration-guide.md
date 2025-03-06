# Guide de Migration vers Redux Toolkit

## Vue d'ensemble

Ce document détaille la stratégie de migration progressive des composants vers Redux Toolkit, tout en maintenant la compatibilité avec l'ancien système.

## Structure de Migration

### 1. États à Migrer

#### États avec Historique (HistoryState)
- CompositionState
- FlowState
- ProjectState
- ShapeState
- TimelineState
- États de sélection associés

#### États basés sur les Actions (ActionBasedState)
- AreaReducerState
- ContextMenuState
- ToolState

### 2. Ordre de Migration

1. **Phase 1 - États Simples (ActionBasedState)**
   - ToolState
   - ContextMenuState
   - AreaReducerState

2. **Phase 2 - États de Sélection (HistoryState)**
   - ShapeSelectionState
   - CompositionSelectionState
   - TimelineSelectionState
   - FlowSelectionState

3. **Phase 3 - États de Base (HistoryState)**
   - ProjectState
   - ShapeState
   - CompositionState

4. **Phase 4 - États Spécialisés (HistoryState)**
   - TimelineState
   - FlowState

### 3. Processus de Migration par État

Pour chaque état à migrer, suivre ces étapes :

1. **Création du Slice**
   ```typescript
   import { createSlice, PayloadAction } from "@reduxjs/toolkit";
   
   const initialState = /* état initial */;
   
   const slice = createSlice({
     name: "nomDuSlice",
     initialState,
     reducers: {
       // Définir les reducers
     }
   });
   
   export const { actions, reducer } = slice;
   ```

2. **Migration des Actions**
   - Convertir les actions typesafe-actions en actions RTK
   - Maintenir la compatibilité avec les anciennes actions

3. **Migration des Reducers**
   - Convertir les reducers en utilisant Immer
   - Maintenir la compatibilité avec les anciens reducers

4. **Tests de Migration**
   - Tester les nouvelles fonctionnalités
   - Vérifier la compatibilité avec l'ancien système

### 4. Exemple de Migration

#### Migration du ToolState

1. **Création du Slice**
   ```typescript
   import { createSlice, PayloadAction } from "@reduxjs/toolkit";
   
   const toolSlice = createSlice({
     name: "tool",
     initialState: initialToolState,
     reducers: {
       setTool: (state, action: PayloadAction<string>) => {
         state.activeTool = action.payload;
       },
       updateOptions: (state, action: PayloadAction<Record<string, any>>) => {
         state.options = { ...state.options, ...action.payload };
       }
     }
   });
   
   export const { setTool, updateOptions } = toolSlice.actions;
   export const toolReducer = toolSlice.reducer;
   ```

2. **Migration des Composants**
   ```typescript
   // Avant
   import { setTool } from "~/toolbar/toolReducer";
   
   // Après
   import { setTool } from "~/toolbar/toolSlice";
   ```

### 5. Points d'Attention

1. **Compatibilité**
   - Maintenir la compatibilité avec l'ancien système
   - Utiliser des préfixes pour les nouvelles actions
   - Gérer les conversions d'état si nécessaire

2. **Performance**
   - Surveiller les performances après chaque migration
   - Optimiser si nécessaire
   - Documenter les changements de performance

3. **Tests**
   - Tester les anciennes fonctionnalités
   - Tester les nouvelles fonctionnalités
   - Tester les interactions entre les états

### 6. Validation

Pour chaque état migré, vérifier :

1. **Fonctionnalités**
   - Toutes les fonctionnalités sont préservées
   - Les nouvelles fonctionnalités fonctionnent
   - Les interactions avec d'autres états sont correctes

2. **Performance**
   - Les performances sont acceptables
   - Pas de régressions de performance
   - Optimisations si nécessaire

3. **Tests**
   - Tous les tests passent
   - Nouveaux tests ajoutés
   - Couverture de test maintenue

### 7. Rollback

Pour chaque migration :

1. **Plan de Rollback**
   - Conserver l'ancien code
   - Documenter les étapes de rollback
   - Prévoir des points de restauration

2. **Critères de Rollback**
   - Définir quand effectuer un rollback
   - Comment effectuer un rollback
   - Comment valider le rollback 
