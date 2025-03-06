# Gestion des Projets

Le système de gestion des projets est responsable de l'organisation et de la manipulation des compositions d'animation.

## Architecture

### Structure des fichiers

-   `Project.tsx` : Composant principal du projet
-   `ProjectComp.tsx` : Composant de composition
-   `ProjectCompName.tsx` : Gestion des noms de compositions
-   `projectReducer.ts` : Gestion de l'état du projet
-   `projectContextMenu.ts` : Menu contextuel du projet
-   `dragCompositionEligibleTargets.ts` : Gestion du drag & drop
-   `DragCompositionPreview.tsx` : Prévisualisation du drag & drop

## Fonctionnalités

### 1. Gestion des Compositions

-   Création de nouvelles compositions
-   Organisation hiérarchique
-   Renommage et suppression
-   Duplication de compositions

### 2. Interface Utilisateur

-   Liste des compositions
-   Menu contextuel
-   Drag & drop pour la réorganisation
-   Prévisualisation des compositions

### 3. Interactions

-   Sélection de compositions
-   Navigation dans la hiérarchie
-   Modification des propriétés
-   Gestion des dépendances

## Gestion d'État

### État du Projet

```typescript
interface ProjectState {
	compositions: string[]; // IDs des compositions
	selectedCompositionId: string | null;
	expandedFolders: Set<string>;
}
```

### Actions

-   Création de composition
-   Sélection de composition
-   Réorganisation des compositions
-   Expansion/réduction des dossiers

## Menu Contextuel

### Options Disponibles

1. **Compositions**

    - Nouvelle composition
    - Dupliquer
    - Renommer
    - Supprimer

2. **Organisation**
    - Créer un dossier
    - Déplacer vers
    - Trier par nom

## Drag & Drop

### Fonctionnalités

1. **Déplacement**

    - Entre dossiers
    - Réorganisation de l'ordre
    - Validation des cibles

2. **Prévisualisation**
    - Indication visuelle de la position
    - Validation en temps réel
    - Retour visuel des actions impossibles

## Bonnes Pratiques

### 1. Performance

-   Chargement à la demande des compositions
-   Optimisation des rendus
-   Gestion efficace de la mémoire

### 2. Organisation

-   Structure claire des dossiers
-   Nommage cohérent
-   Gestion des dépendances

### 3. Sauvegarde

-   Sauvegarde automatique
-   Versionnement
-   Export/Import de projets

## Exemples d'Utilisation

### Création d'une Composition

```typescript
// 1. Dispatch de l'action de création
dispatch(
	projectActions.createComposition({
		name: "Nouvelle Animation",
		width: 1920,
		height: 1080,
		frameRate: 60,
	}),
);

// 2. Sélection de la nouvelle composition
dispatch(projectActions.selectComposition(newCompositionId));
```

### Gestion des Dossiers

```typescript
// Création d'un dossier
dispatch(
	projectActions.createFolder({
		name: "Animations",
		parentId: null,
	}),
);

// Déplacement d'une composition
dispatch(
	projectActions.moveComposition({
		compositionId,
		targetFolderId,
		index,
	}),
);
```

## Intégration

### 1. Avec le Système de Rendu

-   Prévisualisation des compositions
-   Rendu en temps réel
-   Export des animations

### 2. Avec le Système de Timeline

-   Synchronisation des temps
-   Gestion des keyframes
-   Contrôles de lecture

### 3. Avec le Workspace

-   Intégration dans l'interface
-   Gestion des panneaux
-   Navigation entre compositions

## Ressources

-   [Guide du Système de Composition](./composition.md)
-   [Documentation Timeline](./timeline.md)
-   [Guide de l'Interface Utilisateur](../ui/README.md)
