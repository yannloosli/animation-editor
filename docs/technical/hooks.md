# Hooks Personnalisés

## Vue d'ensemble

Les hooks personnalisés sont des composants réutilisables qui encapsulent la logique d'état et les effets secondaires dans l'application. Ils permettent une meilleure organisation du code et une réutilisation efficace des fonctionnalités communes.

## Hooks de Rendu

### useTickedRendering

```typescript
useTickedRendering(callback: () => void, deps: any[])
```

-   Gère le rendu synchronisé avec le tick d'animation
-   Optimise les performances de rendu
-   Évite les rendus inutiles

### useCanvasPixelSelector

```typescript
useCanvasPixelSelector(canvas: HTMLCanvasElement)
```

-   Permet la sélection précise de pixels sur un canvas
-   Utilisé pour la sélection de couleurs
-   Gère les coordonnées et la conversion de couleurs

## Hooks d'État

### useActionState

```typescript
useActionState<T>(selector: (state: ActionState) => T)
```

-   Accède à l'état de l'application de manière optimisée
-   Gère la mise à jour des composants
-   Intégré avec le système Redux

### useNumberTransitionState

```typescript
useNumberTransitionState(initialValue: number)
```

-   Gère les transitions fluides entre valeurs numériques
-   Utilisé pour les animations d'interface
-   Contrôle la vitesse et l'interpolation

### useComputeHistory

```typescript
useComputeHistory(key: string)
```

-   Gère l'historique des calculs
-   Optimise les performances en mémorisant les résultats
-   Intégré avec le système d'historique global

## Hooks d'Interaction

### useKeyDown

```typescript
useKeyDown(key: Key, callback: () => void)
```

-   Gère les événements clavier
-   Supporte les combinaisons de touches
-   Intégré avec le système de raccourcis

### useMouseEventOutside

```typescript
useMouseEventOutside(ref: RefObject<HTMLElement>, callback: () => void)
```

-   Détecte les clics en dehors d'un élément
-   Utilisé pour les menus contextuels
-   Gère la fermeture automatique des popups

### useRefRect

```typescript
useRefRect<T extends HTMLElement>()
```

-   Mesure les dimensions d'un élément DOM
-   Met à jour automatiquement lors du redimensionnement
-   Utilisé pour le positionnement des éléments

## Hooks d'Optimisation

### useDebounce

```typescript
useDebounce<T>(value: T, delay: number)
```

-   Limite la fréquence d'exécution des callbacks
-   Optimise les performances pour les événements fréquents
-   Configurable avec délai personnalisé

### useDidUpdate

```typescript
useDidUpdate(callback: () => void, deps: any[])
```

-   Version optimisée de useEffect
-   N'exécute pas le callback au montage initial
-   Utilisé pour les mises à jour conditionnelles

### useNumberInputAction

```typescript
useNumberInputAction(onChange: (value: number) => void)
```

-   Gère les entrées numériques avec validation
-   Supporte les formats spéciaux (pourcentage, degrés)
-   Intégré avec le système de propriétés

## Bonnes Pratiques

1. **Performance**

    - Utiliser useDebounce pour les événements fréquents
    - Optimiser les rendus avec useTickedRendering
    - Éviter les calculs inutiles avec useComputeHistory

2. **État**

    - Préférer useActionState pour l'état global
    - Utiliser useNumberTransitionState pour les animations
    - Gérer correctement les nettoyages dans useEffect

3. **Interactions**

    - Combiner useKeyDown avec les raccourcis globaux
    - Utiliser useMouseEventOutside pour la gestion des popups
    - Gérer les événements de manière optimisée

4. **Maintenance**
    - Documenter les paramètres et types
    - Tester les cas limites
    - Maintenir la cohérence des APIs

## Intégration

Les hooks s'intègrent avec :

-   Le système de rendu
-   La gestion d'état
-   Le système d'événements
-   L'interface utilisateur
-   Le système de propriétés

```typescript
function useNumberInputAction(
	value: number,
	onChange: (value: number) => void,
	options?: {
		min?: number;
		max?: number;
		step?: number;
	},
): {
	onKeyDown: (e: KeyboardEvent) => void;
	onWheel: (e: WheelEvent) => void;
};
```

Gère les interactions numériques via clavier et molette de souris.

## Hooks de Rendu

### useTickedRendering

```typescript
function useTickedRendering(
	callback: (deltaTime: number) => void,
	options?: {
		fps?: number;
		paused?: boolean;
		onTick?: (deltaTime: number) => void;
	},
): void;
```

Fournit une boucle de rendu temporisée pour les animations et mises à jour continues.

### useCanvasPixelSelector

```typescript
function useCanvasPixelSelector(
	canvas: HTMLCanvasElement | null,
	options?: {
		threshold?: number;
		radius?: number;
		getImageData?: boolean;
	},
): (x: number, y: number) => boolean;
```

Permet la sélection précise de pixels sur un canvas avec support de tolérance.

## Hooks d'Optimisation

### useDebounce

```typescript
function useDebounce<T>(value: T, delay: number): T;
```

Retarde l'exécution d'une mise à jour jusqu'à ce qu'un certain délai soit écoulé.

### useDidUpdate

```typescript
function useDidUpdate(effect: () => void | (() => void), deps?: DependencyList): void;
```

Exécute un effet uniquement après les mises à jour, en ignorant le montage initial.

### useRefRect

```typescript
function useRefRect<T extends HTMLElement>(options?: {
	onResize?: (rect: DOMRect) => void;
}): [RefObject<T>, DOMRect | null, () => void];
```

Maintient une référence à jour des dimensions d'un élément DOM.

## Bonnes Pratiques

1. **Performance**

    - Utiliser `useDebounce` pour les opérations coûteuses
    - Optimiser les dépendances des effets
    - Éviter les calculs inutiles dans les hooks

2. **Réutilisabilité**

    - Garder les hooks focalisés sur une seule responsabilité
    - Documenter clairement les paramètres et le comportement
    - Fournir des options de configuration flexibles

3. **Maintenance**

    - Suivre les conventions de nommage
    - Gérer proprement le nettoyage des effets
    - Maintenir la cohérence des types

4. **Tests**
    - Tester les cas limites
    - Vérifier les fuites de mémoire
    - Simuler différents scénarios d'utilisation

## Voir aussi

-   [Gestion d'État](./state-management.md)
-   [Système de Rendu](./render.md)
-   [Interactions Utilisateur](../ui/interactions.md)
