# Éditeur d'Historique

## Vue d'ensemble

L'éditeur d'historique permet de visualiser et gérer l'historique des modifications apportées à l'animation. Il s'intègre étroitement avec le système de Diff pour permettre l'annulation/rétablissement des actions.

## Structure

```typescript
interface HistoryState {
	// État général
	actions: HistoryAction[];
	currentIndex: number;
	maxActions: number;

	// Filtres
	filters: {
		types: Set<DiffType>;
		timeRange: [number, number];
	};

	// Groupement
	groupingEnabled: boolean;
	groupThreshold: number; // ms
}
```

## Types d'Actions

```typescript
interface HistoryAction {
	// Métadonnées
	id: string;
	timestamp: number;
	type: DiffType;
	description: string;

	// Contenu
	diff: Diff;
	preview?: PreviewData;

	// Groupement
	groupId?: string;
	isGroupStart?: boolean;
	isGroupEnd?: boolean;
}

interface ActionGroup {
	id: string;
	actions: HistoryAction[];
	startTime: number;
	endTime: number;
	description: string;
}
```

## Interface Utilisateur

### 1. Liste des Actions

```typescript
interface ActionList {
	// Affichage
	renderAction(action: HistoryAction): JSX.Element;
	renderGroup(group: ActionGroup): JSX.Element;

	// Interaction
	onActionClick(actionId: string): void;
	onActionHover(actionId: string): void;

	// Virtualisation
	getVisibleActions(): HistoryAction[];
	recycleActionComponents(): void;
}
```

### 2. Filtres et Recherche

```typescript
interface HistoryFilters {
	// Filtres
	setTypeFilter(types: DiffType[]): void;
	setTimeRange(range: [number, number]): void;

	// Recherche
	searchActions(query: string): void;
	highlightMatches(text: string, query: string): JSX.Element;
}
```

## Fonctionnalités

### 1. Navigation

```typescript
interface HistoryNavigation {
	// Navigation de base
	goToAction(actionId: string): void;
	goToIndex(index: number): void;

	// Navigation relative
	goBack(steps: number): void;
	goForward(steps: number): void;

	// Points de sauvegarde
	createCheckpoint(name: string): void;
	restoreCheckpoint(id: string): void;
}
```

### 2. Groupement

```typescript
interface ActionGrouping {
	// Configuration
	setGroupingEnabled(enabled: boolean): void;
	setGroupThreshold(threshold: number): void;

	// Opérations
	groupActions(actions: HistoryAction[]): ActionGroup;
	ungroupActions(groupId: string): HistoryAction[];

	// Gestion manuelle
	startGroup(name: string): void;
	endGroup(): void;
}
```

## Intégration

### 1. Avec le Système de Diff

```typescript
interface HistoryDiffIntegration {
	// Enregistrement
	recordAction(diff: Diff): void;
	createActionPreview(diff: Diff): PreviewData;

	// Application
	applyAction(action: HistoryAction): void;
	revertAction(action: HistoryAction): void;
}
```

### 2. Avec le Workspace

```typescript
interface HistoryWorkspaceIntegration {
	// Prévisualisation
	previewActionInWorkspace(actionId: string): void;
	clearPreview(): void;

	// Synchronisation
	syncWorkspaceState(): void;
	updateWorkspaceFromHistory(): void;
}
```

## Performance

```typescript
interface HistoryOptimizations {
	// Gestion de la mémoire
	pruneOldActions(): void;
	compressHistory(): void;

	// Cache
	cacheActionPreviews(): void;
	invalidateCache(): void;

	// Virtualisation
	virtualizeActionList(): void;
	recycleComponents(): void;
}
```

## Raccourcis Clavier

```typescript
const HISTORY_SHORTCUTS = {
	UNDO: "Ctrl+Z",
	REDO: "Ctrl+Shift+Z",
	UNDO_GROUP: "Ctrl+Alt+Z",
	REDO_GROUP: "Ctrl+Alt+Shift+Z",
	CREATE_CHECKPOINT: "Ctrl+Alt+S",
};
```

## Bonnes Pratiques

1. **Organisation**

    - Grouper les actions logiquement
    - Maintenir des descriptions claires
    - Limiter la taille de l'historique

2. **Performance**

    - Optimiser les prévisualisations
    - Utiliser la virtualisation
    - Gérer efficacement la mémoire

3. **Interface Utilisateur**

    - Fournir des retours visuels
    - Faciliter la navigation
    - Maintenir une interface réactive

4. **Intégration**
    - Synchroniser avec le workspace
    - Gérer les conflits
    - Maintenir la cohérence

## Voir aussi

-   [Système de Diff](../systems/diff.md)
-   [Workspace](./workspace.md)
-   [Système des Areas](./areas.md)
-   [Menus Contextuels](./context-menus.md)
