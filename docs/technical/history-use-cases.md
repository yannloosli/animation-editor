# Cas d'Utilisation Avancés du Système d'Historique

Ce document détaille les cas d'utilisation avancés du système d'historique et comment les implémenter.

## 1. Opérations Multi-états

### Transformation Groupée d'Éléments

```typescript
// Cas d'utilisation : Transformer plusieurs formes simultanément
interface GroupTransformOperation {
	shapes: string[];
	transform: {
		translate?: Vec2;
		scale?: Vec2;
		rotate?: number;
	};
}

// Implémentation
function performGroupTransform(op: GroupTransformOperation) {
	const operation = createOperation("Transformation groupée");

	// Point de restauration initial
	operation.addRestorePoint("Avant transformation groupée");

	// Appliquer la transformation à chaque forme
	op.shapes.forEach((shapeId) => {
		operation.add({
			type: "TRANSFORM_SHAPE",
			payload: {
				shapeId,
				transform: op.transform,
				historyMetadata: {
					name: "Transformation de forme",
					allowIndexShift: true,
					modifiedRelated: true,
				},
			},
		});
	});

	// Point de restauration final
	operation.addRestorePoint("Après transformation groupée");

	// Soumettre l'opération
	operation.submit();
}
```

## 2. Synchronisation d'États Complexes

### Gestion des Dépendances Circulaires

```typescript
// Configuration de synchronisation avec dépendances circulaires
interface CircularSyncConfig {
	states: Array<{
		key: keyof ApplicationState;
		dependencies: Array<keyof ApplicationState>;
		syncFn: (state: any, deps: any[]) => any;
	}>;
}

// Exemple d'implémentation
const timelineSync: CircularSyncConfig = {
	states: [
		{
			key: "timelineState",
			dependencies: ["compositionState", "flowState"],
			syncFn: (state, [composition, flow]) => ({
				...state,
				tracks: synchronizeTracks(state.tracks, composition, flow),
			}),
		},
		{
			key: "compositionState",
			dependencies: ["timelineState"],
			syncFn: (state, [timeline]) => ({
				...state,
				duration: calculateDurationFromTimeline(timeline),
			}),
		},
	],
};

// Gestionnaire de synchronisation
class CircularSyncManager {
	private syncQueue: Set<keyof ApplicationState> = new Set();

	queueSync(stateKey: keyof ApplicationState) {
		this.syncQueue.add(stateKey);
		this.processSyncQueue();
	}

	private async processSyncQueue() {
		while (this.syncQueue.size > 0) {
			const batch = this.calculateSyncBatch();
			await this.synchronizeBatch(batch);
		}
	}
}
```

## 3. Gestion des Conflits

### Résolution de Conflits d'Édition

```typescript
interface ConflictResolution {
	type: "merge" | "override" | "branch";
	strategy: {
		// Stratégie pour les propriétés en conflit
		properties: "keep-local" | "keep-remote" | "manual";
		// Stratégie pour les transformations
		transforms: "combine" | "keep-latest";
		// Stratégie pour les dépendances
		dependencies: "update" | "preserve";
	};
}

// Gestionnaire de conflits
class ConflictManager {
	async resolveConflict(
		localState: HistoryState<any>,
		remoteState: HistoryState<any>,
		resolution: ConflictResolution,
	): Promise<HistoryState<any>> {
		switch (resolution.type) {
			case "merge":
				return this.mergeStates(localState, remoteState, resolution.strategy);
			case "override":
				return resolution.strategy.properties === "keep-local" ? localState : remoteState;
			case "branch":
				return this.createConflictBranch(localState, remoteState);
		}
	}

	private async mergeStates(
		local: HistoryState<any>,
		remote: HistoryState<any>,
		strategy: ConflictResolution["strategy"],
	) {
		// Création d'un nouvel état fusionné
		const merged = createMergedState(local, remote);

		// Application des stratégies de résolution
		if (strategy.properties === "manual") {
			await this.promptForPropertyResolution(merged);
		}

		if (strategy.transforms === "combine") {
			merged.state = combineTransforms(local.state.transforms, remote.state.transforms);
		}

		return merged;
	}
}
```

## 4. Transactions d'Historique

### Gestion des Transactions Longues

```typescript
interface HistoryTransaction {
	id: string;
	name: string;
	steps: Array<{
		action: Action;
		rollback: Action;
	}>;
	metadata: {
		startTime: number;
		timeout?: number;
		checkpoints: string[];
	};
}

// Gestionnaire de transactions
class TransactionManager {
	private activeTransactions: Map<string, HistoryTransaction> = new Map();

	beginTransaction(name: string): string {
		const id = generateUniqueId();
		const transaction: HistoryTransaction = {
			id,
			name,
			steps: [],
			metadata: {
				startTime: Date.now(),
				checkpoints: [],
			},
		};

		this.activeTransactions.set(id, transaction);
		return id;
	}

	addStep(transactionId: string, action: Action, rollback: Action) {
		const transaction = this.activeTransactions.get(transactionId);
		if (!transaction) throw new Error("Transaction not found");

		transaction.steps.push({ action, rollback });
	}

	async commitTransaction(transactionId: string) {
		const transaction = this.activeTransactions.get(transactionId);
		if (!transaction) throw new Error("Transaction not found");

		// Exécuter toutes les actions
		for (const step of transaction.steps) {
			await dispatch(step.action);
		}

		// Créer un point de restauration
		createRestorePoint(getActionState(), `Transaction: ${transaction.name}`);

		this.activeTransactions.delete(transactionId);
	}

	async rollbackTransaction(transactionId: string) {
		const transaction = this.activeTransactions.get(transactionId);
		if (!transaction) throw new Error("Transaction not found");

		// Exécuter les actions de rollback dans l'ordre inverse
		for (const step of transaction.steps.reverse()) {
			await dispatch(step.rollback);
		}

		this.activeTransactions.delete(transactionId);
	}
}
```

## 5. Historique Conditionnel

### Actions avec Préconditions

```typescript
interface ConditionalAction {
	action: Action;
	preconditions: Array<{
		check: (state: ApplicationState) => boolean;
		errorMessage: string;
	}>;
	alternatives?: Array<{
		condition: (state: ApplicationState) => boolean;
		action: Action;
	}>;
}

// Gestionnaire d'actions conditionnelles
class ConditionalActionManager {
	async dispatch(action: ConditionalAction) {
		const state = getActionState();

		// Vérifier les préconditions
		const failedPreconditions = action.preconditions
			.filter((p) => !p.check(state))
			.map((p) => p.errorMessage);

		if (failedPreconditions.length > 0) {
			// Chercher une alternative valide
			const alternative = action.alternatives?.find((alt) => alt.condition(state));

			if (alternative) {
				return dispatch(alternative.action);
			}

			throw new Error(`Préconditions non satisfaites: ${failedPreconditions.join(", ")}`);
		}

		return dispatch(action.action);
	}
}
```

## 6. Historique Différentiel

### Gestion des Différences d'État

```typescript
interface StateDiff {
	type: "add" | "remove" | "modify";
	path: string[];
	value?: any;
	previousValue?: any;
	metadata?: {
		reason: string;
		dependencies?: string[];
	};
}

// Gestionnaire de différences
class DiffManager {
	private diffs: StateDiff[] = [];

	addDiff(diff: StateDiff) {
		this.diffs.push(diff);
	}

	applyDiffs(state: ApplicationState): ApplicationState {
		return this.diffs.reduce((currentState, diff) => {
			switch (diff.type) {
				case "add":
					return setIn(currentState, diff.path, diff.value);
				case "remove":
					return removeIn(currentState, diff.path);
				case "modify":
					return setIn(currentState, diff.path, diff.value);
				default:
					return currentState;
			}
		}, state);
	}

	revertDiffs(state: ApplicationState): ApplicationState {
		return this.diffs.reverse().reduce((currentState, diff) => {
			switch (diff.type) {
				case "add":
					return removeIn(currentState, diff.path);
				case "remove":
					return setIn(currentState, diff.path, diff.previousValue);
				case "modify":
					return setIn(currentState, diff.path, diff.previousValue);
				default:
					return currentState;
			}
		}, state);
	}
}
```

Ces cas d'utilisation avancés démontrent la complexité et la flexibilité du système d'historique. Lors de la migration vers Redux Toolkit, il sera crucial de préserver ces fonctionnalités tout en les adaptant au nouveau système.

# Cas d'Usage de l'Historique

> Ce document présente les cas d'usage spécifiques du système d'historique. Pour une vue complète des flux d'actions et de leurs interactions, consultez [Flux des Actions](../api/action-flows.md).
