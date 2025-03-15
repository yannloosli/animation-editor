import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { areaStateReducerRegistry } from "~/area/areaRegistry";
import { areaInitialStates } from "~/area/state/areaInitialStates";
import { AreaState } from "~/area/types";
import { computeAreaToParentRow } from "~/area/util/areaToParentRow";
import { AreaType } from "~/constants";
import { CardinalDirection } from "~/types";
import { AreaRowLayout, AreaRowOrientation } from "~/types/areaTypes";
import { Vec2 } from "~/util/math/vec2";
import { AreaWithId } from "./areaAdapter";
import { initializeArea, updateAreaLayout } from "./areaThunks";

// Type pour la position sérialisée
interface SerializedVec2 {
    x: number;
    y: number;
}

// Type pour l'état sérialisé
interface SerializedAreaToOpen {
    position: SerializedVec2;
    area: AreaWithId;
}

// Type pour l'état des areas avec EntityState
export type AreaEntityState = {
    ids: string[];
    entities: { [key: string]: AreaWithId };
};

// Type pour l'état complet avec sérialisation
export interface AreaSliceState extends Omit<AreaState, 'areas' | 'areaToOpen'> {
    areas: AreaEntityState;
    areaToOpen: SerializedAreaToOpen | null;
    status: 'idle' | 'loading' | 'failed';
    error: string | null;
}

// Type pour l'état avec actions temporaires
export interface AreaSliceStateWithTemp extends AreaSliceState {
    temporaryAction: null | {
        id: string;
        state: AreaSliceState;
    };
}

// Helper pour sérialiser Vec2
function serializeVec2(vec: Vec2): SerializedVec2 {
    return { x: vec.x, y: vec.y };
}

// Helper pour désérialiser Vec2
function deserializeVec2(vec: SerializedVec2): Vec2 {
    return new Vec2(vec.x, vec.y);
}

// Helper pour convertir l'état pour computeAreaToParentRow
function convertStateForCompute(state: AreaSliceState): AreaState {
    return {
        ...state,
        areas: state.areas.entities,
        areaToOpen: state.areaToOpen ? {
            position: deserializeVec2(state.areaToOpen.position),
            area: state.areaToOpen.area
        } : null
    } as AreaState;
}

// État initial avec le type AreaSliceStateWithTemp pour la compatibilité
export const initialState: AreaSliceStateWithTemp = {
    _id: 2,
    layout: {
        "0": {
            type: "area_row" as const,
            id: "0",
            areas: [
                { id: "1", size: 0.25 },
                { id: "2", size: 0.75 }
            ],
            orientation: "horizontal" as const
        },
        "1": {
            type: "area",
            id: "1",
        },
        "2": {
            type: "area",
            id: "2",
        }
    },
    areas: {
        ids: ["1", "2"],
        entities: {
            "1": {
                id: "1",
                type: AreaType.Project,
                state: {},
            },
            "2": {
                id: "2",
                type: AreaType.Workspace,
                state: {
                    compositionId: "default",
                    pan: { x: 0, y: 0 },
                    scale: 1,
                    selectionRect: null,
                },
            }
        }
    },
    joinPreview: null,
    rootId: "0",
    areaToOpen: null,
    status: 'idle',
    error: null,
    temporaryAction: null
};

export const areaSlice = createSlice({
    name: "area",
    initialState,
    reducers: {
        // Adapter reducers
        addArea: (state, action: PayloadAction<AreaWithId>) => {
            const { id, ...area } = action.payload;
            state.areas.ids.push(id);
            state.areas.entities[id] = action.payload;
        },
        updateArea: (state, action: PayloadAction<{ id: string; changes: Partial<AreaWithId> }>) => {
            const { id, changes } = action.payload;
            if (state.areas.entities[id]) {
                state.areas.entities[id] = { ...state.areas.entities[id], ...changes };
            }
        },
        removeArea: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            state.areas.ids = state.areas.ids.filter(areaId => areaId !== id);
            delete state.areas.entities[id];
        },

        setFields: (state, action: PayloadAction<Partial<AreaState>>) => {
            const { areaToOpen, ...rest } = action.payload;
            if (areaToOpen) {
                state.areaToOpen = {
                    position: serializeVec2(areaToOpen.position),
                    area: areaToOpen.area as AreaWithId
                };
            }
            Object.assign(state, rest);
        },

        setJoinAreasPreview: (
            state,
            action: PayloadAction<{
                areaId: string | null;
                from: CardinalDirection | null;
                eligibleAreaIds: string[];
            }>
        ) => {
            const { areaId, from, eligibleAreaIds } = action.payload;
            state.joinPreview = {
                areaId,
                movingInDirection: from,
                eligibleAreaIds,
            };
        },

        joinAreas: (
            state,
            action: PayloadAction<{
                areaRowId: string | number;
                areaIndex: number;
                mergeInto: -1 | 1;
            }>
        ) => {
            const { areaRowId, areaIndex, mergeInto } = action.payload;

            console.log('joinAreas - Début de la fonction avec paramètres:', {
                areaRowId: areaRowId,
                areaIndex: areaIndex,
                mergeInto: mergeInto
            });

            // Vérifier la structure de l'état pour accéder au layout correctement
            console.log('joinAreas - Structure de l\'état:', Object.keys(state));

            // Déterminer si nous avons un état imbriqué ou direct
            let layout: Record<string, any> | undefined;

            // Vérifier si nous avons un état imbriqué (state.state.layout) ou direct (state.layout)
            if (state && typeof state === 'object' && 'state' in (state as any) && (state as any).state && typeof (state as any).state === 'object' && 'layout' in (state as any).state) {
                // Structure imbriquée: state.state.layout
                layout = (state as any).state.layout;
                console.log('joinAreas - Utilisation de la structure d\'état imbriquée');
            } else if (state && typeof state === 'object' && 'layout' in (state as any) && (state as any).layout) {
                // Structure directe: state.layout
                layout = (state as any).layout;
                console.log('joinAreas - Utilisation de la structure d\'état directe');
            } else {
                console.error('joinAreas - Layout non disponible dans l\'état', {
                    stateExists: !!state,
                    stateKeys: state && typeof state === 'object' ? Object.keys(state as object) : []
                });
                return;
            }

            // Vérifier que layout est défini
            if (!layout) {
                console.error("joinAreas - Layout est undefined après vérification");
                return;
            }

            console.log('joinAreas - Layout trouvé, clés:', Object.keys(layout));

            // Convertir areaRowId en string pour assurer la compatibilité
            const rowIdStr = String(areaRowId);
            console.log('joinAreas - Recherche de la ligne avec ID:', rowIdStr);

            // Vérifier si la ligne existe dans le layout
            if (!layout[rowIdStr]) {
                console.error(`joinAreas - Ligne avec ID ${rowIdStr} non trouvée dans le layout`);
                return;
            }

            const row = layout[rowIdStr];
            console.log('joinAreas - Ligne trouvée:', row);

            // Vérifier que la ligne est de type 'area_row'
            if (row.type !== 'area_row') {
                console.error(`joinAreas - L'élément avec ID ${rowIdStr} n'est pas une ligne (type: ${row.type})`);
                return;
            }

            // Vérifier que les indices sont valides
            if (areaIndex < 0 || areaIndex >= row.areas.length) {
                console.error(`joinAreas - Index de zone invalide: ${areaIndex}, longueur des zones: ${row.areas.length}`);
                return;
            }

            const targetIndex = areaIndex + mergeInto;
            if (targetIndex < 0 || targetIndex >= row.areas.length) {
                console.error(`joinAreas - Index cible invalide: ${targetIndex}, longueur des zones: ${row.areas.length}`);
                return;
            }

            console.log('joinAreas - Indices valides, fusion de', areaIndex, 'avec', targetIndex);

            // Obtenir les IDs des zones à fusionner
            const sourceAreaId = row.areas[areaIndex].id;
            const targetAreaId = row.areas[targetIndex].id;

            console.log('joinAreas - IDs des zones à fusionner:', { sourceAreaId, targetAreaId });

            // Vérifier que les zones existent
            if (!layout[sourceAreaId] || !layout[targetAreaId]) {
                console.error('joinAreas - Une ou plusieurs zones n\'existent pas dans le layout');
                return;
            }

            const sourceArea = layout[sourceAreaId];
            const targetArea = layout[targetAreaId];

            console.log('joinAreas - Zones trouvées:', { sourceArea, targetArea });

            // Fusionner les zones
            // Si la zone source est un conteneur, déplacer ses enfants vers la zone cible
            if (sourceArea.type === 'container' && targetArea.type === 'container') {
                console.log('joinAreas - Fusion de deux conteneurs');

                // Copier les enfants de la source vers la cible
                if (sourceArea.children && sourceArea.children.length > 0) {
                    if (!targetArea.children) {
                        targetArea.children = [];
                    }

                    console.log('joinAreas - Déplacement des enfants:', sourceArea.children);
                    targetArea.children = [...targetArea.children, ...sourceArea.children];

                    // Mettre à jour les parents des enfants déplacés
                    sourceArea.children.forEach((childId: string) => {
                        if (layout[childId]) {
                            layout[childId].parent = targetAreaId;
                        }
                    });
                }
            }

            // Mettre à jour la liste des zones dans la ligne
            console.log('joinAreas - Mise à jour de la liste des zones dans la ligne');
            row.areas = row.areas.filter((_: any, i: number) => i !== areaIndex);

            // Mettre à jour les tailles
            if (row.sizes && row.sizes.length > row.areas.length) {
                console.log('joinAreas - Ajustement des tailles:', row.sizes);
                row.sizes = row.sizes.filter((_: any, i: number) => i !== areaIndex);
            }

            // Supprimer la zone source du layout
            console.log('joinAreas - Suppression de la zone source du layout:', sourceAreaId);
            delete layout[sourceAreaId];

            console.log('joinAreas - Fusion terminée avec succès');
        },

        insertAreaIntoRow: (
            state,
            action: PayloadAction<{
                rowId: string;
                area: AreaWithId;
                insertIndex: number;
            }>
        ) => {
            const { rowId, area, insertIndex } = action.payload;

            // Vérifier que rowId est défini
            if (!rowId) {
                console.error("insertAreaIntoRow: rowId est undefined");
                return;
            }

            // Vérifier que le layout existe
            if (!state.layout) {
                console.error("insertAreaIntoRow: layout non disponible");
                return;
            }

            // Récupérer la rangée
            const row = state.layout[rowId] as AreaRowLayout;

            // Vérifier que la rangée existe et est du bon type
            if (!row || row.type !== "area_row") {
                console.error(`insertAreaIntoRow: rangée invalide: ${rowId}`, {
                    rowExists: !!row,
                    rowType: row ? row.type : 'undefined',
                    availableKeys: Object.keys(state.layout)
                });
                return;
            }

            // Vérifier que areas existe et est un tableau
            if (!row.areas || !Array.isArray(row.areas)) {
                console.error(`insertAreaIntoRow: areas non disponible ou non valide pour la rangée ${rowId}`);
                return;
            }

            // Vérifier que l'index d'insertion est valide
            if (insertIndex < 0 || insertIndex > row.areas.length) {
                console.error(`insertAreaIntoRow: index d'insertion invalide: ${insertIndex}`, {
                    areasLength: row.areas.length
                });
                return;
            }

            // Créer une copie du tableau areas
            const areas = [...row.areas];
            const newAreaId = (state._id + 1).toString();

            // Insérer la nouvelle zone à l'index spécifié
            areas.splice(insertIndex, 0, { id: newAreaId, size: 0 });

            // Mettre à jour l'état
            state._id = state._id + 1;
            state.layout[row.id] = { ...row, areas };
            state.layout[newAreaId] = { type: "area", id: newAreaId };
            state.areas.ids.push(newAreaId);
            state.areas.entities[newAreaId] = area;

            console.log(`insertAreaIntoRow: zone ${newAreaId} insérée avec succès à l'index ${insertIndex} de la rangée ${rowId}`);
        },

        convertAreaToRow: (
            state,
            action: PayloadAction<{
                areaId: string | number;
                cornerParts: [CardinalDirection, CardinalDirection];
                horizontal: boolean;
            }>
        ) => {
            const { cornerParts, areaId, horizontal } = action.payload;

            // Convertir areaId en chaîne de caractères
            const areaIdStr = String(areaId);

            console.log("convertAreaToRow - Début:", {
                areaId,
                areaIdStr,
                cornerParts,
                horizontal,
                stateKeys: Object.keys(state),
                hasLayout: !!state.layout,
                layoutKeys: state.layout ? Object.keys(state.layout) : []
            });

            // Vérification directe de l'existence du layout
            if (!state.layout) {
                console.error("Layout non disponible dans l'état direct");

                // Vérifier si le layout est dans state.state
                if (state && typeof state === 'object' && 'state' in (state as any) &&
                    (state as any).state && typeof (state as any).state === 'object' &&
                    'layout' in (state as any).state) {

                    console.log("Layout trouvé dans state.state, utilisation de cette structure");
                    const nestedState = (state as any).state;

                    // Vérifier que l'area existe et est du bon type
                    const originalLayout = nestedState.layout[areaIdStr];
                    if (!originalLayout || originalLayout.type !== "area") {
                        console.error('Area invalide dans state.state.layout:', {
                            exists: !!originalLayout,
                            type: originalLayout?.type,
                            availableKeys: Object.keys(nestedState.layout)
                        });
                        return;
                    }

                    // Vérifier que l'area existe dans les entités
                    if (!nestedState.areas || !nestedState.areas.entities || !nestedState.areas.entities[areaIdStr]) {
                        console.error('Area non trouvée dans les entités de state.state:', areaIdStr);
                        return;
                    }

                    const originalArea = nestedState.areas.entities[areaIdStr];

                    try {
                        // Incrémenter l'ID pour les nouvelles areas
                        const idForOldArea = ((nestedState._id || 0) + 1).toString();
                        const idForNewArea = ((nestedState._id || 0) + 2).toString();
                        nestedState._id = (nestedState._id || 0) + 2;

                        console.log("convertAreaToRow - Nouveaux IDs (state.state):", {
                            idForOldArea,
                            idForNewArea,
                            originalId: areaIdStr
                        });

                        // Créer les nouveaux layouts pour les areas
                        nestedState.layout[idForOldArea] = {
                            type: "area" as const,
                            id: idForOldArea
                        };

                        nestedState.layout[idForNewArea] = {
                            type: "area" as const,
                            id: idForNewArea
                        };

                        // Copier l'état de l'area originale pour les nouvelles areas
                        nestedState.areas.ids.push(idForOldArea, idForNewArea);
                        nestedState.areas.entities[idForOldArea] = { ...originalArea, id: idForOldArea };
                        nestedState.areas.entities[idForNewArea] = { ...originalArea, id: idForNewArea };

                        // Créer la nouvelle row
                        const rowAreas = [
                            { size: 0.5, id: idForOldArea },
                            { size: 0.5, id: idForNewArea }
                        ];

                        // Déterminer l'ordre des areas en fonction des coins
                        const insertFirst = cornerParts.includes(horizontal ? "w" : "n");
                        if (insertFirst) {
                            rowAreas.reverse();
                        }

                        // Créer la nouvelle row layout
                        const newRow: AreaRowLayout = {
                            type: "area_row" as const,
                            id: areaIdStr,
                            areas: rowAreas,
                            orientation: horizontal ? "horizontal" as const : "vertical" as const
                        };

                        // Mettre à jour le layout
                        nestedState.layout[areaIdStr] = newRow;

                        // Supprimer l'area originale du state.areas car elle est maintenant une row
                        nestedState.areas.ids = nestedState.areas.ids.filter((id: string) => id !== areaIdStr);
                        delete nestedState.areas.entities[areaIdStr];

                        console.log("convertAreaToRow - Conversion réussie (state.state):", {
                            areaId: areaIdStr,
                            horizontal,
                            newIds: [idForOldArea, idForNewArea]
                        });

                        return;
                    } catch (error) {
                        console.error('Erreur lors de la conversion (state.state):', error);
                        return;
                    }
                } else {
                    console.error("Layout non disponible dans aucune structure d'état connue");
                    return;
                }
            }

            // Vérifier que l'area existe et est du bon type
            const originalLayout = state.layout[areaIdStr];
            if (!originalLayout || originalLayout.type !== "area") {
                console.error('Area invalide:', {
                    exists: !!originalLayout,
                    type: originalLayout?.type,
                    availableKeys: Object.keys(state.layout)
                });
                return;
            }

            // Vérifier que l'area existe dans les entités
            if (!state.areas || !state.areas.entities || !state.areas.entities[areaIdStr]) {
                console.error('Area non trouvée dans les entités:', areaIdStr);
                return;
            }

            const originalArea = state.areas.entities[areaIdStr];

            try {
                // Incrémenter l'ID pour les nouvelles areas
                const idForOldArea = ((state._id || 0) + 1).toString();
                const idForNewArea = ((state._id || 0) + 2).toString();
                state._id = (state._id || 0) + 2;

                console.log("convertAreaToRow - Nouveaux IDs:", {
                    idForOldArea,
                    idForNewArea,
                    originalId: areaIdStr
                });

                // Créer les nouveaux layouts pour les areas
                state.layout[idForOldArea] = {
                    type: "area" as const,
                    id: idForOldArea
                };

                state.layout[idForNewArea] = {
                    type: "area" as const,
                    id: idForNewArea
                };

                // Copier l'état de l'area originale pour les nouvelles areas
                state.areas.ids.push(idForOldArea, idForNewArea);
                state.areas.entities[idForOldArea] = { ...originalArea, id: idForOldArea };
                state.areas.entities[idForNewArea] = { ...originalArea, id: idForNewArea };

                // Créer la nouvelle row
                const rowAreas = [
                    { size: 0.5, id: idForOldArea },
                    { size: 0.5, id: idForNewArea }
                ];

                // Déterminer l'ordre des areas en fonction des coins
                const insertFirst = cornerParts.includes(horizontal ? "w" : "n");
                if (insertFirst) {
                    rowAreas.reverse();
                }

                // Créer la nouvelle row layout
                const newRow: AreaRowLayout = {
                    type: "area_row" as const,
                    id: areaIdStr,
                    areas: rowAreas,
                    orientation: horizontal ? "horizontal" as const : "vertical" as const
                };

                // Mettre à jour le layout
                state.layout[areaIdStr] = newRow;

                // Supprimer l'area originale du state.areas car elle est maintenant une row
                state.areas.ids = state.areas.ids.filter((id: string) => id !== areaIdStr);
                delete state.areas.entities[areaIdStr];

                console.log("convertAreaToRow - Conversion réussie:", {
                    areaId: areaIdStr,
                    horizontal,
                    newIds: [idForOldArea, idForNewArea]
                });
            } catch (error) {
                console.error('Erreur lors de la conversion:', error);
                // En cas d'erreur, on restaure l'état original
                if (originalLayout && originalArea) {
                    state.layout[areaIdStr] = originalLayout;
                    if (!state.areas.ids.includes(areaIdStr)) {
                        state.areas.ids.push(areaIdStr);
                    }
                    state.areas.entities[areaIdStr] = originalArea;
                    console.log("convertAreaToRow - État restauré après erreur");
                }
            }
        },

        setRowSizes: (
            state,
            action: PayloadAction<{
                rowId: string | number;
                sizes: number[];
            }>
        ) => {
            let { rowId, sizes } = action.payload;

            // Convertir rowId en chaîne de caractères si c'est un nombre
            const rowIdStr = String(rowId);

            // Vérifier la structure complète de l'état
            console.log("setRowSizes - Structure de l'état:", {
                stateExists: !!state,
                stateType: typeof state,
                stateKeys: state ? Object.keys(state as object) : [],
                hasState: state && typeof state === 'object' && 'state' in (state as any),
                stateStateExists: state && typeof state === 'object' && 'state' in (state as any) && !!(state as any).state,
                stateStateType: state && typeof state === 'object' && 'state' in (state as any) ? typeof (state as any).state : 'N/A',
                stateStateKeys: state && typeof state === 'object' && 'state' in (state as any) && (state as any).state ? Object.keys((state as any).state as object) : [],
                hasLayout: state && typeof state === 'object' && 'layout' in (state as any) && !!(state as any).layout,
                layoutKeys: state && typeof state === 'object' && 'layout' in (state as any) && (state as any).layout ? Object.keys((state as any).layout as object) : []
            });

            // Vérifier que les paramètres sont valides
            if (rowId === undefined || rowId === null || !sizes || !Array.isArray(sizes)) {
                console.error("Paramètres invalides pour setRowSizes:", { rowId, rowIdStr, sizes });
                return;
            }

            // Accéder au layout de manière sécurisée
            let layout: Record<string, any> | undefined;

            // Vérifier si nous avons un état imbriqué (state.state.layout) ou direct (state.layout)
            if (state && typeof state === 'object' && 'state' in (state as any) && (state as any).state && typeof (state as any).state === 'object' && 'layout' in (state as any).state) {
                // Structure imbriquée: state.state.layout
                layout = (state as any).state.layout;
                console.log("Utilisation de state.state.layout");
            } else if (state && typeof state === 'object' && 'layout' in (state as any) && (state as any).layout) {
                // Structure directe: state.layout
                layout = (state as any).layout;
                console.log("Utilisation de state.layout");
            } else {
                console.error("Layout non disponible dans l'état", {
                    stateExists: !!state,
                    stateKeys: state && typeof state === 'object' ? Object.keys(state as object) : []
                });
                return;
            }

            // Vérifier que layout est défini
            if (!layout) {
                console.error("Layout est undefined après vérification");
                return;
            }

            console.log("setRowSizes - Layout trouvé:", {
                layoutExists: !!layout,
                layoutKeys: Object.keys(layout)
            });

            // Essayer d'abord avec la chaîne
            let layoutEntry = layout[rowIdStr];

            // Si pas trouvé et rowId est un nombre, essayer avec le nombre
            if (!layoutEntry && typeof rowId === 'number') {
                layoutEntry = layout[rowId];
            }

            // Si toujours pas trouvé, essayer avec toutes les clés pour voir si une correspondance existe
            if (!layoutEntry) {
                console.error(`Rangée avec l'id ${rowIdStr} non trouvée dans le layout`, {
                    layoutKeys: Object.keys(layout),
                    rowIdType: typeof rowId
                });

                // Essayer de trouver une correspondance approximative
                const keys = Object.keys(layout);
                for (const key of keys) {
                    if (key === rowIdStr || key === String(rowId) || Number(key) === Number(rowId)) {
                        console.log(`Correspondance trouvée pour ${rowIdStr} avec la clé ${key}`);
                        layoutEntry = layout[key];
                        rowId = key; // Utiliser la clé qui fonctionne
                        break;
                    }
                }

                if (!layoutEntry) {
                    return;
                }
            }

            const row = layoutEntry;
            console.log("setRowSizes - Row trouvé:", {
                rowId,
                rowIdStr,
                rowType: row.type,
                hasAreas: row.type === "area_row" && !!row.areas,
                areasLength: row.type === "area_row" && row.areas ? row.areas.length : 0,
                sizesLength: sizes.length
            });

            if (!row || row.type !== "area_row") {
                console.error(`Le layout avec l'id ${rowIdStr} n'est pas de type 'area_row'`);
                return;
            }

            if (!row.areas || !Array.isArray(row.areas) || row.areas.length === 0) {
                console.error(`La rangée ${rowIdStr} n'a pas de zones valides`);
                return;
            }

            // Vérifier si le nombre de tailles correspond au nombre de zones
            if (row.areas.length !== sizes.length) {
                console.error(`Le nombre de zones (${row.areas.length}) ne correspond pas au nombre de tailles (${sizes.length})`);

                // Ajuster les tailles pour qu'elles correspondent au nombre de zones
                if (sizes.length > row.areas.length) {
                    // Trop de tailles, on tronque
                    console.log(`Troncature des tailles: ${sizes.length} -> ${row.areas.length}`);
                    sizes = sizes.slice(0, row.areas.length);
                } else if (sizes.length < row.areas.length) {
                    // Pas assez de tailles, on complète avec des valeurs proportionnelles
                    const lastSize = sizes[sizes.length - 1] || 0;
                    const missingCount = row.areas.length - sizes.length;
                    const defaultSize = lastSize / missingCount;

                    console.log(`Ajout de ${missingCount} tailles manquantes avec la valeur ${defaultSize}`);
                    for (let i = 0; i < missingCount; i++) {
                        sizes.push(defaultSize);
                    }
                }

                console.log(`Tailles ajustées:`, sizes);
            }

            // Vérifier que les tailles sont valides (positives et leur somme est proche de la somme originale)
            const originalSum = row.areas.reduce((sum: number, area: any) => sum + (area.size || 0), 0);
            const newSum = sizes.reduce((sum: number, size: number) => sum + (size || 0), 0);

            console.log("setRowSizes - Sommes:", { originalSum, newSum });

            // Si la somme est nulle ou invalide, ne rien faire
            if (isNaN(originalSum) || isNaN(newSum) || newSum <= 0) {
                console.error("Sommes invalides:", { originalSum, newSum });
                return;
            }

            // Tolérance pour les erreurs d'arrondi
            if (Math.abs(originalSum - newSum) > 0.01) {
                console.warn(`La somme des nouvelles tailles (${newSum}) diffère significativement de la somme originale (${originalSum})`);
                // Normaliser les tailles pour maintenir la somme originale
                const factor = originalSum / newSum;
                row.areas = row.areas.map((area: any, i: number) => {
                    if (!area) return area;
                    return {
                        ...area,
                        size: (sizes[i] || 0) * factor
                    };
                });
            } else {
                // Appliquer les nouvelles tailles directement
                row.areas = row.areas.map((area: any, i: number) => {
                    if (!area) return area;
                    return {
                        ...area,
                        size: sizes[i] || 0
                    };
                });
            }

            console.log("setRowSizes - Fin avec succès");
        },

        wrapAreaInRow: (
            state,
            action: PayloadAction<{
                areaId: string;
                orientation: AreaRowOrientation;
            }>
        ) => {
            const { areaId, orientation } = action.payload;
            const areaToParentRow = computeAreaToParentRow(convertStateForCompute(state));
            const parentRowId = areaToParentRow[areaId];

            if (!parentRowId) {
                throw new Error("Not implemented.");
            }

            const parentRow = { ...(state.layout[parentRowId] as AreaRowLayout) };
            const newRow: AreaRowLayout = {
                type: "area_row",
                id: (state._id + 1).toString(),
                areas: [{ size: 1, id: areaId }],
                orientation,
            };

            parentRow.areas = parentRow.areas.map((area) => {
                if (area.id === areaId) {
                    return { ...area, id: newRow.id };
                }
                return area;
            });

            state._id = state._id + 1;
            state.layout[newRow.id] = newRow;
            state.layout[parentRow.id] = parentRow;
        },

        setAreaType: (
            state,
            action: PayloadAction<{
                areaId: string;
                type: AreaType;
                initialState?: any;
            }>
        ) => {
            const { areaId, type, initialState } = action.payload;
            const area = state.areas.entities[areaId];

            if (area) {
                state.areas.entities[areaId] = {
                    ...area,
                    type,
                    state: initialState || areaInitialStates[type]
                };
            }
        },

        dispatchToAreaState: (
            state,
            action: PayloadAction<{
                areaId: string;
                action: any;
            }>
        ) => {
            const { areaId, action: areaAction } = action.payload;
            const area = state.areas.entities[areaId];

            if (area) {
                const reducer = areaStateReducerRegistry[area.type];
                if (reducer) {
                    state.areas.entities[areaId] = {
                        ...area,
                        state: reducer(area.state as any, areaAction)
                    };
                }
            }
        },

        startTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (!state.temporaryAction) {
                state.temporaryAction = {
                    id: action.payload.actionId,
                    state: {
                        _id: state._id,
                        layout: JSON.parse(JSON.stringify(state.layout)),
                        areas: {
                            ids: [...state.areas.ids],
                            entities: JSON.parse(JSON.stringify(state.areas.entities))
                        },
                        joinPreview: state.joinPreview ? { ...state.joinPreview } : null,
                        rootId: state.rootId,
                        areaToOpen: state.areaToOpen ? {
                            position: { ...state.areaToOpen.position },
                            area: { ...state.areaToOpen.area }
                        } : null,
                        status: state.status,
                        error: state.error
                    }
                };
            }
        },
        commitTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (state.temporaryAction && state.temporaryAction.id === action.payload.actionId) {
                const { state: tempState } = state.temporaryAction;
                state._id = tempState._id;
                state.layout = tempState.layout;
                state.areas = tempState.areas;
                state.joinPreview = tempState.joinPreview;
                state.rootId = tempState.rootId;
                state.areaToOpen = tempState.areaToOpen;
                state.status = tempState.status;
                state.error = tempState.error;
                state.temporaryAction = null;
            }
        },
        cancelTemporaryAction: (state, action: PayloadAction<{ actionId: string }>) => {
            if (state.temporaryAction && state.temporaryAction.id === action.payload.actionId) {
                state.temporaryAction = null;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Initialize Area
            .addCase(initializeArea.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(initializeArea.fulfilled, (state, action) => {
                state.status = 'idle';
                const { id, type } = action.payload;
                state.areas.ids.push(id);
                state.areas.entities[id] = {
                    id,
                    type,
                    state: areaInitialStates[type]
                };
            })
            .addCase(initializeArea.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to initialize area';
            })

            // Update Layout
            .addCase(updateAreaLayout.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateAreaLayout.fulfilled, (state, action) => {
                state.status = 'idle';
                const { areaId, layout } = action.meta.arg;
                state.layout[areaId] = { ...state.layout[areaId], ...layout };
            })
            .addCase(updateAreaLayout.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to update layout';
            });
    }
});

// Log pour le débogage
console.log('Area slice initialized with state:', initialState);

// Export des actions
export const {
    setFields,
    setJoinAreasPreview,
    joinAreas,
    insertAreaIntoRow,
    convertAreaToRow,
    setRowSizes,
    wrapAreaInRow,
    setAreaType,
    dispatchToAreaState,
    addArea,
    updateArea,
    removeArea,
    startTemporaryAction,
    commitTemporaryAction,
    cancelTemporaryAction
} = areaSlice.actions;

// Export du reducer
export default areaSlice.reducer; 
