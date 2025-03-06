# Patterns de Performance

> Ce document détaille les patterns d'optimisation de performance. Pour comprendre comment ces patterns s'intègrent dans les flux d'actions, voir [Flux des Actions](../api/action-flows.md).

Ce document détaille les patterns de performance critiques qui doivent être préservés lors de la migration vers Redux Toolkit.

## 1. Gestion de l'Historique

### Optimisation de la Mémoire

```typescript
// Pattern actuel de nettoyage de l'historique
interface HistoryCleanupConfig {
	maxHistoryLength: number; // Limite la taille de l'historique
	mergeThreshold: number; // Seuil pour la fusion automatique
	cleanupInterval: number; // Intervalle de nettoyage
}

// Exemple de configuration
const historyConfig: HistoryCleanupConfig = {
	maxHistoryLength: 100,
	mergeThreshold: 5000,
	cleanupInterval: 60000,
};
```

### Fusion Intelligente des Actions

```typescript
// Règles de fusion pour les actions fréquentes
const actionMergeRules = {
	MOVE_LAYER: (prev: MoveLayerAction, next: MoveLayerAction) => {
		// Ne fusionne que si c'est le même calque
		if (prev.payload.layerId !== next.payload.layerId) {
			return null;
		}
		// Fusionne les transformations
		return {
			...next,
			payload: {
				...next.payload,
				transform: combineTransforms(prev.payload.transform, next.payload.transform),
			},
		};
	},
};
```

## 2. Mise à Jour Sélective des Composants

### Sélecteurs Optimisés

```typescript
// Pattern de sélecteur avec dépendances explicites
const selectLayerProperties = createSelector(
	[selectLayer, selectPropertyOverrides],
	(layer, overrides) => {
		if (!layer) return null;

		// Calcul uniquement si nécessaire
		return {
			...layer.properties,
			...overrides[layer.id],
		};
	},
);

// Utilisation avec mémoisation
const LayerProperties = memo(({ layerId }) => {
	const properties = useSelector((state) => selectLayerProperties(state, layerId));

	return <PropertyList properties={properties} />;
});
```

### Découpage des Mises à Jour

```typescript
// Pattern de mise à jour par lots
interface BatchUpdate {
	type: "BATCH_UPDATE";
	payload: {
		updates: Array<{
			id: string;
			changes: Partial<LayerProperties>;
		}>;
	};
}

// Optimisation des mises à jour multiples
const batchLayerUpdates = (updates: BatchUpdate["payload"]["updates"]) => {
	return {
		type: "BATCH_UPDATE",
		payload: { updates },
	};
};
```

## 3. Gestion des Calculs Lourds

### Cache des Calculs

```typescript
// Système de cache pour les calculs coûteux
interface CalculationCache<T> {
	value: T;
	dependencies: any[];
	timestamp: number;
}

const calculationCache = new Map<string, CalculationCache<any>>();

function getCachedCalculation<T>(
	key: string,
	calculate: () => T,
	dependencies: any[],
	maxAge: number = 5000,
): T {
	const cached = calculationCache.get(key);

	if (
		cached &&
		Date.now() - cached.timestamp < maxAge &&
		areDepencenciesEqual(cached.dependencies, dependencies)
	) {
		return cached.value;
	}

	const value = calculate();
	calculationCache.set(key, {
		value,
		dependencies,
		timestamp: Date.now(),
	});

	return value;
}
```

### Calculs Différés

```typescript
// Pattern pour les calculs différés
function useDeferredCalculation<T>(
	calculate: () => T,
	dependencies: any[],
	delay: number = 100,
): T | null {
	const [result, setResult] = useState<T | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setResult(calculate());
		}, delay);

		return () => clearTimeout(timer);
	}, dependencies);

	return result;
}
```

## 4. Optimisation des Rendus

### Découpage des Composants

```typescript
// Pattern de découpage pour éviter les re-rendus en cascade
const TimelineEditor = memo(() => {
	return (
		<div>
			<TimelineHeader />
			<TimelineTracks />
			<TimelinePlayhead />
		</div>
	);
});

const TimelineTracks = memo(() => {
	const trackIds = useSelector(selectTrackIds);

	return (
		<div>
			{trackIds.map((id) => (
				<TimelineTrack key={id} id={id} />
			))}
		</div>
	);
});
```

### Virtualisation

```typescript
// Pattern de virtualisation pour les listes longues
function useVirtualizedItems<T>(items: T[], itemHeight: number, viewportHeight: number): T[] {
	const [scrollTop, setScrollTop] = useState(0);

	const visibleCount = Math.ceil(viewportHeight / itemHeight);
	const startIndex = Math.floor(scrollTop / itemHeight);
	const endIndex = startIndex + visibleCount;

	return items.slice(startIndex, endIndex);
}
```

## 5. Gestion de la Mémoire

### Nettoyage des Ressources

```typescript
// Pattern de nettoyage des ressources inutilisées
interface ResourceManager {
	acquire: (id: string) => void;
	release: (id: string) => void;
	cleanup: () => void;
}

const createResourceManager = (): ResourceManager => {
	const resources = new Map<
		string,
		{
			refCount: number;
			lastUsed: number;
		}
	>();

	return {
		acquire: (id) => {
			const resource = resources.get(id) || { refCount: 0, lastUsed: Date.now() };
			resource.refCount++;
			resources.set(id, resource);
		},
		release: (id) => {
			const resource = resources.get(id);
			if (resource) {
				resource.refCount--;
				resource.lastUsed = Date.now();
			}
		},
		cleanup: () => {
			const now = Date.now();
			for (const [id, resource] of resources.entries()) {
				if (resource.refCount === 0 && now - resource.lastUsed > 300000) {
					resources.delete(id);
				}
			}
		},
	};
};
```

Ces patterns de performance sont essentiels pour maintenir les performances de l'application lors de la migration vers Redux Toolkit. Ils devront être adaptés tout en conservant leur fonction principale d'optimisation.
