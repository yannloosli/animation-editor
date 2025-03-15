import { createAsyncThunk } from '@reduxjs/toolkit';
import { AreaType } from '~/constants';
import { RootState } from '~/state/store-init';
import { AreaLayout } from '~/types/areaTypes';

export const initializeArea = createAsyncThunk(
    'area/initialize',
    async (params: { areaId: string; type: AreaType }, { rejectWithValue }) => {
        try {
            // Simulation d'une opération async
            const response = await new Promise<{ id: string; type: AreaType }>(resolve =>
                setTimeout(() => resolve({ id: params.areaId, type: params.type }), 100)
            );
            return response;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateAreaLayout = createAsyncThunk<
    Partial<AreaLayout>,
    { areaId: string; layout: Partial<AreaLayout> },
    { state: RootState }
>(
    'area/updateLayout',
    async (params, { getState }) => {
        try {
            const state = getState();
            const currentLayout = state.area.layout[params.areaId];

            if (!currentLayout) {
                throw new Error(`Layout not found for area ${params.areaId}`);
            }

            return params.layout;
        } catch (error) {
            throw error;
        }
    }
); 
