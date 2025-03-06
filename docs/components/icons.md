# Système d'Icônes

## Vue d'ensemble

Le système d'icônes fournit une bibliothèque cohérente d'icônes réutilisables pour l'interface utilisateur de l'éditeur d'animation.

## Structure

```
components/icons/
├── index.ts     # Export des icônes
└── components/  # Composants d'icônes individuels
```

## Utilisation

```tsx
import { Icon1, Icon2 } from "components/icons";

// Exemple d'utilisation
<Icon1 size={24} color="currentColor" />;
```

## Propriétés Communes

-   `size`: Taille de l'icône en pixels (nombre)
-   `color`: Couleur de l'icône (string)
-   `className`: Classes CSS additionnelles (string)

## Bonnes Pratiques

1. Toutes les icônes doivent être des composants SVG optimisés
2. Utiliser des valeurs relatives pour les couleurs (currentColor)
3. Maintenir une taille de grille cohérente (généralement 24x24)
4. Assurer l'accessibilité avec des attributs aria appropriés
