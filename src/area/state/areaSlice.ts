import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { areaStateReducerRegistry } from "~/area/areaRegistry";
import { areaInitialStates } from "~/area/state/areaInitialStates";
import { AreaState } from "~/area/types";
import { computeAreaToParentRow } from "~/area/util/areaToParentRow";
import { joinAreas as joinAreasUtil } from "~/area/util/joinArea";
import { AreaType } from "~/constants";
import { CardinalDirection } from "~/types";
import { Area, AreaRowLayout, AreaRowOrientation } from "~/types/areaTypes";

export const initialState: AreaState = {
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
		"1": {
			type: AreaType.Project,
			state: {},
		},
		"2": {
			type: AreaType.Workspace,
			state: {
				compositionId: "default",
				pan: { x: 0, y: 0 },
				scale: 1,
				selectionRect: null,
			},
		}
	},
	joinPreview: null,
	rootId: "0",
	areaToOpen: null,
};

export const areaSlice = createSlice({
	name: "area",
	initialState,
	reducers: {
		setFields: (state, action: PayloadAction<Partial<AreaState>>) => {
			Object.assign(state, action.payload);
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
				areaRowId: string;
				areaIndex: number;
				mergeInto: -1 | 1;
			}>
		) => {
			const { areaRowId, areaIndex, mergeInto } = action.payload;

			const row = state.layout[areaRowId] as AreaRowLayout;
			const { area, removedAreaId } = joinAreasUtil(row, areaIndex, mergeInto);

			const shouldRemoveRow = row.areas.length === 2;
			const areaToParentRow = computeAreaToParentRow(state);

			// Update rootId if needed
			if (shouldRemoveRow && state.rootId === row.id) {
				state.rootId = area.id;
			}

			// Update layout
			Object.keys(state.layout).forEach((id) => {
				if (id === removedAreaId || (shouldRemoveRow && id === row.id)) {
					delete state.layout[id];
					return;
				}

				if (id === areaToParentRow[row.id]) {
					const parentRow = state.layout[id] as AreaRowLayout;
					parentRow.areas = parentRow.areas.map((x) =>
						x.id === row.id ? { id: area.id, size: x.size } : x,
					);
				} else if (id === area.id) {
					state.layout[id] = area;
				}
			});

			// S'assurer que l'area restante a un état valide
			const remainingAreaId = area.id;
			if (!state.areas[remainingAreaId] || !state.areas[remainingAreaId].state) {
				// Copier l'état de l'area supprimée si nécessaire
				state.areas[remainingAreaId] = {
					...state.areas[removedAreaId],
					state: { ...state.areas[removedAreaId].state }
				};
			}

			// Update areas
			delete state.areas[removedAreaId];

			// Clear join preview
			state.joinPreview = null;
		},

		insertAreaIntoRow: (
			state,
			action: PayloadAction<{
				rowId: string;
				area: Area;
				insertIndex: number;
			}>
		) => {
			const { rowId, area, insertIndex } = action.payload;
			const row = state.layout[rowId] as AreaRowLayout;
			const areas = [...row.areas];
			const newAreaId = (state._id + 1).toString();

			areas.splice(insertIndex, 0, { id: newAreaId, size: 0 });

			state._id = state._id + 1;
			state.layout[row.id] = { ...row, areas };
			state.layout[newAreaId] = { type: "area", id: newAreaId };
			state.areas[newAreaId] = area;
		},

		convertAreaToRow: (
			state,
			action: PayloadAction<{
				areaId: string;
				cornerParts: [CardinalDirection, CardinalDirection];
				horizontal: boolean;
			}>
		) => {
			const { cornerParts, areaId, horizontal } = action.payload;

			// Vérifier que l'area existe et est du bon type
			const originalLayout = state.layout[areaId];
			
			if (!originalLayout || originalLayout.type !== "area") {
				console.error('Invalid area:', { 
					exists: !!originalLayout, 
					type: originalLayout?.type 
				});
				return;
			}

			// Sauvegarder l'état original de l'area
			const originalArea = state.areas[areaId];
			
			if (!originalArea) {
				console.error('Original area not found:', areaId);
				return;
			}

			try {
				// Incrémenter l'ID pour les nouvelles areas
				const idForOldArea = (state._id + 1).toString();
				const idForNewArea = (state._id + 2).toString();
				state._id += 2;

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
				state.areas[idForOldArea] = { ...originalArea };
				state.areas[idForNewArea] = { ...originalArea };

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
					id: areaId,
					areas: rowAreas,
					orientation: horizontal ? "horizontal" as const : "vertical" as const
				};

				// Mettre à jour le layout
				state.layout[areaId] = newRow;

				// Supprimer l'area originale du state.areas car elle est maintenant une row
				delete state.areas[areaId];

			} catch (error) {
				console.error('Error during conversion:', error);
				// En cas d'erreur, on restaure l'état original
				state.layout[areaId] = originalLayout;
				state.areas[areaId] = originalArea;
				throw error;
			}
		},

		setRowSizes: (
			state,
			action: PayloadAction<{
				rowId: string;
				sizes: number[];
			}>
		) => {
			const { rowId, sizes } = action.payload;
			const row = state.layout[rowId];

			if (row.type !== "area_row") {
				throw new Error("Expected layout to be of type 'area_row'.");
			}

			if (row.areas.length !== sizes.length) {
				throw new Error("Expected row areas to be the same length as sizes.");
			}

			row.areas = row.areas.map((area, i) => ({ ...area, size: sizes[i] }));
		},

		wrapAreaInRow: (
			state,
			action: PayloadAction<{
				areaId: string;
				orientation: AreaRowOrientation;
			}>
		) => {
			const { areaId, orientation } = action.payload;
			const areaToParentRow = computeAreaToParentRow(state);
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
			const area = state.areas[areaId];

			if (area) {
				area.type = type;
				area.state = initialState || areaInitialStates[type];
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
			const area = state.areas[areaId];

			if (area) {
				area.state = areaStateReducerRegistry[area.type](area.state as any, areaAction);
			}
		},
	},
});

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
} = areaSlice.actions;

// Export du reducer
export default areaSlice.reducer; 
