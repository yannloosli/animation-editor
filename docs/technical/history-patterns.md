# Patterns du Système d'Historique

Ce document détaille les patterns spécifiques du système d'historique qui doivent être préservés lors de la migration vers Redux Toolkit.

# Patterns d'Historique

> Ce document décrit les patterns d'implémentation du système d'historique. Pour une vue d'ensemble des flux d'actions et de leurs interactions, voir [Flux des Actions](../api/action-flows.md).

## 1. Structure de l'Historique

### État d'Historique Type

```typescript
interface HistoryState<T> {
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
```

## 2. Patterns d'Actions Historiques

### Actions Atomiques

```typescript
// Action simple avec historique
interface SimpleHistoryAction {
	type: "UPDATE_PROPERTY";
	payload: {
		propertyId: string;
		value: any;
		historyMetadata: {
			name: string;
			allowIndexShift: false;
		};
	};
}

// Exemple d'utilisation
dispatch({
	type: "UPDATE_PROPERTY",
	payload: {
		propertyId: "opacity",
		value: 0.5,
		historyMetadata: {
			name: "Modifier l'opacité",
			allowIndexShift: false,
		},
	},
});
```

### Actions Composées

```typescript
// Action composée avec historique
interface CompositeHistoryAction {
	type: "COMPOSITE_UPDATE";
	payload: {
		actions: Array<{
			type: string;
			payload: any;
		}>;
		historyMetadata: {
			name: string;
			allowIndexShift: boolean;
			modifiedRelated: boolean;
		};
	};
}

// Exemple d'utilisation
dispatch({
	type: "COMPOSITE_UPDATE",
	payload: {
		actions: [
			{
				type: "UPDATE_POSITION",
				payload: { x: 100, y: 100 },
			},
			{
				type: "UPDATE_SCALE",
				payload: { scale: 1.5 },
			},
		],
		historyMetadata: {
			name: "Transformer l'élément",
			allowIndexShift: true,
			modifiedRelated: true,
		},
	},
});
```

## 3. Synchronisation d'États Liés

### Configuration de la Synchronisation

```typescript
interface SyncConfig {
	// État principal à surveiller
	mainStateKey: keyof ApplicationState;

	// Fonction de synchronisation
	syncFn: (mainState: any, currentState: any) => any;

	// Options de synchronisation
	options: {
		// Si true, synchronise même pendant une action
		syncDuringAction: boolean;

		// Si true, permet le décalage d'index
		allowIndexShift: boolean;
	};
}

// Exemple de configuration
const selectionSyncConfig: SyncConfig = {
	mainStateKey: "shapeState",
	syncFn: (mainState, selectionState) => ({
		...selectionState,
		selectedIds: selectionState.selectedIds.filter((id) => mainState.shapes[id]),
	}),
	options: {
		syncDuringAction: false,
		allowIndexShift: true,
	},
};
```

## 4. Points de Restauration

### Création de Points de Restauration

```typescript
interface RestorePoint {
	id: string;
	state: DeepPartial<ApplicationState>;
	metadata: {
		timestamp: number;
		description: string;
		tags: string[];
	};
}

// Création d'un point de restauration
function createRestorePoint(state: ApplicationState, description: string): RestorePoint {
	return {
		id: generateUniqueId(),
		state: extractRelevantState(state),
		metadata: {
			timestamp: Date.now(),
			description,
			tags: [],
		},
	};
}

// Utilisation dans une opération
const operation = createOperation("Transformation complexe");
operation.addRestorePoint("Avant transformation");
// ... actions de transformation
operation.addRestorePoint("Après transformation");
operation.submit();
```

## 5. Fusion d'Actions

### Règles de Fusion Personnalisées

```typescript
interface MergeRule {
	// Types d'actions qui peuvent être fusionnées
	actionTypes: string[];

	// Fonction de fusion
	merge: (prev: Action, next: Action) => Action | null;

	// Conditions de fusion
	conditions: {
		// Délai maximum entre les actions (ms)
		maxDelay?: number;

		// Nombre maximum d'actions à fusionner
		maxCount?: number;

		// Fonction de validation personnalisée
		validate?: (prev: Action, next: Action) => boolean;
	};
}

// Exemple de règle de fusion
const dragMergeRule: MergeRule = {
	actionTypes: ["DRAG_START", "DRAG_UPDATE", "DRAG_END"],
	merge: (prev, next) => {
		if (prev.type === "DRAG_UPDATE" && next.type === "DRAG_UPDATE") {
			return {
				type: "DRAG_UPDATE",
				payload: {
					...next.payload,
					// Combine les deltas
					deltaX: prev.payload.deltaX + next.payload.deltaX,
					deltaY: prev.payload.deltaY + next.payload.deltaY,
				},
			};
		}
		return null;
	},
	conditions: {
		maxDelay: 100,
		maxCount: 10,
		validate: (prev, next) => prev.payload.elementId === next.payload.elementId,
	},
};
```

## 6. Gestion des Branches

### Structure de Branche

```typescript
interface HistoryBranch {
	id: string;
	name: string;
	parentBranchId: string | null;
	parentStateIndex: number;
	states: HistoryState[];
	metadata: {
		created: number;
		lastModified: number;
		description: string;
	};
}

// Création d'une nouvelle branche
function createHistoryBranch(parentState: ApplicationState, name: string): HistoryBranch {
	return {
		id: generateUniqueId(),
		name,
		parentBranchId: getCurrentBranchId(),
		parentStateIndex: getCurrentStateIndex(),
		states: [createInitialHistoryState(parentState)],
		metadata: {
			created: Date.now(),
			lastModified: Date.now(),
			description: "",
		},
	};
}
```

## 7. Optimisation de l'Historique

### Compression d'Historique

```typescript
interface CompressionOptions {
	// Seuil de compression (nombre d'états)
	threshold: number;

	// Stratégie de compression
	strategy: "merge" | "snapshot" | "selective";

	// Règles de préservation
	preserve: {
		// États à toujours conserver
		markers: string[];

		// Intervalle minimum entre les états préservés
		interval: number;
	};
}

// Fonction de compression
function compressHistory(history: HistoryState[], options: CompressionOptions): HistoryState[] {
	if (history.length < options.threshold) {
		return history;
	}

	switch (options.strategy) {
		case "merge":
			return mergeConsecutiveStates(history, options);
		case "snapshot":
			return createSnapshots(history, options);
		case "selective":
			return selectivelyPreserveStates(history, options);
		default:
			return history;
	}
}
```

## 8. Persistance de l'Historique

### Configuration de la Persistance

```typescript
interface HistoryPersistenceConfig {
	// Stratégie de stockage
	storage: "localStorage" | "indexedDB" | "custom";

	// Options de persistance
	options: {
		// Fréquence de sauvegarde automatique (ms)
		autoSaveInterval: number;

		// Nombre maximum d'états à persister
		maxPersistedStates: number;

		// Compression avant persistance
		compress: boolean;
	};

	// Hooks de persistance
	hooks: {
		beforeSave?: (state: HistoryState) => HistoryState;
		afterRestore?: (state: HistoryState) => HistoryState;
	};
}

// Gestionnaire de persistance
class HistoryPersistenceManager {
	constructor(config: HistoryPersistenceConfig) {
		this.config = config;
		this.setupAutoSave();
	}

	private setupAutoSave() {
		setInterval(() => {
			this.saveCurrentHistory();
		}, this.config.options.autoSaveInterval);
	}

	async saveCurrentHistory() {
		const history = getCurrentHistory();
		const processed = this.config.hooks.beforeSave?.(history) ?? history;

		if (this.config.options.compress) {
			await this.saveCompressed(processed);
		} else {
			await this.save(processed);
		}
	}
}
```

Ces patterns d'historique sont essentiels pour maintenir la fonctionnalité et la performance du système lors de la migration vers Redux Toolkit. Ils devront être adaptés tout en préservant leurs caractéristiques clés.
