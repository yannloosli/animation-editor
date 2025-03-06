# Éditeur de Graphes

## Vue d'ensemble

L'éditeur de graphes est une interface visuelle pour créer et modifier des graphes de nœuds dans le système de Flow. Il permet de construire des animations complexes en connectant des nœuds avec différentes fonctionnalités.

## Structure

```typescript
interface GraphEditorState {
	// État général
	selectedNodes: Set<string>;
	selectedConnections: Set<string>;
	zoom: number;
	pan: Vec2;

	// Mode d'édition
	mode: "select" | "connect" | "pan";
	dragState: DragState | null;

	// Prévisualisation
	previewConnection: ConnectionPreview | null;
	previewValue: any;
}
```

## Composants

### 1. Nœuds

```typescript
interface GraphNode {
	// Propriétés de base
	id: string;
	type: FlowNodeType;
	position: Vec2;
	size: Vec2;

	// Entrées/Sorties
	inputs: NodeInput[];
	outputs: NodeOutput[];

	// État
	isSelected: boolean;
	isActive: boolean;
	error: string | null;
}

interface NodeInput {
	id: string;
	type: ValueType;
	name: string;
	defaultValue: any;
	connection: string | null;
}

interface NodeOutput {
	id: string;
	type: ValueType;
	name: string;
	connections: string[];
}
```

### 2. Connexions

```typescript
interface GraphConnection {
	// Propriétés
	id: string;
	sourceNodeId: string;
	sourceOutputId: string;
	targetNodeId: string;
	targetInputId: string;

	// État
	isSelected: boolean;
	isActive: boolean;
	error: string | null;
}
```

## Interactions

### 1. Manipulation des Nœuds

```typescript
interface NodeManipulation {
	// Sélection
	selectNode(nodeId: string): void;
	selectMultipleNodes(nodeIds: string[]): void;

	// Déplacement
	moveNode(nodeId: string, position: Vec2): void;
	moveSelectedNodes(delta: Vec2): void;

	// Édition
	editNodeValue(nodeId: string, value: any): void;
	resizeNode(nodeId: string, size: Vec2): void;
}
```

### 2. Gestion des Connexions

```typescript
interface ConnectionManagement {
	// Création
	startConnection(nodeId: string, outputId: string): void;
	completeConnection(nodeId: string, inputId: string): void;
	cancelConnection(): void;

	// Modification
	disconnectInput(nodeId: string, inputId: string): void;
	disconnectOutput(nodeId: string, outputId: string): void;
	rerouteConnection(connectionId: string): void;
}
```

## Navigation et Vue

```typescript
interface GraphNavigation {
	// Zoom
	zoomIn(): void;
	zoomOut(): void;
	zoomToFit(): void;
	zoomToSelection(): void;

	// Pan
	pan(delta: Vec2): void;
	centerView(): void;

	// Grille
	setGridSize(size: number): void;
	toggleSnapping(): void;
}
```

## Évaluation et Prévisualisation

```typescript
interface GraphEvaluation {
	// Évaluation
	evaluateNode(nodeId: string): any;
	evaluateGraph(): void;

	// Prévisualisation
	previewValue(nodeId: string): void;
	updatePreview(value: any): void;

	// Débogage
	traceExecution(): void;
	highlightActiveNodes(): void;
}
```

## Organisation

### 1. Groupement

```typescript
interface NodeGrouping {
	// Groupes
	createGroup(nodeIds: string[]): void;
	ungroupNodes(groupId: string): void;

	// Organisation
	alignNodes(direction: "horizontal" | "vertical"): void;
	distributeNodes(direction: "horizontal" | "vertical"): void;
}
```

### 2. Commentaires

```typescript
interface GraphComments {
	// Gestion
	addComment(text: string, position: Vec2): void;
	editComment(id: string, text: string): void;
	deleteComment(id: string): void;

	// Style
	setCommentColor(id: string, color: string): void;
	resizeComment(id: string, size: Vec2): void;
}
```

## Performance

```typescript
interface GraphOptimizations {
	// Rendu
	cullNodes(): void;
	batchConnections(): void;

	// Cache
	cacheNodePreviews(): void;
	invalidateNodeCache(nodeId: string): void;

	// Mise à jour
	updateVisibleArea(): void;
	deferEvaluation(): void;
}
```

## Intégration

### 1. Avec le Système de Flow

```typescript
interface GraphFlowIntegration {
	// Synchronisation
	syncWithFlow(): void;
	updateFlowGraph(): void;

	// Compilation
	validateGraph(): boolean;
	compileGraph(): CompiledFlow;
}
```

### 2. Avec le Workspace

```typescript
interface GraphWorkspaceIntegration {
	// Prévisualisation
	previewInWorkspace(): void;
	clearWorkspacePreview(): void;

	// Synchronisation
	syncWithTimeline(): void;
	updateWorkspaceState(): void;
}
```

## Raccourcis Clavier

```typescript
const GRAPH_SHORTCUTS = {
	DELETE_SELECTION: "Delete",
	DUPLICATE: "Ctrl+D",
	GROUP: "Ctrl+G",
	UNGROUP: "Ctrl+Shift+G",
	ZOOM_TO_FIT: "F",
	ZOOM_TO_SELECTION: "Z",
};
```

## Bonnes Pratiques

1. **Organisation**

    - Maintenir une disposition claire
    - Grouper les nœuds logiquement
    - Utiliser des commentaires descriptifs

2. **Performance**

    - Optimiser le rendu des connexions
    - Gérer efficacement les évaluations
    - Utiliser le culling approprié

3. **Interface Utilisateur**

    - Fournir des retours visuels
    - Faciliter la navigation
    - Supporter les raccourcis clavier

4. **Maintenance**
    - Valider les connexions
    - Gérer les erreurs gracieusement
    - Maintenir la cohérence du graphe

## Voir aussi

-   [Système de Flow](../systems/flow.md)
-   [Workspace](./workspace.md)
-   [Timeline](./timeline.md)
-   [Menus Contextuels](./context-menus.md)
