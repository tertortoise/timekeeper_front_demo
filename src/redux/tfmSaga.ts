import { call, takeLeading, put } from 'redux-saga/effects';

import { crudTfmLoading, crudTfmSuccess, crudTfmError } from './tfmSlice';
import { createInfoSnackbar } from './infoSnackbarSlice';
import { setInitialSyncStatusTrue } from './initialSyncSlice';
import {  TaskItem, TasksFlatMap } from '../interfaces/tasks';
import { GetUDataCollDocsAndNormalize, getUDataCollDocsAndNormalize } from '../firebase/firestoreUtils';
import { FirestoreCollRefTuple, FirestoreTopCollectionNames } from '../interfaces/firebaseInterfaces';

export const firestoreCollRefTupleTfm: FirestoreCollRefTuple = [FirestoreTopCollectionNames.TASKS, 'CURRENT'];

export const readTfmSaga = 'tfm/readTfmSaga';

const getUDataCollDocsAndNormalizeTfm: GetUDataCollDocsAndNormalize<TaskItem> = getUDataCollDocsAndNormalize;

function* workerFetchTasksFlatMap() {
  yield put(crudTfmLoading())
  try {
    const result: TasksFlatMap = yield call(getUDataCollDocsAndNormalizeTfm, firestoreCollRefTupleTfm);
    yield put(crudTfmSuccess(result))
    yield put(setInitialSyncStatusTrue('TFM'))
  } catch (e) {
    //const message = e.toString();
    yield put(crudTfmError())
    yield put(createInfoSnackbar({message: 'Tasks initial sync failure', severity: 'error' }))
  }

}

export default function* watchFetchTasksFlatMap() {
  yield takeLeading(readTfmSaga, workerFetchTasksFlatMap);
};