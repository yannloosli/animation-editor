# Système de Workspace

## Vue d'ensemble

Le workspace est l'interface principale de l'éditeur d'animation où les utilisateurs peuvent visualiser et manipuler les compositions. Il gère le rendu, les interactions utilisateur, et intègre les différents outils d'édition.

## Structure

### Composant Principal

```typescript
const WorkspaceComponent: React.FC<{
	areaId: string;
	areaState: WorkspaceAreaState;
	left: number;
	top: number;
	width: number;
	height: number;
}>;
```

### État

```typescript
interface WorkspaceAreaState {
	compositionId: string;
	viewport: {
		scale: number;
		translateX: number;
		translateY: number;
	};
}
```

## Outils

### Outil de Déplacement

```typescript
const moveToolHandlers = {
	onMouseDown(e: MouseEvent, areaId: string, viewport: Viewport): void;
	onMouseMove(e: MouseEvent): void;
	onMouseUp(e: MouseEvent): void;
};
```

### Outil Plume

```typescript
const penToolHandlers = {
	onMouseDown(e: MouseEvent, areaId: string, viewport: Viewport): void;
	onMouseMove(e: MouseEvent): void;
	onMouseUp(e: MouseEvent): void;
	onKeyDown(e: KeyboardEvent): void;
};
```

## Navigation

### Gestionnaires

```typescript
const workspaceHandlers = {
	// Zoom et panoramique
	onWheel(e: WheelEvent, areaId: string): void;
	onPanStart(areaId: string, e: MouseEvent): void;
	onZoomClick(e: MouseEvent, areaId: string): void;
};
```

### Curseur

```typescript
const useWorkspaceCursor = (
	canvasRef: RefObject<HTMLCanvasElement>,
	options: {
		compositionId: string;
		viewport: Viewport;
		areaId: string;
	},
): (e: MouseEvent) => void;
```

## Raccourcis Clavier

```typescript
const workspaceShortcuts: KeyboardShortcut[] = [
	{
		name: "Outil de déplacement",
		key: "v",
		fn: selectMoveTool,
	},
	{
		name: "Outil plume",
		key: "p",
		fn: selectPenTool,
	},
	{
		name: "Panoramique",
		key: "Space",
		fn: enablePanMode,
	},
	{
		name: "Zoom",
		key: "z",
		fn: enableZoomMode,
	},
];
```

## Opérations

```typescript
const workspaceOperations = {
	// Navigation
	zoomToFit(areaId: string): void;
	zoomToSelection(areaId: string): void;
	resetView(areaId: string): void;

	// Sélection
	selectAtPoint(areaId: string, point: Vec2): void;
	selectInRect(areaId: string, rect: Rect): void;
};
```

## Utilitaires

```typescript
const workspaceUtils = {
	// Conversion de coordonnées
	viewportToWorld(point: Vec2, viewport: Viewport): Vec2;
	worldToViewport(point: Vec2, viewport: Viewport): Vec2;

	// Calculs de viewport
	getVisibleRect(viewport: Viewport): Rect;
	isPointVisible(point: Vec2, viewport: Viewport): boolean;
};
```

## Styles

```typescript
const WorkspaceStyles = {
	// Conteneur
	container: css`
		position: relative;
		width: 100%;
		height: 100%;
		background: var(--workspaceBg);
	`,

	// Cibles d'interaction
	panTarget: css`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: none;
		cursor: grab;

		&:active {
			cursor: grabbing;
		}
	`,

	zoomTarget: css`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: none;
		cursor: zoom-in;
	`,

	// Pied de page
	footer: css`
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 32px;
		background: var(--workspaceFooterBg);
	`,

	// Messages d'erreur
	errors: css`
		position: absolute;
		bottom: 40px;
		left: 8px;
		padding: 8px;
		background: var(--errorBg);
		color: var(--errorColor);
		border-radius: 4px;
	`,
};
```

## Bonnes Pratiques

1. **Performance**

    - Optimiser le rendu canvas
    - Gérer efficacement les événements
    - Mettre en cache les calculs de viewport

2. **Interface Utilisateur**

    - Fournir des retours visuels clairs
    - Supporter les interactions standard
    - Maintenir des curseurs appropriés

3. **Interaction**

    - Supporter les raccourcis clavier communs
    - Gérer les modes d'outil proprement
    - Fournir une navigation fluide

4. **Maintenance**
    - Séparer la logique des outils
    - Documenter les interactions complexes
    - Maintenir la cohérence des états

## Voir aussi

-   [Système de Composition](../systems/composition.md)
-   [Système de Rendu](../technical/render.md)
-   [Outils](./tools.md)
