# Tessellation des Formes

## Vue d'ensemble

La tessellation est le processus de conversion des formes vectorielles en triangles pour le rendu GPU. Ce système est crucial pour les performances de rendu et la qualité visuelle de l'éditeur d'animation.

## Processus de Tessellation

### 1. Préparation des Données

-   Analyse des chemins vectoriels
-   Détection des contours
-   Identification des trous
-   Calcul des normales

### 2. Triangulation

-   Triangulation de Delaunay
-   Gestion des trous
-   Optimisation des maillages
-   Génération des indices

### 3. Optimisation

-   Fusion des vertices
-   Réduction des triangles
-   Optimisation des indices
-   Cache de géométrie

### 4. Rendu

-   Génération des buffers GPU
-   Gestion des shaders
-   Antialiasing
-   Gestion des styles

## API

```typescript
interface Tessellator {
	// Configuration
	setQuality: (quality: TessellationQuality) => void;
	setOptions: (options: TessellationOptions) => void;

	// Tessellation
	tessellate: (path: Path) => TessellatedMesh;
	tessellateWithHoles: (paths: Path[]) => TessellatedMesh;

	// Optimisation
	optimizeMesh: (mesh: TessellatedMesh) => TessellatedMesh;

	// Cache
	getCached: (pathId: string) => TessellatedMesh | null;
	clearCache: () => void;
}

interface TessellationOptions {
	quality: TessellationQuality;
	tolerance: number;
	enableCache: boolean;
	antialiasing: boolean;
}

interface TessellatedMesh {
	vertices: Float32Array;
	indices: Uint16Array;
	normals: Float32Array;
	bounds: Bounds;
}

enum TessellationQuality {
	Low = "low",
	Medium = "medium",
	High = "high",
}
```

## Paramètres de Qualité

### Basse Qualité

-   Distance minimale : 1.0 pixels
-   Angle minimal : 15 degrés
-   Cache maximal : 50 MB
-   Utilisation : Aperçu rapide

### Qualité Moyenne

-   Distance minimale : 0.5 pixels
-   Angle minimal : 10 degrés
-   Cache maximal : 100 MB
-   Utilisation : Édition normale

### Haute Qualité

-   Distance minimale : 0.1 pixels
-   Angle minimal : 5 degrés
-   Cache maximal : 200 MB
-   Utilisation : Export final

## Optimisations

### 1. Cache de Tessellation

```typescript
interface TessellationCache {
	// Gestion du cache
	set: (key: string, mesh: TessellatedMesh) => void;
	get: (key: string) => TessellatedMesh | null;
	clear: () => void;

	// Statistiques
	getStats: () => CacheStats;

	// Configuration
	setMaxSize: (sizeInMB: number) => void;
}

interface CacheStats {
	hitRate: number;
	memoryUsage: number;
	entryCount: number;
}
```

### 2. Optimisation des Maillages

-   Fusion des vertices proches
-   Élimination des triangles dégénérés
-   Réorganisation des indices pour le cache GPU
-   Compression des données

### 3. Gestion de la Mémoire

-   Libération automatique du cache
-   Priorité basée sur la visibilité
-   Compression des données inactives
-   Gestion des ressources GPU

## Bonnes Pratiques

1. **Choix de la Qualité**

    - Adapter la qualité au contexte
    - Utiliser la qualité basse pour l'édition
    - Réserver la haute qualité pour l'export

2. **Gestion du Cache**

    - Invalider le cache lors des modifications
    - Ajuster la taille selon la mémoire disponible
    - Monitorer les performances

3. **Optimisation des Performances**

    - Utiliser le multithreading quand possible
    - Implémenter un système de LOD
    - Optimiser pour le GPU ciblé

4. **Débogage**
    - Visualiser les triangles
    - Monitorer les performances
    - Tracer les problèmes de qualité

## Voir aussi

-   [Calques de Forme](./shape-layers.md)
-   [Performance](./performance.md)
-   [Système de Cache](./caching.md)
