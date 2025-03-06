# Actions d'Historique

> Pour une compréhension détaillée des flux d'actions et de leurs interactions avec le système d'historique, consultez [Flux des Actions](./action-flows.md).

## Vue d'ensemble

Les actions d'historique gèrent le système d'annulation/rétablissement et la gestion des modifications dans l'éditeur d'animation. Ce système permet de suivre, annuler et rétablir les modifications apportées à l'état de l'application.

## Actions Disponibles

### Navigation dans l'Historique

#### moveHistoryIndex

```typescript
moveHistoryIndex: (index: number) => Action;
```

Déplace l'index de l'historique à une position spécifique, permettant de naviguer dans l'historique des modifications.

### Gestion des Actions

#### startAction

```typescript
startAction: (actionId: string) => Action;
```

Commence une nouvelle action dans l'historique. Cette action est utilisée pour marquer le début d'une séquence de modifications.

#### dispatchToAction

```typescript
dispatchToAction: (actionId: string, actionToDispatch: any, modifiesHistory: boolean) => Action;
```

Dispatch une action spécifique dans le contexte d'une action en cours. Le paramètre `modifiesHistory` détermine si l'action doit être enregistrée dans l'historique.

#### dispatchBatchToAction

```typescript
dispatchBatchToAction: (actionId: string, actionBatch: any[], modifiesHistory: boolean) => Action;
```

Dispatch un lot d'actions dans le contexte d'une action en cours. Utile pour les opérations qui nécessitent plusieurs modifications.

#### submitAction

```typescript
submitAction: (
	actionId: string,
	name: string,
	modifiesHistory: boolean,
	modifiedKeys: string[],
	allowIndexShift: boolean,
	diffs: Diff[],
) => Action;
```

Finalise une action en cours et l'ajoute à l'historique. Les paramètres permettent de configurer comment l'action est enregistrée et gérée.

#### cancelAction

```typescript
cancelAction: (actionId: string) => Action;
```

Annule une action en cours, revertant toutes les modifications effectuées depuis son début.

## Utilisation

```typescript
// Exemple de séquence d'actions
const actionId = generateUniqueId();

// Début d'une action
dispatch(historyActions.startAction(actionId));

// Dispatch d'une modification
dispatch(historyActions.dispatchToAction(actionId, someModification, true));

// Dispatch d'un lot de modifications
dispatch(historyActions.dispatchBatchToAction(actionId, [modification1, modification2], true));

// Finalisation de l'action
dispatch(
	historyActions.submitAction(
		actionId,
		"Modification de forme",
		true,
		["shapeState"],
		true,
		diffs,
	),
);

// Navigation dans l'historique
dispatch(historyActions.moveHistoryIndex(5));
```

## Structure de l'Historique

```typescript
interface HistoryState<T> {
	// Type d'historique
	type: "normal" | "selection";

	// Liste des états
	list: Array<{
		state: T;
		name: string;
		modifiedRelated: boolean;
		allowIndexShift: boolean;
		diffs: Diff[];
	}>;

	// Position actuelle
	index: number;
	indexDirection: -1 | 1;

	// Action en cours
	action: null | {
		id: string;
		state: T;
	};
}
```

## Gestion des Différences (Diffs)

```typescript
interface Diff {
	type: string;
	payload: any;
	reverse: () => void;
	apply: () => void;
}
```

## Bonnes Pratiques

1. **Gestion des Actions**

    - Toujours utiliser startAction avant les modifications
    - Grouper les modifications logiquement liées
    - Fournir des noms descriptifs pour les actions
    - Gérer correctement les annulations

2. **Performance**

    - Limiter la taille de l'historique
    - Optimiser les diffs générés
    - Grouper les modifications similaires
    - Éviter les actions inutiles

3. **Fiabilité**

    - Toujours gérer les cas d'erreur
    - Valider les états après les modifications
    - Maintenir la cohérence de l'historique
    - Sauvegarder régulièrement

4. **Organisation**
    - Utiliser des noms d'actions cohérents
    - Structurer les modifications logiquement
    - Documenter les changements importants

## Événements du Cycle de Vie

1. **Début d'Action**

    - Création de l'ID unique
    - Sauvegarde de l'état initial
    - Initialisation du contexte

2. **Pendant l'Action**

    - Accumulation des modifications
    - Génération des diffs
    - Validation des états intermédiaires

3. **Fin d'Action**
    - Validation de l'état final
    - Enregistrement dans l'historique
    - Nettoyage du contexte

## Voir aussi

-   [Système d'Historique](../technical/history.md)
-   [Gestion des États](../technical/state.md)
-   [Guide de l'Éditeur d'Historique](../ui/history-editor.md)
