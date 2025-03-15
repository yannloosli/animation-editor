import { MouseEvent as ReactMouseEvent } from 'react';
import { selectAreaLayout, selectAreas, selectAreaState, selectRootId } from '~/area/state/areaSelectors';
import {
    convertAreaToRow,
    insertAreaIntoRow,
    joinAreas as joinAreasAction,
    setJoinAreasPreview,
    setRowSizes
} from '~/area/state/areaSlice';
import { AreaReducerState as AreaReducerStateType } from '~/area/types';
import { computeAreaToParentRow } from '~/area/util/areaToParentRow';
import { computeAreaToViewport } from '~/area/util/areaToViewport';
import { getAreaRootViewport } from '~/area/util/getAreaViewport';
import { AREA_MIN_CONTENT_WIDTH } from '~/constants';
import { isKeyDown } from '~/listener/keyboard';
import { store } from '~/state/store-init';
import { CardinalDirection, IntercardinalDirection } from '~/types';
import { AreaRowLayout } from '~/types/areaTypes';
import { Rect } from '~/types/rect';
import { capToRange } from "~/util/math";
import { exceedsDirectionVector } from '~/util/math/exceedsDirectionVector';
import { Vec2 } from '~/util/math/vec2';
import { convertToRectXY, isRectXY, RectXY } from '~/util/rectUtils';

// Fonction d'interpolation pour calculer les tailles des zones
function interpolate(min: number, max: number, t: number): number {
    return min + (max - min) * t;
}

type MoveFn = (mousePosition: Vec2) => void;

interface AreaRowArea {
    id: string;
    size: number;
}

const directionVectors = {
    n: { x: 0, y: 1 },
    s: { x: 0, y: -1 },
    w: { x: 1, y: 0 },
    e: { x: -1, y: 0 },
} as const;

const oppositeDirectionVectors = {
    n: directionVectors.s,
    s: directionVectors.n,
    w: directionVectors.e,
    e: directionVectors.w,
} as const;

const getEligibleAreaIndices = (areaState: AreaReducerStateType, row: AreaRowLayout, index: number) => {
    // Si la rangée ne contient que deux éléments, permettre la fusion dans les deux directions
    if (row.areas.length === 2) {
        return [0, 1].filter((i) => i !== index && areaState.layout[row.areas[i].id].type === "area");
    }

    // Sinon, comportement normal : vérifier les indices adjacents
    return [index - 1, index + 1].filter((i) => {
        if (i < 0 || i > row.areas.length - 1) {
            return false;
        }
        return areaState.layout[row.areas[i].id].type === "area";
    });
};

const getArrowDirection = (
    row: AreaRowLayout,
    oldAreaIndex: number,
    newAreaIndex: number,
): CardinalDirection => {
    // Si la rangée ne contient que deux éléments, utiliser la direction du mouvement de la souris
    if (row.areas.length === 2) {
        if (row.orientation === "horizontal") {
            return oldAreaIndex === 0 ? "e" : "w";
        }
        return oldAreaIndex === 0 ? "s" : "n";
    }

    // Sinon, comportement normal
    if (row.orientation === "horizontal") {
        return newAreaIndex > oldAreaIndex ? "e" : "w";
    }
    return newAreaIndex > oldAreaIndex ? "s" : "n";
};

/**
 * Gère le glisser-déposer à partir d'un coin d'une zone
 * @param e Événement de souris React
 * @param corner Direction du coin (ne, nw, se, sw)
 * @param areaId ID de la zone
 * @param viewport Rectangle du viewport de la zone
 */
export const handleAreaDragFromCorner = (
    e: ReactMouseEvent,
    corner: IntercardinalDirection,
    areaId: string,
    viewport: Rect,
) => {
    console.log('handleAreaDragFromCorner - DÉBUT', { corner, areaId, viewport });
    console.log('Alt key pressed:', isKeyDown("Alt"));

    // Convertir le viewport au format x/y si nécessaire
    const normalizedViewport: RectXY = isRectXY(viewport)
        ? viewport as RectXY
        : convertToRectXY(viewport);

    const initialMousePosition = Vec2.fromEvent(e.nativeEvent);
    const directionParts = corner.split("") as [CardinalDirection, CardinalDirection];

    let mouseMoveStarted = false;
    let onMoveFn: ((mousePosition: Vec2) => void) | null = null;
    let currentAction: string | null = null;
    let pendingJoinAction: (() => void) | null = null;

    try {
        // Utiliser les sélecteurs pour obtenir l'état
        const state = store.getState();
        const areaState = selectAreaState(state);
        const layout = selectAreaLayout(state);
        const rootId = selectRootId(state);
        const areas = selectAreas(state);

        console.log('État récupéré:', {
            areaState: areaState ? 'disponible' : 'non disponible',
            layout: layout ? 'disponible' : 'non disponible',
            rootId: rootId || 'non disponible',
            areas: areas ? Object.keys(areas).length + ' zones' : 'non disponible'
        });

        if (!areaState || !layout || !rootId) {
            console.error('État invalide pour le gestionnaire areaDragFromCorner:', { areaState, layout, rootId });
            return;
        }

        const areaToRow = computeAreaToParentRow(areaState);
        console.log('areaToRow:', areaToRow);
        console.log('areaId:', areaId);
        console.log('areaToRow[areaId]:', areaToRow[areaId]);

        const rootViewport = getAreaRootViewport();

        if (!rootViewport) {
            console.error('Impossible d\'obtenir le viewport racine');
            return;
        }

        const areaToViewport = computeAreaToViewport(layout, rootId, rootViewport);

        // Row does not exist if the area we are operating on is the root area
        const rowId = areaToRow[areaId];
        if (!rowId) {
            console.log('Pas de rowId pour cette zone, c\'est probablement la zone racine');
        }

        const row = rowId ? layout[rowId] as AreaRowLayout | null : null;
        console.log('Row pour cette zone:', row);

        const createNewArea = (horizontal: boolean) => {
            console.log('createNewArea appelé avec horizontal:', horizontal);
            console.log('Alt key pressed dans createNewArea:', isKeyDown("Alt"));

            const getT = (vec: Vec2): number => {
                const viewportSize = horizontal ? normalizedViewport.width : normalizedViewport.height;
                const minT = AREA_MIN_CONTENT_WIDTH / viewportSize;

                const t0 = horizontal ? normalizedViewport.x : normalizedViewport.y;
                const t1 = horizontal
                    ? normalizedViewport.x + normalizedViewport.width
                    : normalizedViewport.y + normalizedViewport.height;

                const val = horizontal ? vec.x : vec.y;
                return capToRange(minT, 1 - minT, (val - t0) / (t1 - t0));
            };

            // Si on est en mode Alt, on ne crée pas de nouvelle zone
            if (isKeyDown("Alt")) {
                console.log('Mode Alt activé, pas de création de nouvelle zone');
                return;
            }

            // The area whose corner was clicked will be converted into an area with
            // two rows if either of the following apply:
            //
            //      1.  The area does not have a parent row.
            //      2.  The parent row's orientation does NOT equal the direction that the
            //          mouse was moved in to trigger the creation of the area.
            //
            if (!row || row.orientation !== (horizontal ? "horizontal" : "vertical")) {
                console.log('Conversion de la zone en rangée:', { areaId, directionParts, horizontal });

                try {
                    // Vérifier l'état avant la conversion
                    const beforeState = store.getState();
                    const beforeLayout = selectAreaLayout(beforeState);
                    console.log('État du layout avant conversion:', {
                        hasLayout: !!beforeLayout,
                        layoutKeys: beforeLayout ? Object.keys(beforeLayout) : [],
                        areaExists: beforeLayout && beforeLayout[areaId],
                        areaType: beforeLayout && beforeLayout[areaId] ? beforeLayout[areaId].type : 'N/A'
                    });

                    // Dispatch l'action et attendre que l'état soit mis à jour
                    store.dispatch(convertAreaToRow({
                        areaId,
                        cornerParts: directionParts,
                        horizontal
                    }));

                    // Vérifier que la conversion a bien eu lieu
                    const updatedState = store.getState();
                    const updatedLayout = selectAreaLayout(updatedState);
                    console.log('Layout après conversion:', {
                        hasLayout: !!updatedLayout,
                        layoutKeys: updatedLayout ? Object.keys(updatedLayout) : [],
                        areaExists: updatedLayout && updatedLayout[areaId],
                        areaType: updatedLayout && updatedLayout[areaId] ? updatedLayout[areaId].type : 'N/A'
                    });

                    if (!updatedLayout) {
                        console.error('Layout non disponible après conversion');
                        return;
                    }

                    if (!updatedLayout[areaId]) {
                        console.error(`Area ${areaId} non trouvée dans le layout après conversion`);
                        return;
                    }

                    if (updatedLayout[areaId].type !== 'area_row') {
                        console.error(`Area ${areaId} n'est pas de type 'area_row' après conversion:`, updatedLayout[areaId]);
                        return;
                    }

                    const newMoveFn: MoveFn = (vec: Vec2) => {
                        const t = getT(vec);
                        console.log('Mise à jour des tailles de rangée:', { rowId: areaId, t });

                        // Vérifier si l'état a changé depuis le début du glisser-déposer
                        const currentState = store.getState();
                        const currentLayout = selectAreaLayout(currentState);
                        console.log('État actuel du layout:', {
                            hasLayout: !!currentLayout,
                            layoutKeys: currentLayout ? Object.keys(currentLayout) : [],
                            areaExists: currentLayout && currentLayout[areaId],
                            areaType: currentLayout && currentLayout[areaId] ? currentLayout[areaId].type : 'N/A'
                        });

                        if (currentLayout && currentLayout[areaId] && currentLayout[areaId].type === 'area_row') {
                            store.dispatch(setRowSizes({
                                rowId: areaId,
                                sizes: [t, 1 - t]
                            }));
                        } else {
                            console.error(`Row with id ${areaId} not found in layout or not of type 'area_row'`);
                        }
                    };
                    onMoveFn = newMoveFn;
                } catch (error) {
                    console.error('Erreur lors de la conversion de la zone en rangée:', error);
                }
                return;
            }

            // The row exists and the mouse moved in the direction of the row's orientation.
            //
            // We insert the new area before the selected area if:
            //      1.  The mouse moved horizontally and one of the 'w' (west) corners was
            //          clicked.
            //      2.  OR the mouse moved vertically and one of the 'n' (north) corners
            //          was clicked.

            const areaIndex = row.areas.map((area: AreaRowArea) => area.id).indexOf(areaId);
            const insertIndex =
                areaIndex + (directionParts.indexOf(horizontal ? "w" : "n") !== -1 ? 0 : 1);

            const sizeToShare = row.areas[areaIndex].size;
            const area = areas[areaId];

            console.log('Insertion d\'une nouvelle zone:', {
                areaIndex,
                insertIndex,
                sizeToShare,
                area: area ? 'disponible' : 'non disponible',
                rowId: row.id,
                rowType: row.type,
                rowAreas: row.areas,
                rowAreasLength: row.areas.length
            });

            if (!area) {
                console.error(`Area ${areaId} not found in areas`);
                return;
            }

            // Créer une copie de l'area avec l'ID explicitement défini
            const areaCopy = {
                ...area,
                id: areaId
            };

            console.log('Insertion de la zone dans la rangée:', {
                rowId: row.id,
                rowIdType: typeof row.id,
                insertIndex,
                areaCopy
            });

            try {
                // Dispatch l'action et attendre que l'état soit mis à jour
                store.dispatch(insertAreaIntoRow({
                    rowId: String(row.id),
                    area: areaCopy,
                    insertIndex
                }));

                // Vérifier que l'insertion a bien eu lieu
                const updatedState = store.getState();
                const updatedLayout = selectAreaLayout(updatedState);
                console.log('Layout après insertion:', {
                    hasLayout: !!updatedLayout,
                    layoutKeys: updatedLayout ? Object.keys(updatedLayout) : [],
                    rowExists: updatedLayout && updatedLayout[row.id],
                    rowType: updatedLayout && updatedLayout[row.id] ? updatedLayout[row.id].type : 'N/A',
                    rowAreas: updatedLayout && updatedLayout[row.id] && updatedLayout[row.id].type === 'area_row'
                        ? (updatedLayout[row.id] as AreaRowLayout).areas
                        : 'N/A'
                });

                if (updatedLayout && updatedLayout[row.id]) {
                    const newMoveFn: MoveFn = (vec: Vec2) => {
                        const t = getT(vec);
                        const sizes = [t, 1 - t].map((v) => interpolate(0, sizeToShare, v));

                        // Récupérer les tailles actuelles des zones
                        const currentState = store.getState();
                        const currentLayout = selectAreaLayout(currentState);

                        if (!currentLayout || !currentLayout[row.id]) {
                            console.error(`Row with id ${row.id} not found in current layout`);
                            return;
                        }

                        const currentRow = currentLayout[row.id] as AreaRowLayout;
                        if (!currentRow || currentRow.type !== 'area_row' || !currentRow.areas) {
                            console.error(`Invalid row structure for id ${row.id}:`, currentRow);
                            return;
                        }

                        // Créer un tableau de tailles basé sur les zones actuelles
                        const rowAreas = currentRow.areas.map((area: AreaRowArea) => area.size || 0);

                        console.log('Structure actuelle de la rangée:', {
                            rowId: row.id,
                            areasCount: currentRow.areas.length,
                            currentSizes: rowAreas,
                            newSizes: sizes,
                            areaIndex,
                            insertIndex
                        });

                        // Mettre à jour les tailles des zones concernées
                        // Nous devons nous assurer que les indices sont corrects après l'insertion
                        const targetIndices = areaIndex < insertIndex
                            ? [areaIndex, areaIndex + 1]
                            : [areaIndex - 1, areaIndex];

                        console.log('Indices cibles pour les nouvelles tailles:', targetIndices);

                        // Mettre à jour les tailles aux indices cibles
                        if (targetIndices[0] >= 0 && targetIndices[0] < rowAreas.length) {
                            rowAreas[targetIndices[0]] = sizes[0];
                        }

                        if (targetIndices[1] >= 0 && targetIndices[1] < rowAreas.length) {
                            rowAreas[targetIndices[1]] = sizes[1];
                        }

                        console.log('Mise à jour des tailles de rangée après insertion:', {
                            rowId: row.id,
                            rowIdType: typeof row.id,
                            finalSizes: rowAreas
                        });

                        // Dispatch l'action avec les tailles mises à jour
                        store.dispatch(setRowSizes({
                            rowId: String(row.id),
                            sizes: rowAreas
                        }));
                    };
                    onMoveFn = newMoveFn;
                } else {
                    console.error('L\'insertion de la zone dans la rangée a échoué');
                }
            } catch (error) {
                console.error('Erreur lors de l\'insertion de la zone dans la rangée:', error);
                return;
            }
        };

        const onMouseMove = (moveEvent: MouseEvent) => {
            const vec = Vec2.fromEvent(moveEvent);
            const moveVec = vec.sub(initialMousePosition);
            const isAltDown = isKeyDown("Alt");

            console.log('onMouseMove:', {
                moveVec: { x: moveVec.x, y: moveVec.y },
                isAltDown,
                mouseMoveStarted
            });

            // Gérer la fusion si Alt est enfoncé
            if (isAltDown && row) {
                console.log('Mode fusion (Alt) activé');
                const areaIndex = row.areas.map((area: AreaRowArea) => area.id).indexOf(areaId);
                const eligibleAreaIndices = getEligibleAreaIndices(areaState, row, areaIndex);
                const getEligibleAreaIds = (indices: number[]) => indices.map((i) => row.areas[i].id);

                // Vérifier si le mouvement est suffisant pour déclencher la fusion
                for (let i = 0; i < directionParts.length; i += 1) {
                    const direction = directionParts[i] as keyof typeof directionVectors;
                    const exceedsAxis = exceedsDirectionVector(
                        directionVectors[direction],
                        AREA_MIN_CONTENT_WIDTH / 2,
                        moveVec,
                    );

                    console.log('Vérification de dépassement de seuil:', {
                        direction,
                        exceedsAxis,
                        threshold: AREA_MIN_CONTENT_WIDTH / 2
                    });

                    if (exceedsAxis) {
                        const horizontal = exceedsAxis === "x";
                        if ((horizontal ? normalizedViewport.width : normalizedViewport.height) >= AREA_MIN_CONTENT_WIDTH * 2) {
                            console.log('Indices de zones éligibles pour fusion:', eligibleAreaIndices);

                            // Déterminer la direction de fusion en fonction du coin et du mouvement
                            let targetIndex: number | null = null;
                            let arrowDirection: CardinalDirection | null = null;

                            // Déterminer la direction de fusion en fonction de l'orientation de la rangée
                            if (row.orientation === "horizontal") {
                                // Pour une rangée horizontale
                                if (direction === "w") {
                                    targetIndex = areaIndex - 1;
                                    arrowDirection = "w";
                                } else if (direction === "e") {
                                    targetIndex = areaIndex + 1;
                                    arrowDirection = "e";
                                }
                            } else {
                                // Pour une rangée verticale
                                if (direction === "n") {
                                    targetIndex = areaIndex - 1;
                                    arrowDirection = "n";
                                } else if (direction === "s") {
                                    targetIndex = areaIndex + 1;
                                    arrowDirection = "s";
                                }
                            }

                            console.log('Cible pour fusion:', { targetIndex, arrowDirection });

                            // Vérifier que l'index cible est valide
                            if (targetIndex !== null && targetIndex >= 0 && targetIndex < row.areas.length) {
                                const targetAreaId = row.areas[targetIndex].id;
                                console.log('Configuration de l\'aperçu de fusion:', {
                                    areaId: targetAreaId,
                                    from: arrowDirection,
                                    eligibleAreaIds: getEligibleAreaIds(eligibleAreaIndices)
                                });

                                store.dispatch(setJoinAreasPreview({
                                    areaId: targetAreaId,
                                    from: arrowDirection,
                                    eligibleAreaIds: getEligibleAreaIds(eligibleAreaIndices)
                                }));

                                pendingJoinAction = () => {
                                    console.log('Exécution de l\'action de fusion:', {
                                        areaRowId: row.id,
                                        areaIndex: Math.min(areaIndex, targetIndex),
                                        mergeInto: targetIndex > areaIndex ? 1 : -1
                                    });

                                    try {
                                        // Vérifier l'état du store avant de dispatcher l'action
                                        const currentState = store.getState();
                                        console.log('État du store avant fusion:', {
                                            hasArea: !!currentState.area,
                                            areaKeys: currentState.area ? Object.keys(currentState.area) : [],
                                            hasLayout: currentState.area && currentState.area.layout,
                                            layoutKeys: currentState.area && currentState.area.layout ? Object.keys(currentState.area.layout) : [],
                                            rowExists: currentState.area && currentState.area.layout && currentState.area.layout[row.id],
                                            rowType: currentState.area && currentState.area.layout && currentState.area.layout[row.id] ? currentState.area.layout[row.id].type : 'N/A'
                                        });

                                        store.dispatch(joinAreasAction({
                                            areaRowId: String(row.id),
                                            areaIndex: Math.min(areaIndex, targetIndex),
                                            mergeInto: targetIndex > areaIndex ? 1 : -1
                                        }));

                                        console.log('Action de fusion dispatched avec succès');

                                        // Vérifier l'état du store après le dispatch
                                        const updatedState = store.getState();
                                        console.log('État du store après fusion:', {
                                            hasArea: !!updatedState.area,
                                            areaKeys: updatedState.area ? Object.keys(updatedState.area) : [],
                                            hasLayout: updatedState.area && updatedState.area.layout,
                                            layoutKeys: updatedState.area && updatedState.area.layout ? Object.keys(updatedState.area.layout) : []
                                        });
                                    } catch (error) {
                                        console.error('Erreur lors du dispatch de l\'action de fusion:', error);
                                    }
                                };
                                return;
                            }
                        }
                    }
                }
            }

            // Si on n'est pas en mode fusion (Alt non enfoncé), gérer la création de zone
            if (!mouseMoveStarted && !isAltDown) {
                console.log('Vérification pour création de nouvelle zone');
                for (let i = 0; i < directionParts.length; i += 1) {
                    const direction = directionParts[i] as keyof typeof directionVectors;
                    const exceedsAxis = exceedsDirectionVector(
                        directionVectors[direction],
                        AREA_MIN_CONTENT_WIDTH / 2,
                        moveVec,
                    );

                    console.log('Vérification de dépassement pour création:', {
                        direction,
                        exceedsAxis,
                        threshold: AREA_MIN_CONTENT_WIDTH / 2
                    });

                    if (exceedsAxis) {
                        const horizontal = exceedsAxis === "x";
                        console.log('Démarrage de la création de zone:', { horizontal });
                        mouseMoveStarted = true;
                        createNewArea(horizontal);
                        break;
                    }
                }
            }

            // Effacer l'aperçu de fusion si Alt n'est pas enfoncé
            if (!isAltDown) {
                console.log('Effacement de l\'aperçu de fusion (Alt non enfoncé)');
                store.dispatch(setJoinAreasPreview({
                    areaId: null,
                    from: null,
                    eligibleAreaIds: []
                }));
                pendingJoinAction = null;
            }

            if (onMoveFn) {
                console.log('Appel de la fonction de déplacement');
                onMoveFn(vec);
            }
        };

        const onMouseUp = () => {
            console.log('onMouseUp - Alt key pressed:', isKeyDown("Alt"));

            // Exécuter l'action de fusion en attente si elle existe et que Alt est toujours enfoncé
            if (pendingJoinAction && isKeyDown("Alt")) {
                console.log('Exécution de l\'action de fusion en attente');
                try {
                    pendingJoinAction();
                    console.log('Action de fusion exécutée avec succès');
                } catch (error) {
                    console.error('Erreur lors de l\'exécution de l\'action de fusion:', error);
                }

                // Réinitialiser tous les états
                mouseMoveStarted = false;
                onMoveFn = null;
                currentAction = null;
                pendingJoinAction = null;
            }

            // Nettoyer l'aperçu de fusion
            console.log('Nettoyage de l\'aperçu de fusion');
            store.dispatch(setJoinAreasPreview({
                areaId: null,
                from: null,
                eligibleAreaIds: []
            }));

            // S'assurer que le curseur est libéré
            const cursorCapture = document.querySelector('[data-area-root] .cursorCapture') as HTMLElement;
            if (cursorCapture) {
                cursorCapture.style.pointerEvents = 'none';
            }

            window.removeEventListener('mousemove', onMouseMove as any);
            window.removeEventListener('mouseup', onMouseUp);

            console.log('handleAreaDragFromCorner - FIN');
        };

        window.addEventListener('mousemove', onMouseMove as any);
        window.addEventListener('mouseup', onMouseUp);
    } catch (error) {
        console.error("Error in handleAreaDragFromCorner:", error);
        // En cas d'erreur, s'assurer que tout est nettoyé
        store.dispatch(setJoinAreasPreview({
            areaId: null,
            from: null,
            eligibleAreaIds: []
        }));
        const cursorCapture = document.querySelector('[data-area-root] .cursorCapture') as HTMLElement;
        if (cursorCapture) {
            cursorCapture.style.pointerEvents = 'none';
        }
    }
};
