import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../interfaces/redux';

import { fetchStatusLoadingReducer, fetchStatusErrorReducer, idleFetchStatus } from './fetchStatusUtils';
import { TEDataSliceInt, TimeEntry } from '../interfaces/timeTracker';
import { FirestorFieldUpdate } from '../interfaces/firebaseInterfaces';

const initialState: TEDataSliceInt = {
    status: idleFetchStatus,
};

export const timeEntryActivelice = createSlice({
    name: 'timeEntryActive',
    initialState,
    reducers: {
        CRUD_TEA_Loading: fetchStatusLoadingReducer,
        CRUD_TEA_Error: fetchStatusErrorReducer,
        LDCR_TEA_Success: (state: TEDataSliceInt, action: PayloadAction<TimeEntry | undefined>) => {
            state.data = action.payload;
            state.status = idleFetchStatus;
        },
        // https://stackoverflow.com/questions/58823346/type-any-is-not-assignable-to-type-never
        LDU_TEA_Success: (state: TEDataSliceInt, action: PayloadAction<FirestorFieldUpdate<TimeEntry, keyof TimeEntry>>) => {
            (state!.data![action.payload.fieldNameToUpdate] as typeof action.payload.fieldNewValue) = action.payload.fieldNewValue;
            state.status = idleFetchStatus;
        },
        LDD_TEA_Success: (state: TEDataSliceInt) => {
            state.data = undefined;
            state.status = idleFetchStatus;
        }

    },
    // postLocalUpdateTimeEntryActiveSuccess: localUpdateFetchSuccess,
});

export const selectTEADataSlice = (state: RootState): TEDataSliceInt => state.timeTracker.timeEntryActive;

export const {
    CRUD_TEA_Loading,
    LDCR_TEA_Success,
    CRUD_TEA_Error,
    LDU_TEA_Success,
    LDD_TEA_Success
} = timeEntryActivelice.actions;

export default timeEntryActivelice.reducer;