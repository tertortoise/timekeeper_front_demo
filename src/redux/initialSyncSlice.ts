import { createSlice, PayloadAction, createSelector, OutputParametricSelector } from '@reduxjs/toolkit';

import { RootState } from '../interfaces/redux';

export type InitialSyncDataSliceName = 'TEA' | 'TFM' | 'LTE';

//need to make it a map
export type InitialSyncDateSlice = Record<InitialSyncDataSliceName, boolean>;

const initialState: InitialSyncDateSlice = {
    TEA: false,
    TFM: false,
    LTE: false,
}

export const initialSyncSlice = createSlice({
    name: 'initialSyncStatus',
    initialState,
    reducers: {
        setInitialSyncStatusTrue: (state: typeof initialState, {payload}: PayloadAction<InitialSyncDataSliceName>) => {
            state[payload] = true;
        }
    }
});

//#region selectors
export const selectInitialSyncStatusDataSlice = (state: RootState): InitialSyncDateSlice => state.initialSyncStatus;

type ResFunc = (initialSyncDataSlice: InitialSyncDateSlice, dataSliceNames: InitialSyncDataSliceName[]) => boolean;

export const selectRusultInitialSyncStatusForDiffSlices: OutputParametricSelector<RootState, InitialSyncDataSliceName[], boolean, ResFunc> = createSelector(
    selectInitialSyncStatusDataSlice,
    (_: RootState, dataSliceNames:  InitialSyncDataSliceName[]) => dataSliceNames,
    (initialSyncDataSlice, dataSliceNames): boolean => {
        return dataSliceNames.reduce((resultStatus: boolean, dataSliceName) => {
            return resultStatus && initialSyncDataSlice[dataSliceName];
        }, true)
    }
);

//#endregion

export const { setInitialSyncStatusTrue } = initialSyncSlice.actions;

export default initialSyncSlice.reducer;