# Panneau de Projet

## Vue d'ensemble

Le panneau de projet permet de gérer les compositions de l'animation, offrant une interface pour créer, organiser et manipuler les compositions.

## Structure d'État

```typescript
interface ProjectState {
	// Liste des compositions
	compositions: string[];

	// État du glisser-déposer
	dragComp: null | {
		compositionId: string;
		position: Vec2;
	};

	// État de lecture
	playback: null | {
		compositionId: number;
		frameIndex: number;
	};
}
```

## Actions

```typescript
const projectActions = {
	// Gestion des compositions
	addComposition: (composition: Composition) => Action;
	removeComposition: (compositionId: string) => Action;

	// Glisser-déposer
	setDragComposition: (compositionId: string, position: Vec2) => Action;
	clearDragComposition: () => Action;
};
```

## Composants

### 1. Panneau Principal

```typescript
interface Project {
	// Rendu
	render(): JSX.Element;

	// Gestion des compositions
	handleCompositionClick(compositionId: string): void;
	handleCompositionDragStart(compositionId: string): void;
	handleCompositionDragEnd(): void;
}
```

### 2. Composition

```typescript
interface ProjectComp {
	// Props
	id: string;
	name: string;
	selected: boolean;

	// Événements
	onClick(e: MouseEvent): void;
	onContextMenu(e: MouseEvent): void;
	onDragStart(e: DragEvent): void;
}
```

### 3. Nom de Composition

```typescript
interface ProjectCompName {
	// Props
	id: string;
	name: string;
	isEditing: boolean;

	// Édition
	startEditing(): void;
	stopEditing(): void;
	handleNameChange(newName: string): void;
}
```

## Menu Contextuel

```typescript
interface ProjectContextMenu {
	// Actions de composition
	createComposition(): void;
	duplicateComposition(id: string): void;
	deleteComposition(id: string): void;
	renameComposition(id: string): void;

	// Actions de projet
	importComposition(): void;
	exportComposition(id: string): void;
}
```

## Styles

```typescript
const ProjectStyles = {
	// Conteneur
	container: css`
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--projectBg);
	`,

	// Liste des compositions
	list: css`
		flex: 1;
		overflow-y: auto;
		padding: 8px;
	`,

	// Composition
	composition: css`
		display: flex;
		align-items: center;
		height: 32px;
		padding: 0 8px;
		cursor: pointer;

		&:hover {
			background: var(--projectItemHoverBg);
		}

		&.selected {
			background: var(--projectItemSelectedBg);
		}
	`,
};
```

## Glisser-Déposer

```typescript
interface DragCompositionPreview {
	// Props
	compositionId: string;
	position: Vec2;

	// Rendu
	render(): JSX.Element;

	// Validation
	isValidDropTarget(target: HTMLElement): boolean;
}

interface DragCompositionEligibleTargets {
	// Validation
	isEligibleTarget(element: HTMLElement): boolean;
	findClosestEligibleTarget(element: HTMLElement): HTMLElement | null;

	// Mise en surbrillance
	highlightTarget(target: HTMLElement): void;
	clearHighlight(): void;
}
```

## Bonnes Pratiques

1. **Organisation**

    - Maintenir une structure claire des compositions
    - Faciliter la navigation
    - Supporter les opérations par lots

2. **Interface Utilisateur**

    - Fournir des retours visuels clairs
    - Supporter le glisser-déposer
    - Maintenir une interface réactive

3. **Performance**

    - Optimiser le rendu des listes
    - Gérer efficacement les aperçus
    - Minimiser les recalculs

4. **Maintenance**
    - Centraliser la logique de projet
    - Gérer proprement les erreurs
    - Maintenir la cohérence des états

## Voir aussi

-   [Système de Composition](../systems/composition.md)
-   [Workspace](./workspace.md)
-   [Timeline](./timeline.md)
