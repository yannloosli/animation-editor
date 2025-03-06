# Système de Listeners

## Vue d'ensemble

Le système de listeners gère les interactions utilisateur et les événements système dans l'éditeur d'animation. Il fournit une architecture unifiée pour la gestion des événements, les raccourcis clavier et les actions utilisateur.

## Structure des Fichiers

```typescript
interface ListenerSystem {
	// Gestion des Listeners
	addListener: typeof addListener;
	registerListener: typeof registerListener;
	requestAction: typeof requestAction;

	// Gestion du Clavier
	keyboard: typeof keyboard;

	// Gestion des Différences
	diffListener: typeof diffListener;
}
```

## Gestion des Actions

```typescript
interface RequestActionParams {
	// Dispatch d'actions
	dispatch: (action: Action | Action[], ...otherActions: Action[]) => void;
	dispatchToAreaState: (areaId: string, action: Action) => void;

	// Gestion des actions
	cancelAction: () => void;
	submitAction: (name?: string, options?: Partial<SubmitOptions>) => void;
	done: () => boolean;

	// Gestion des listeners
	addListener: typeof addListener;
	removeListener: typeof removeListener;
	execOnComplete: (callback: () => void) => void;

	// Gestion des différences
	addDiff: (fn: DiffFactoryFn, options?: { perform: boolean }) => void;
	performDiff: (fn: DiffFactoryFn) => void;
	addReverseDiff: (fn: DiffFactoryFn) => void;
}

interface RequestActionOptions {
	history?: boolean;
	shouldAddToStack?: ShouldAddToStackFn | ShouldAddToStackFn[];
	beforeSubmit?: (params: RequestActionParams) => void;
}

interface SubmitOptions {
	allowIndexShift: boolean;
	shouldAddToStack?: ShouldAddToStackFn;
}

type ShouldAddToStackFn = (prevState: ActionState, nextState: ActionState) => boolean;
```

## Gestion du Clavier

```typescript
interface KeyboardSystem {
	// État du clavier
	keyDownMap: Map<string, boolean>;

	// Gestionnaires
	onKeyDown: (e: KeyboardEvent) => void;
	onKeyUp: (e: KeyboardEvent) => void;
	isKeyDown: (key: string) => boolean;

	// Utilitaires
	getModifierKeys: () => {
		command: boolean;
		shift: boolean;
		alt: boolean;
	};

	// Raccourcis clavier
	shortcuts: Map<
		string,
		{
			action: () => void;
			condition?: () => boolean;
		}
	>;
}
```

## Enregistrement des Listeners

```typescript
interface ListenerRegistration {
	// Enregistrement simple
	addListener: <T extends keyof HTMLElementEventMap>(
		element: HTMLElement,
		type: T,
		handler: (e: HTMLElementEventMap[T]) => void,
		options?: AddEventListenerOptions,
	) => () => void;

	// Enregistrement avec contexte
	registerListener: <T extends keyof HTMLElementEventMap>(
		element: HTMLElement,
		type: T,
		handler: (e: HTMLElementEventMap[T]) => void,
		context: string,
		options?: RegisterListenerOptions,
	) => void;
}

interface RegisterListenerOptions extends AddEventListenerOptions {
	// Options supplémentaires
	priority?: number;
	condition?: () => boolean;
	transform?: (e: Event) => Event;
}
```

## Listeners de Différences

```typescript
interface DiffListener {
	// Écoute des différences
	addDiffListener: (callback: (diffs: Diff[]) => void) => () => void;

	// Filtrage des différences
	filterDiffs: (diffs: Diff[], filter: (diff: Diff) => boolean) => Diff[];

	// Utilitaires
	getDiffsByType: <T extends Diff>(diffs: Diff[], type: T["type"]) => T[];
	getDiffsByComposition: (diffs: Diff[], compositionId: string) => Diff[];
}
```

## Utilisation

### Actions Utilisateur

```typescript
// Demande d'action
requestAction(
	{
		mousePosition,
		keyDownMap,
		modifierKeys: {
			command: false,
			shift: true,
			alt: false,
		},
		areaId: "workspace-1",
	},
	(op) => {
		// Effectuer l'opération
		op.add(/* actions */);
		op.submit();
	},
);
```

### Gestion du Clavier

```typescript
// Enregistrement d'un listener clavier
registerListener(
	window,
	"keydown",
	(e) => {
		if (e.key === "Space") {
			togglePlayback();
		}
	},
	"playback-controls",
);
```

### Écoute des Différences

```typescript
// Écoute des changements de propriétés
const unsubscribe = addDiffListener((diffs) => {
	const propertyDiffs = filterDiffs(diffs, (diff) => diff.type === "property");
	// Traiter les différences
});
```

## Bonnes Pratiques

1. **Gestion des Événements**

    - Utiliser le système de priorité
    - Gérer proprement les annulations
    - Éviter les conflits de raccourcis

2. **Performance**

    - Optimiser les handlers d'événements
    - Utiliser la délégation d'événements
    - Nettoyer les listeners inutilisés

3. **Maintenance**

    - Documenter les raccourcis clavier
    - Centraliser les gestionnaires
    - Suivre les conventions de nommage

4. **Tests**
    - Tester les cas d'utilisation
    - Vérifier les conflits
    - Simuler les événements

## Voir aussi

-   [Gestion d'État](./state.md)
-   [Système de Différences](./diff.md)
-   [Interface Utilisateur](../ui/interface.md)
