import { MouseEvent as ReactMouseEvent } from 'react';
import {
    AreaReducerState,
    convertAreaToRow,
    insertAreaIntoRow,
    joinAreas as joinAreasAction,
    setJoinAreasPreview,
    setRowSizes
} from '~/area/state/areaSlice';
import { computeAreaToParentRow } from '~/area/util/areaToParentRow';
import { computeAreaToViewport } from '~/area/util/areaToViewport';
import { AREA_MIN_CONTENT_WIDTH } from '~/constants';
import { isKeyDown } from '~/listener/keyboard';
import { store } from '~/state/store-init';
import { CardinalDirection, IntercardinalDirection } from '~/types';
import { AreaRowLayout } from '~/types/areaTypes';
import { capToRange, interpolate } from "~/util/math";
import { exceedsDirectionVector } from '~/util/math/exceedsDirectionVector';
import { Vec2 } from '~/util/math/vec2';

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

const getEligibleAreaIndices = (areaState: AreaReducerState, row: AreaRowLayout, index: number) => {
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

export const handleAreaDragFromCorner = (
	e: ReactMouseEvent,
	corner: IntercardinalDirection,
	areaId: string,
	viewport: Rect,
) => {
	const initialMousePosition = Vec2.fromEvent(e.nativeEvent);
	const directionParts = corner.split("") as [CardinalDirection, CardinalDirection];

	let mouseMoveStarted = false;
	let onMoveFn: ((mousePosition: Vec2) => void) | null = null;
	let currentAction: string | null = null;
	let pendingJoinAction: (() => void) | null = null;

	try {
		const areaState = store.getState().area.state;

		if (!areaState || !areaState.layout) {
			console.error('Invalid area state:', areaState);
			return;
		}

		const areaToRow = computeAreaToParentRow(areaState);
		const areaToViewport = computeAreaToViewport(
			areaState.layout,
			areaState.rootId,
			viewport
		);

		// Row does not exist if the area we are operating on is the root area
		const row = areaState.layout[areaToRow[areaId]] as AreaRowLayout | null;

		const createNewArea = (horizontal: boolean) => {
			const state = store.getState().area.state;
			
			const getT = (vec: Vec2): number => {
				const viewportSize = horizontal ? viewport.width : viewport.height;
				const minT = AREA_MIN_CONTENT_WIDTH / viewportSize;

				const t0 = horizontal ? viewport.left : viewport.top;
				const t1 = horizontal
					? viewport.left + viewport.width
					: viewport.top + viewport.height;

				const val = horizontal ? vec.x : vec.y;
				return capToRange(minT, 1 - minT, (val - t0) / (t1 - t0));
			};

			// Si on est en mode Alt, on ne crée pas de nouvelle zone
			if (isKeyDown("Alt")) {
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
				store.dispatch(convertAreaToRow({ 
					areaId, 
					cornerParts: directionParts, 
					horizontal
				}));

				const newMoveFn: MoveFn = (vec: Vec2) => {
					const t = getT(vec);
					store.dispatch(setRowSizes({
						rowId: areaId,
						sizes: [t, 1 - t]
					}));
				};
				onMoveFn = newMoveFn;
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

			store.dispatch(insertAreaIntoRow({
				rowId: row.id,
				area: { ...state.areas[areaId] },
				insertIndex
			}));

			const newMoveFn: MoveFn = (vec: Vec2) => {
				const t = getT(vec);
				const sizes = [t, 1 - t].map((v) => interpolate(0, sizeToShare, v));
				const rowAreas = row.areas.map((area: AreaRowArea) => area.size);
				rowAreas.splice(insertIndex, 0, 0);
				rowAreas[areaIndex] = sizes[0];
				rowAreas[areaIndex + 1] = sizes[1];
				
				store.dispatch(setRowSizes({
					rowId: row.id,
					sizes: rowAreas
				}));
			};
			onMoveFn = newMoveFn;
		};

		const onMouseMove = (moveEvent: MouseEvent) => {
			const vec = Vec2.fromEvent(moveEvent);
			const moveVec = vec.sub(initialMousePosition);
			const isAltDown = isKeyDown("Alt");

			// Gérer la fusion si Alt est enfoncé
			if (isAltDown && row) {
				const areaIndex = row.areas.map((area: AreaRowArea) => area.id).indexOf(areaId);
				
				// Vérifier si le mouvement est suffisant pour déclencher la fusion
				for (let i = 0; i < directionParts.length; i += 1) {
					const direction = directionParts[i] as keyof typeof directionVectors;
					const exceedsAxis = exceedsDirectionVector(
						directionVectors[direction],
						AREA_MIN_CONTENT_WIDTH / 2,
						moveVec,
					);

					if (exceedsAxis) {
						const horizontal = exceedsAxis === "x";
						if ((horizontal ? viewport.width : viewport.height) >= AREA_MIN_CONTENT_WIDTH * 2) {
							const eligibleAreaIndices = getEligibleAreaIndices(areaState, row, areaIndex);
							const getEligibleAreaIds = (indices: number[]) => indices.map((i) => row.areas[i].id);

							// Déterminer la direction de fusion en fonction du coin et du mouvement
							let targetIndex: number;
							let arrowDirection: CardinalDirection;

							if (horizontal) {
								if (directionParts.includes("w")) {
									targetIndex = areaIndex - 1;
									arrowDirection = "w";
								} else {
									targetIndex = areaIndex + 1;
									arrowDirection = "e";
								}
							} else {
								if (directionParts.includes("n")) {
									targetIndex = areaIndex - 1;
									arrowDirection = "n";
								} else {
									targetIndex = areaIndex + 1;
									arrowDirection = "s";
								}
							}

							const targetAreaId = row.areas[targetIndex]?.id;
							if (targetAreaId) {
								store.dispatch(setJoinAreasPreview({
									areaId: targetAreaId,
									from: arrowDirection,
									eligibleAreaIds: getEligibleAreaIds(eligibleAreaIndices)
								}));

								pendingJoinAction = () => {
									store.dispatch(joinAreasAction({
										areaRowId: row.id,
										areaIndex: Math.min(areaIndex, targetIndex),
										mergeInto: targetIndex > areaIndex ? 1 : -1
									}));
								};
								return;
							}
						}
					}

					const exceedsOpposite = exceedsDirectionVector(
						oppositeDirectionVectors[direction],
						AREA_MIN_CONTENT_WIDTH / 2,
						moveVec,
					);

					if (exceedsOpposite) {
						const horizontal = exceedsOpposite === "x";
						if ((horizontal ? viewport.width : viewport.height) >= AREA_MIN_CONTENT_WIDTH * 2) {
							const eligibleAreaIndices = getEligibleAreaIndices(areaState, row, areaIndex);
							const getEligibleAreaIds = (indices: number[]) => indices.map((i) => row.areas[i].id);

							// Déterminer la direction de fusion pour le mouvement opposé
							let targetIndex: number;
							let arrowDirection: CardinalDirection;

							if (horizontal) {
								if (directionParts.includes("e")) {
									targetIndex = areaIndex + 1;
									arrowDirection = "e";
								} else {
									targetIndex = areaIndex - 1;
									arrowDirection = "w";
								}
							} else {
								if (directionParts.includes("s")) {
									targetIndex = areaIndex + 1;
									arrowDirection = "s";
								} else {
									targetIndex = areaIndex - 1;
									arrowDirection = "n";
								}
							}

							const targetAreaId = row.areas[targetIndex]?.id;
							if (targetAreaId) {
								store.dispatch(setJoinAreasPreview({
									areaId: targetAreaId,
									from: arrowDirection,
									eligibleAreaIds: getEligibleAreaIds(eligibleAreaIndices)
								}));

								pendingJoinAction = () => {
									store.dispatch(joinAreasAction({
										areaRowId: row.id,
										areaIndex: Math.min(areaIndex, targetIndex),
										mergeInto: targetIndex > areaIndex ? 1 : -1
									}));
								};
								return;
							}
						}
					}
				}
			}

			// Si on n'est pas en mode fusion (Alt non enfoncé), gérer la création de zone
			if (!mouseMoveStarted && !isAltDown) {
				for (let i = 0; i < directionParts.length; i += 1) {
					const direction = directionParts[i] as keyof typeof directionVectors;
					const exceedsAxis = exceedsDirectionVector(
						directionVectors[direction],
						AREA_MIN_CONTENT_WIDTH / 2,
						moveVec,
					);

					if (exceedsAxis) {
						const horizontal = exceedsAxis === "x";
						mouseMoveStarted = true;
						createNewArea(horizontal);
						break;
					}
				}
			}

			// Effacer l'aperçu de fusion si Alt n'est pas enfoncé
			if (!isAltDown) {
				store.dispatch(setJoinAreasPreview({
					areaId: null,
					from: null,
					eligibleAreaIds: []
				}));
				pendingJoinAction = null;
			}

			if (onMoveFn) {
				onMoveFn(vec);
			}
		};

		const onMouseUp = () => {
			// Exécuter l'action de fusion en attente si elle existe et que Alt est toujours enfoncé
			if (pendingJoinAction && isKeyDown("Alt")) {
				pendingJoinAction();
				// Réinitialiser tous les états
				mouseMoveStarted = false;
				onMoveFn = null;
				currentAction = null;
				pendingJoinAction = null;
			}

			// Nettoyer l'aperçu de fusion
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
