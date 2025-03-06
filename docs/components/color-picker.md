# Sélecteur de Couleurs

## Vue d'ensemble

Le sélecteur de couleurs est un composant avancé permettant aux utilisateurs de choisir et de manipuler des couleurs de manière précise et intuitive.

## Fonctionnalités

-   Sélection de couleurs RGB/RGBA
-   Support des formats HEX, RGB, HSL
-   Historique des couleurs récentes
-   Palette de couleurs prédéfinies
-   Pipette de couleur
-   Contrôle de l'opacité

## Utilisation

```tsx
import { ColorPicker } from "components/colorPicker";

// Exemple d'utilisation basique
<ColorPicker
  value="#FF0000"
  onChange={(color) => console.log(color)}
/>

// Avec options avancées
<ColorPicker
  value="rgba(255, 0, 0, 0.5)"
  onChange={(color) => console.log(color)}
  showAlpha={true}
  format="rgba"
  presetColors={['#FF0000', '#00FF00', '#0000FF']}
/>
```

## Props

| Prop           | Type                                | Description                                   |
| -------------- | ----------------------------------- | --------------------------------------------- |
| `value`        | `string`                            | Valeur de la couleur actuelle                 |
| `onChange`     | `(color: string) => void`           | Callback appelé lors du changement de couleur |
| `format`       | `'hex' \| 'rgb' \| 'rgba' \| 'hsl'` | Format de sortie de la couleur                |
| `showAlpha`    | `boolean`                           | Affiche le contrôle de l'opacité              |
| `presetColors` | `string[]`                          | Liste des couleurs prédéfinies                |
| `disabled`     | `boolean`                           | Désactive le sélecteur                        |

## Composants Internes

### ColorPreview

Affiche un aperçu de la couleur sélectionnée.

### ColorSlider

Permet d'ajuster les composantes individuelles de la couleur.

### ColorGrid

Affiche une grille de couleurs prédéfinies.

### AlphaSlider

Contrôle l'opacité de la couleur.

## Événements

-   `onOpen` : Déclenché à l'ouverture du sélecteur
-   `onClose` : Déclenché à la fermeture du sélecteur
-   `onChange` : Déclenché lors du changement de couleur
-   `onChangeComplete` : Déclenché une fois la sélection terminée

## Accessibilité

-   Support complet du clavier
-   Labels et descriptions pour les lecteurs d'écran
-   Contraste suffisant pour les valeurs
-   Messages d'erreur vocaux

## Bonnes Pratiques

1. Toujours fournir un retour visuel lors des changements
2. Utiliser des libellés explicites pour les contrôles
3. Maintenir un historique des couleurs récentes
4. Permettre l'annulation des changements
