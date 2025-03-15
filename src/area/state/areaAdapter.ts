import { createEntityAdapter, EntityAdapter } from "@reduxjs/toolkit";
import { AreaType } from "~/constants";
import { Area } from "~/types/areaTypes";

// Extension du type Area pour inclure l'ID et l'index signature
export interface AreaWithId extends Area<AreaType> {
    id: string;
    [key: string]: any;
}

// Création de l'adaptateur avec les options explicites
export const areaAdapter: EntityAdapter<AreaWithId, string> = createEntityAdapter<AreaWithId>();

// Export des sélecteurs individuels
export const {
    selectById: selectAreaById,
    selectIds: selectAreaIds,
    selectEntities: selectAreaEntities,
    selectAll: selectAllAreas,
    selectTotal: selectTotalAreas,
} = areaAdapter.getSelectors(); 
