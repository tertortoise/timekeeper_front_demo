import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { FetchStatus } from '../interfaces/dataSyncable';
import { RootState } from '../interfaces/redux';
import { TimeEntry, TEDataSliceInt, LTESliceInt } from '../interfaces/timeTracker';
import { FirestorFieldUpdate } from '../interfaces/firebaseInterfaces';
import {
  fetchStatusLoadingReducer,
  fetchStatusErrorReducer,
  fetchStatusSuccessReducer,
  editingStatus,
  idleFetchStatus,
  loadingFetchStatus,
  errorFetchStatus,
} from './fetchStatusUtils';

const initialState: LTESliceInt = {
  status: idleFetchStatus,
  data: []
};

export const LTESlice = createSlice({
  name: 'LTE',
  initialState,
  reducers: {
    CRUD_LTE_Loading: fetchStatusLoadingReducer,
    CRUD_LTE_Error: fetchStatusErrorReducer,
    CRUD_LTE_Success_NoPayload: fetchStatusSuccessReducer,
    LDR_LTE_Success: (state: LTESliceInt, { payload }: PayloadAction<TimeEntry[] | undefined>) => {

      let data: TEDataSliceInt[];
      if (Array.isArray(payload)) {
        data = payload.map(timeEntry => ({
          data: timeEntry,
          status: idleFetchStatus
        }));
      }
      if (!payload) {
        data = []
      }
      state.data = data!;
      state.status.loading = 0;
      state.status.error = false;
    },
    CRUD_LTE_TEC_Request: (state: LTESliceInt, { payload: timeEntryId }: PayloadAction<string>) => {
      let indexOfTEToUpdate = state.data.findIndex(timeEntrySlice => timeEntryId === timeEntrySlice.data!.id);
      state.data[indexOfTEToUpdate].status = loadingFetchStatus;
      state.status = loadingFetchStatus;
    },
    CRUD_LTE_TEC_Error: (state: LTESliceInt, { payload: timeEntryId }: PayloadAction<string>) => {
      let indexOfTEToUpdate = state.data.findIndex(timeEntrySlice => timeEntryId === timeEntrySlice.data!.id);
      if (indexOfTEToUpdate !== -1) {
        state.data[indexOfTEToUpdate].status = errorFetchStatus;
      }
      state.status = idleFetchStatus;
    },
    CRUD_LTE_TEC_Success: (state: LTESliceInt, { payload: timeEntryId }: PayloadAction<string>) => {
      let indexOfTEToUpdate = state.data.findIndex(timeEntrySlice => timeEntryId === timeEntrySlice.data!.id);
      state.data[indexOfTEToUpdate].status = idleFetchStatus;
      state.status = idleFetchStatus;
    },
    CRUD_LTE_TEC_EditingStart: (state: LTESliceInt, { payload: timeEntryId }: PayloadAction<string>) => {
      let indexOfTEToUpdate = state.data.findIndex(timeEntrySlice => timeEntryId === timeEntrySlice.data!.id);
      state.data[indexOfTEToUpdate].status = editingStatus;
      // state.status = idleFetchStatus;
    },
    CRUD_LTE_TEC_EditingStop: (state: LTESliceInt, { payload: timeEntryId }: PayloadAction<string>) => {
      let indexOfTEToUpdate = state.data.findIndex(timeEntrySlice => timeEntryId === timeEntrySlice.data!.id);
      if (state.data[indexOfTEToUpdate]) {
        state.data[indexOfTEToUpdate].status.editing = false;
      } else {
        console.log('failed to stop editing', timeEntryId, indexOfTEToUpdate)
      }
       
      // state.status = idleFetchStatus;
    },
    LDU_LTE_TEC_Commit: (state: LTESliceInt, { payload }: PayloadAction<FirestorFieldUpdate<TimeEntry, keyof TimeEntry>>) => {
      // let indexOfTEToUpdate = state.data.findIndex(timeEntrySlice => payload.entityId === timeEntrySlice.data!.id);
      let indexOfTEToUpdate = state.data.findIndex(timeEntrySlice => payload.entityId === timeEntrySlice.data!.id);
      if (state.data[indexOfTEToUpdate]) {
        (state.data[indexOfTEToUpdate].data![payload.fieldNameToUpdate] as typeof payload.fieldNewValue) = payload.fieldNewValue;
        state.data[indexOfTEToUpdate].status = loadingFetchStatus;
        state.status = loadingFetchStatus;
      }
    },
    LDC_LTE_TEC_Success: (state: LTESliceInt, { payload }: PayloadAction<TimeEntry>) => {
      let insertionIndex = state.data.findIndex(timeEntrySlice => payload.start > timeEntrySlice.data!.start);
      state.data.splice(insertionIndex !== undefined ? insertionIndex : 0, 0, { data: payload, status: idleFetchStatus });
      state.status = idleFetchStatus;
    },
    LDD_LTE_TEC_Success: (state: LTESliceInt, { payload: timeEntryId }: PayloadAction<string>) => {
      let indexOfTEToUpdate = state.data.findIndex(timeEntrySlice => timeEntryId === timeEntrySlice.data!.id);
      if (state.data[indexOfTEToUpdate]) {
        state.data.splice(indexOfTEToUpdate, 1);
      }
      state.status = idleFetchStatus;
    }

  },
});

export const selectLTEData = ({ timeTracker: { LTE } }: RootState): TEDataSliceInt[] => LTE.data;

export const selectLTEFetchStatus = ({ timeTracker: { LTE } }: RootState): FetchStatus => LTE.status;

export const makeSelectLTE_TE_ByIndex = (index: number) => ({ timeTracker: { LTE } }: RootState): TimeEntry => LTE.data[index].data!;

export const makeSelectLTE_TEFetchStatus_ByIndex = (index: number) => ({ timeTracker: { LTE } }: RootState): FetchStatus => LTE.data[index].status;

export const {
  CRUD_LTE_Loading,
  CRUD_LTE_Error,
  CRUD_LTE_Success_NoPayload,
  LDR_LTE_Success,
  CRUD_LTE_TEC_Request,
  CRUD_LTE_TEC_EditingStart,
  CRUD_LTE_TEC_EditingStop,
  CRUD_LTE_TEC_Error,
  CRUD_LTE_TEC_Success,
  LDC_LTE_TEC_Success,
  LDU_LTE_TEC_Commit,
  LDD_LTE_TEC_Success

} = LTESlice.actions;

export default LTESlice.reducer;
