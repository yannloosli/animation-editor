# Système de Timeline

Le système de timeline est un composant essentiel de l'éditeur d'animation qui permet la visualisation et l'édition temporelle des animations.

## Architecture

Le système de timeline est organisé en plusieurs modules :

### Composants Principaux

-   **Timeline Principal** (`Timeline.tsx`)

    -   Interface utilisateur principale
    -   Gestion des vues
    -   Interactions utilisateur

-   **Réducteur de Timeline** (`timelineReducer.ts`)
    -   Gestion de l'état
    -   Actions de modification
    -   Mise à jour des propriétés

### Sous-systèmes

#### Gestion des Calques (`layer/`)

-   Liste des calques
-   Hiérarchie
-   Prévisualisation des liens parentaux

#### Gestion des Propriétés (`property/`)

-   Édition des propriétés
-   Valeurs temporelles
-   Interpolation

#### Scrubber (`scrubber/`)

-   Navigation temporelle
-   Lecture/Pause
-   Marqueurs

## Structure des Données

### Timeline

```typescript
interface Timeline {
	id: string;
	keyframes: TimelineKeyframe[];
	_yBounds: [number, number] | null;
	_yPan: number;
	_indexShift: number | null;
	_valueShift: number | null;
	_controlPointShift: null | {
		indexDiff: number;
		indexShift: number;
		valueShift: number;
		direction: "left" | "right";
		yFac: number;
		shiftDown: boolean;
	};
}
```

### Keyframe

```typescript
interface TimelineKeyframe {
	id: string;
	index: number;
	value: number;
	reflectControlPoints: boolean;
	controlPointLeft: TimelineKeyframeControlPoint | null;
	controlPointRight: TimelineKeyframeControlPoint | null;
}
```

## Fonctionnalités Principales

### 1. Interface Utilisateur

-   **Panneau de Gauche**

    -   Liste des calques
    -   Hiérarchie des éléments
    -   Propriétés visibles

-   **Panneau de Droite**
    -   Éditeur de pistes
    -   Keyframes
    -   Courbes d'animation

### 2. Navigation

-   Zoom avec la molette
-   Pan avec la touche Espace
-   Sélection temporelle
-   Navigation par frames

### 3. Édition

-   Ajout/Suppression de keyframes
-   Modification des valeurs
-   Ajustement des courbes
-   Points de contrôle

### 4. Visualisation

-   Affichage des pistes
-   Courbes d'interpolation
-   Valeurs actuelles
-   Marqueurs temporels

## Intégration

### Avec le Système de Composition

```typescript
// Exemple d'intégration avec la composition
useCompositionPlayback(props.areaState.compositionId, propsRef);
```

### Avec l'Éditeur de Graphes

```typescript
// Intégration avec l'éditeur de graphes
{
	!props.areaState.graphEditorOpen && (
		<TrackEditor
			panY={props.areaState.panY}
			viewBounds={viewBounds}
			compositionId={compositionId}
			// ...
		/>
	);
}
```

## Gestion des Événements

### Zoom

```typescript
useKeyDownEffect("Z", (down) => {
	if (zoomTarget.current) {
		zoomTarget.current.style.display = down ? "block" : "";
	}
});
```

### Pan

```typescript
useKeyDownEffect("Space", (down) => {
	if (panTarget.current) {
		panTarget.current.style.display = down ? "block" : "";
	}
});
```

## Bonnes Pratiques

1. **Performance**

    - Optimisation du rendu
    - Gestion efficace des événements
    - Mise à jour sélective

2. **Interface Utilisateur**

    - Navigation intuitive
    - Retour visuel clair
    - Raccourcis clavier

3. **Gestion des Données**
    - Validation des valeurs
    - Sauvegarde des états
    - Annulation/Rétablissement

## Raccourcis Clavier

-   `Z` : Mode zoom
-   `Espace` : Mode pan
-   `←/→` : Navigation frame par frame
-   `Ctrl+Z` : Annuler
-   `Ctrl+Y` : Rétablir

## Composants d'Interface

### TimelineHeader

```typescript
<TimelineHeader areaId={props.areaId} />
```

### TimelineLayerList

```typescript
<TimelineLayerList
	compositionId={compositionId}
	moveLayers={props.areaState.moveLayers}
	panY={props.areaState.panY}
/>
```

### TimelineViewBounds

```typescript
<TimelineViewBounds
	left={viewportRight.left}
	width={viewportRight.width}
	compositionLength={compositionLength}
	viewBounds={viewBounds}
/>
```

## Dépendances

-   React pour l'interface utilisateur
-   Redux pour la gestion d'état
-   Utilitaires mathématiques pour les calculs
-   Système de composition pour l'intégration

## Ressources

-   [Documentation des Raccourcis](../technical/shortcuts.md)
-   [Guide de l'Interface](../ui/timeline-ui.md)
-   [Exemples d'Animation](../examples/timeline.md)
