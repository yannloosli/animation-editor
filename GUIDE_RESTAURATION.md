# Guide de restauration des fonctionnalités perdues lors de la migration

L'objectif est de restaurer toutes les fonctionnalités perdues suite à la migration vers Redux-toolkit.
Les sources originales se trouvent dans le dossier ORIGINAL.
Il faut reprendre toute la logique et toutes les actions de manière identique en les adaptant à Redux-toolkit.
C'est toujours ORIGINAL qui doit servir de guide, que ce soit sur la logique, la structure ou le style (sauf si cela amène quelque chose en contradiction avec les bonnes pratiques de RTK).

## État de progression

### Structure du store

- [x] Analyse de la structure du store original
- [x] Création de la structure de base pour Redux Toolkit
- [x] Configuration du store avec Redux Toolkit
- [x] Définition des types pour le store
- [x] Création des hooks typés pour accéder au store
- [ ] Migration complète de tous les reducers vers des slices

### Documentation

- [x] [README.md](src/store/README.md) - Vue d'ensemble de la structure du store
- [x] [MIGRATION_GUIDE.md](src/store/MIGRATION_GUIDE.md) - Guide détaillé pour la migration des reducers

### Slices créés

- [x] [actionSlice.ts](src/store/slices/actionSlice.ts) - Slice pour les actions
- [x] [compositionSlice.ts](src/store/slices/compositionSlice.ts) - Slice pour les compositions
- [x] [toolSlice.ts](src/store/slices/toolSlice.ts) - Slice pour les outils
- [ ] areaSlice.ts - Slice pour les zones
- [ ] contextMenuSlice.ts - Slice pour le menu contextuel
- [ ] flowSlice.ts - Slice pour les flux
- [ ] flowSelectionSlice.ts - Slice pour la sélection des flux
- [ ] projectSlice.ts - Slice pour les projets
- [ ] shapeSlice.ts - Slice pour les formes
- [ ] shapeSelectionSlice.ts - Slice pour la sélection des formes
- [ ] timelineSlice.ts - Slice pour la timeline
- [ ] timelineSelectionSlice.ts - Slice pour la sélection de la timeline
- [ ] timelineAreaSlice.ts - Slice pour la zone de timeline
- [ ] workspaceSlice.ts - Slice pour l'espace de travail
- [ ] penToolSlice.ts - Slice pour l'outil stylo

### Fichiers de configuration

- [x] [store.ts](src/store/store.ts) - Configuration du store
- [x] [rootReducer.ts](src/store/rootReducer.ts) - Combinaison des reducers
- [x] [initialState.ts](src/store/initialState.ts) - État initial du store
- [x] [types.ts](src/store/types.ts) - Types pour le store
- [x] [hooks.ts](src/store/hooks.ts) - Hooks typés pour accéder au store

## Prochaines étapes

1. Corriger les erreurs de typage dans la configuration du store
2. Migrer les reducers restants vers des slices Redux Toolkit
3. Mettre à jour les composants pour utiliser les hooks typés
4. Tester les fonctionnalités migrées pour s'assurer qu'elles fonctionnent comme prévu

## Problèmes connus

- Erreurs de typage dans la configuration du store (voir les erreurs de linter)
- Incompatibilité entre les types ActionState et ApplicationState
- Problèmes avec les middlewares typés

## Ressources

- [Documentation Redux Toolkit](https://redux-toolkit.js.org/)
- [Guide de Migration Redux](https://redux-toolkit.js.org/introduction/getting-started#purpose)
- [Documentation redux-undo](https://github.com/omnidan/redux-undo)
- [Utilisation d'Immer avec Redux](https://immerjs.github.io/immer/docs/example-setstate)
