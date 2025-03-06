# Système de Flow

Le système de flow est un composant central de l'éditeur d'animation qui permet la création et la manipulation de graphes de nœuds pour le traitement des données et des animations.

## Architecture

### Types de Nœuds

Le système supporte plusieurs types de nœuds (`FlowNodeType`) :

-   Nœuds numériques (`num_input`, `num_cap`, `num_lerp`)
-   Nœuds vectoriels (`vec2_add`, `vec2_lerp`, `vec2_factors`, `vec2_input`)
-   Nœuds de conversion (`deg_to_rad`, `rad_to_deg`)
-   Nœuds de transformation (`rect_translate`)
-   Nœuds d'expression (`expr`)
-   Nœuds de couleur (`color_from_hsl_factors`, `color_to_hsl_factors`, etc.)
-   Nœuds de propriété (`property_output`, `property_input`)
-   Nœuds de composition (`composition`)

### Structure des Nœuds

Chaque nœud (`FlowNode`) contient :

-   Un identifiant unique (`id`)
-   Un identifiant de graphe (`graphId`)
-   Une position dans l'interface (`position`)
-   Des entrées (`inputs`) et sorties (`outputs`)
-   Un état interne (`state`)
-   Des propriétés de mise en page (`width`)

## Fonctionnalités

### Gestion des Connexions

Le système permet de :

-   Connecter des sorties aux entrées des nœuds
-   Gérer les types de données compatibles
-   Détecter et éviter les cycles dans le graphe

### Compilation et Exécution

Le processus de compilation comprend :

1. Création des nœuds compilés
2. Gestion des dépendances externes
3. Ordonnancement des calculs
4. Génération des expressions

### Gestion d'État

Le système utilise un réducteur Redux pour :

-   Ajouter/supprimer des nœuds
-   Modifier les positions
-   Gérer les connexions
-   Mettre à jour l'état des nœuds

## Interface Utilisateur

L'éditeur de flow fournit :

-   Une zone de travail interactive
-   Des outils de sélection et de déplacement
-   Un système de prévisualisation
-   Des menus contextuels

## Intégration

Le système de flow s'intègre avec :

-   Le système de propriétés
-   Le système de composition
-   Le moteur d'animation
-   Le système de rendu

## Bonnes Pratiques

1. Éviter les cycles dans les graphes
2. Utiliser des noms descriptifs pour les entrées/sorties
3. Organiser les nœuds de manière logique
4. Documenter les expressions complexes
5. Valider les types de données
