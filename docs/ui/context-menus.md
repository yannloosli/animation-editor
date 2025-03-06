# Menus Contextuels

## Vue d'ensemble

Les menus contextuels fournissent un accès rapide aux actions spécifiques au contexte dans l'éditeur d'animation. Ils apparaissent lors d'un clic droit sur différents éléments de l'interface.

## Types de Menus

```typescript
interface ContextMenuTypes {
	// Menus principaux
	workspace: "workspace";
	layer: "layer";
	property: "property";
	timeline: "timeline";
	keyframe: "keyframe";
	flow: "flow";
	project: "project";
}

interface ContextMenuState {
	type: keyof ContextMenuTypes;
	position: Vec2;
	context: any;
	isOpen: boolean;
}
```

## Structure des Menus

### 1. Menu de Calque

```typescript
interface LayerContextMenu {
	// Actions de base
	duplicate(): void;
	delete(): void;
	rename(): void;

	// Organisation
	group(): void;
	ungroup(): void;
	isolate(): void;

	// Transformations
	resetTransform(): void;
	fitToContent(): void;
	centerInView(): void;

	// Propriétés
	convertToMask(): void;
	toggleVisibility(): void;
	toggleLock(): void;
}
```

### 2. Menu de Propriété

```typescript
interface PropertyContextMenu {
	// Actions de base
	reset(): void;
	copy(): void;
	paste(): void;

	// Animation
	addKeyframe(): void;
	removeKeyframe(): void;
	toggleHold(): void;

	// Flow
	connectToFlow(): void;
	disconnectFromFlow(): void;
	createExpression(): void;
}
```

### 3. Menu de Timeline

```typescript
interface TimelineContextMenu {
	// Navigation
	goToFrame(): void;
	setWorkArea(): void;
	addMarker(): void;

	// Keyframes
	insertKeyframe(): void;
	distributeKeyframes(): void;
	reverseKeyframes(): void;

	// Pistes
	addTrack(): void;
	hideEmptyTracks(): void;
	collapseAll(): void;
}
```

## Gestion des Événements

```typescript
interface ContextMenuEvents {
	// Événements de base
	onContextMenu(e: MouseEvent): void;
	onMenuItemClick(action: string): void;
	onMenuClose(): void;

	// Positionnement
	calculateMenuPosition(e: MouseEvent): Vec2;
	adjustMenuPosition(position: Vec2): Vec2;
}
```

## Styles et Thèmes

```typescript
const CONTEXT_MENU_STYLES = {
	// Dimensions
	MIN_WIDTH: 180,
	MAX_WIDTH: 300,
	ITEM_HEIGHT: 24,
	SEPARATOR_HEIGHT: 1,

	// Marges et padding
	PADDING: 4,
	ITEM_PADDING: "6px 8px",

	// Couleurs
	BACKGROUND: "var(--menu-bg)",
	HOVER: "var(--menu-hover)",
	SEPARATOR: "var(--menu-separator)",
};
```

## Composants

### 1. Structure de Base

```typescript
interface ContextMenuItem {
	id: string;
	label: string;
	icon?: string;
	shortcut?: string;
	action?: () => void;
	submenu?: ContextMenuItem[];
	disabled?: boolean;
	separator?: boolean;
}

interface ContextMenuProps {
	items: ContextMenuItem[];
	position: Vec2;
	onClose: () => void;
}
```

### 2. Rendu des Items

```typescript
const MenuItem: React.FC<ContextMenuItem> = ({ label, icon, shortcut, disabled, onClick }) => (
	<div className={s("menuItem", { disabled })}>
		{icon && <Icon name={icon} />}
		<span className={s("label")}>{label}</span>
		{shortcut && <span className={s("shortcut")}>{shortcut}</span>}
	</div>
);
```

## Intégration

### 1. Avec le Système de Raccourcis

```typescript
interface ContextMenuShortcuts {
	// Raccourcis globaux
	OPEN_CONTEXT_MENU: "ContextMenu";
	CLOSE_MENU: "Escape";

	// Navigation
	NEXT_ITEM: "ArrowDown";
	PREVIOUS_ITEM: "ArrowUp";
	ENTER_SUBMENU: "ArrowRight";
	EXIT_SUBMENU: "ArrowLeft";
}
```

### 2. Avec le Système de Diff

```typescript
interface ContextMenuDiff {
	// Types de modifications
	type: "contextMenu";
	action: string;
	context: any;

	// Annulation
	undo(): void;
	redo(): void;
}
```

## Performance

```typescript
interface ContextMenuOptimizations {
	// Cache
	cacheMenuStructure(): void;
	invalidateCache(): void;

	// Rendu
	shouldMenuUpdate(nextProps: Props): boolean;
	memoizeMenuItems(): void;
}
```

## Bonnes Pratiques

1. **Organisation**

    - Grouper les actions logiquement
    - Limiter la profondeur des sous-menus
    - Maintenir une hiérarchie cohérente

2. **Interface Utilisateur**

    - Fournir des raccourcis clavier
    - Afficher des icônes pertinentes
    - Maintenir une apparence cohérente

3. **Performance**

    - Optimiser le rendu des menus
    - Gérer efficacement les sous-menus
    - Utiliser la mémoisation appropriée

4. **Accessibilité**
    - Supporter la navigation au clavier
    - Fournir des descriptions d'actions
    - Maintenir un contraste suffisant

## Voir aussi

-   [Système des Areas](./areas.md)
-   [Workspace](./workspace.md)
-   [Timeline](./timeline.md)
-   [Barre d'Outils](./toolbar.md)
-   [Gestion des Événements](../technical/events.md)
