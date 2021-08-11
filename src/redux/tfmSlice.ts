import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../interfaces/redux';

import { fetchStatusLoadingReducer, fetchStatusErrorReducer, idleFetchStatus } from './fetchStatusUtils';
import { TasksFlatMapData, TasksFlatMap } from '../interfaces/tasks';
import { FetchStatus } from '../interfaces/dataSyncable';
import { parseTasksFlatMapToSelectionList } from '../utils/parseTasksFlatMapToSelectionList';

const initialState: TasksFlatMapData = {
    status: idleFetchStatus,
};

export const tfmSlice = createSlice({
    name: 'tfm',
    initialState,
    reducers: {
        crudTfmLoading: fetchStatusLoadingReducer,
        crudTfmError: fetchStatusErrorReducer,
        crudTfmSuccess: (state: TasksFlatMapData, action: PayloadAction<TasksFlatMap>) => {
            state.data = action.payload;
            state.status = idleFetchStatus;
        },
    }
});

//#region 
export const selectTfm = (state: RootState): TasksFlatMap | undefined => state.tfm.data;

export const selectTfmFetchStatus = (state: RootState): FetchStatus => state.tfm.status;

export const tasksSelectionListSelector = createSelector(
  selectTfm,
  (tasksFlatMap) => {
    if (tasksFlatMap) {
      return parseTasksFlatMapToSelectionList(tasksFlatMap);
    };
  },
)

//#endregion

export const { crudTfmLoading, crudTfmSuccess, crudTfmError } = tfmSlice.actions;

export default tfmSlice.reducer;