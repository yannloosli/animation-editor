# Barre d'Outils

La barre d'outils est un composant essentiel de l'interface utilisateur qui fournit un accès rapide aux outils principaux de l'éditeur d'animation.

## Architecture

### Structure des fichiers

-   `Toolbar.tsx` : Composant principal de la barre d'outils
-   `toolActions.ts` : Actions Redux pour la gestion des outils
-   `toolReducer.ts` : Reducer pour la gestion de l'état des outils
-   `Toolbar.styles.ts` : Styles de la barre d'outils

## Fonctionnalités

### 1. Outils Disponibles

-   **Sélection** (`Tool.move`)

    -   Sélection et déplacement d'éléments
    -   Manipulation directe des objets

-   **Dessin**

    -   Outil Plume (`Tool.pen`)
    -   Rectangle (`Tool.rectangle`)
    -   Ellipse (`Tool.ellipse`)
    -   Polygone (`Tool.polygon`)

-   **Édition**
    -   Édition de points (`Tool.editVertex`)
    -   Remplissage (`Tool.fill`)
    -   Intersection (`Tool.intersection`)

### 2. Organisation des Outils

-   Groupement d'outils similaires
-   Menu déroulant pour chaque groupe
-   Sélection rapide du dernier outil utilisé

### 3. Interface Utilisateur

-   Icônes intuitives pour chaque outil
-   Raccourcis clavier configurables
-   Indication visuelle de l'outil actif
-   Zones de glissement pour le repositionnement

## Gestion d'État

### Actions

-   `setTool` : Sélection d'un nouvel outil
-   `setOpenGroupIndex` : Ouverture/fermeture des groupes d'outils

### État

```typescript
interface ToolState {
	selected: Tool;
	selectedInGroup: Tool[];
	openGroupIndex: number | null;
}
```

## Interactions

### 1. Sélection d'Outil

1. Clic direct sur l'icône de l'outil
2. Sélection via le menu déroulant
3. Utilisation des raccourcis clavier

### 2. Gestion des Groupes

-   Ouverture au clic sur le bouton de groupe
-   Fermeture automatique lors d'un clic extérieur
-   Mémorisation du dernier outil utilisé par groupe

## Personnalisation

### Styles

-   Thème personnalisable via CSS
-   Variables pour les couleurs et dimensions
-   Support des modes clair/sombre

### Configuration

-   Raccourcis clavier modifiables
-   Ordre des outils configurable
-   Groupes personnalisables

## Bonnes Pratiques

1. **Performance**

    - Utilisation de `useRef` pour les callbacks
    - Optimisation des rendus
    - Gestion efficace des événements

2. **Accessibilité**

    - Support des raccourcis clavier
    - Messages d'aide contextuels
    - Navigation au clavier

3. **Maintenance**
    - Code modulaire
    - Tests unitaires
    - Documentation des composants

## Exemples d'Utilisation

### Ajout d'un Nouvel Outil

```typescript
// 1. Ajouter l'outil dans les constantes
export enum Tool {
	newTool = "newTool",
}

// 2. Ajouter l'icône
toolToIconMap[Tool.newTool] = NewToolIcon;

// 3. Ajouter le label
toolToLabel[Tool.newTool] = "Nouvel Outil";

// 4. Configurer le raccourci (optionnel)
toolToKey[Tool.newTool] = "N";
```

## Ressources

-   [Guide des Icônes](../technical/icons.md)
-   [Documentation Redux](../technical/state.md)
-   [Guide des Styles](../technical/styles.md)
