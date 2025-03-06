# Composants Communs

## Vue d'ensemble

Les composants communs sont des éléments d'interface réutilisables qui maintiennent la cohérence visuelle et fonctionnelle à travers l'application.

## Composants Disponibles

### Boutons

-   `Button` : Bouton standard
-   `IconButton` : Bouton avec icône
-   `ToggleButton` : Bouton à deux états

### Entrées

-   `Input` : Champ de texte
-   `NumberInput` : Entrée numérique
-   `Select` : Menu déroulant
-   `Checkbox` : Case à cocher
-   `RadioGroup` : Groupe de boutons radio

### Navigation

-   `Tabs` : Système d'onglets
-   `Breadcrumb` : Fil d'Ariane
-   `Menu` : Menu déroulant

### Mise en page

-   `Panel` : Panneau conteneur
-   `Divider` : Séparateur
-   `Grid` : Grille flexible
-   `Stack` : Empilage vertical/horizontal

### Retour utilisateur

-   `Toast` : Notification temporaire
-   `Dialog` : Boîte de dialogue
-   `Tooltip` : Info-bulle
-   `ProgressBar` : Barre de progression

## Utilisation

```tsx
import { Button, Input, Panel } from "components/common";

// Exemple d'utilisation
<Panel>
	<Input placeholder="Nom" />
	<Button>Valider</Button>
</Panel>;
```

## Thème

Les composants communs suivent le système de design de l'application et utilisent les variables CSS définies dans `cssVariables.ts`.

## Accessibilité

Tous les composants communs sont conçus pour être accessibles par défaut :

-   Support du clavier
-   Attributs ARIA appropriés
-   Contraste suffisant
-   Messages d'erreur explicites

## Bonnes Pratiques

1. Utiliser les composants communs plutôt que de créer des composants spécifiques
2. Maintenir la cohérence des props entre les composants similaires
3. Documenter les nouveaux composants ajoutés
4. Tester l'accessibilité des composants
