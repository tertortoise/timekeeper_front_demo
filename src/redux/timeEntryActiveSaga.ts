import { PayloadAction } from '@reduxjs/toolkit';
import { call, takeLeading, takeLatest, put } from 'redux-saga/effects';

import {
  CRUD_TEA_Loading,
  LDCR_TEA_Success,
  CRUD_TEA_Error,
  LDU_TEA_Success,
  LDD_TEA_Success
} from './timeEntryActiveSlice';
import { createInfoSnackbar } from './infoSnackbarSlice';
import { setInitialSyncStatusTrue } from './initialSyncSlice';
import { TimeEntry } from '../interfaces/timeTracker';
import { readUDataDocumentById, updateUDataDocumentById, setUDataDocumentById, deleteUDataDocument } from '../firebase/firestoreUtils';
import { FirestoreTopCollectionNames, FirestoreDocRefTuple, FirestoreCollRefTuple, FirestorFieldUpdate } from '../interfaces/firebaseInterfaces';



export const fetchTimeEntryActiveSaga = 'timeEntryActive/fetchTimeEntryActiveSaga';
export const LDU_TEA_Saga = 'TEA/LDU_Saga';
export const LDC_TEA_Saga = 'TEA/LDC_Saga';
export const LDD_TEA_Saga = 'TEA/LDD_Saga';

export const firestoreCollRefTupleTEA: FirestoreCollRefTuple = [FirestoreTopCollectionNames.TEA, 'CURRENT'];
export const firestoreDocRefTupleTEA: FirestoreDocRefTuple = [...firestoreCollRefTupleTEA, 'CURRENTDOC'];


function* workerFetchTimeEntryActive() {
  yield put(CRUD_TEA_Loading());
  try {
    const result: TimeEntry = yield call(readUDataDocumentById, firestoreDocRefTupleTEA);
    yield put(LDCR_TEA_Success(result))
    yield put(setInitialSyncStatusTrue('TEA'))
  } catch (e) {
    yield put(CRUD_TEA_Error())
    yield put(createInfoSnackbar({ message: `Current time entry initial sync failure: ${e.message}`, severity: 'error' }))
  }
}

function* workerLDU(action: PayloadAction<FirestorFieldUpdate<TimeEntry, keyof TimeEntry>>) {
  yield put(CRUD_TEA_Loading());
  try {
    yield call(updateUDataDocumentById, firestoreDocRefTupleTEA, { [action.payload.fieldNameToUpdate]: action.payload.fieldNewValue });
    yield put(LDU_TEA_Success(action.payload));
    yield put(createInfoSnackbar({ message: `successfully updated updated active timer ${action.payload.fieldNameToUpdate}` }))
  } catch (e) {
    yield put(CRUD_TEA_Error())
    yield put(createInfoSnackbar({ message: `failed active timer update: ${e.message}`, severity: 'error' }))
  }
}

function* workerLDC(action: PayloadAction<TimeEntry>) {
  yield put(CRUD_TEA_Loading());
  try {
    yield call(setUDataDocumentById, firestoreDocRefTupleTEA, action.payload);
    yield put(LDCR_TEA_Success(action.payload));
    yield put(createInfoSnackbar({ message: `successfully started timer` }))
  } catch (e) {
    yield put(CRUD_TEA_Error())
    yield put(createInfoSnackbar({ message: `failed to start active timer: ${e.message}`, severity: 'error' }))
  }
}

function* workerLDD() {
  yield put(CRUD_TEA_Loading());
  try {
    yield call(deleteUDataDocument, firestoreDocRefTupleTEA);
    yield put(LDD_TEA_Success());
    yield put(createInfoSnackbar({ message: `successfully deleted current timer` }))
  } catch (e) {
    yield put(CRUD_TEA_Error())
    yield put(createInfoSnackbar({ message: `failed to delete active timer: ${e.message}`, severity: 'error' }))
  }
}

export default function* watchFetchTimeEntryActiveSaga() {
  yield takeLeading(fetchTimeEntryActiveSaga, workerFetchTimeEntryActive);
  yield takeLatest(LDC_TEA_Saga, workerLDC);
  yield takeLatest(LDU_TEA_Saga, workerLDU);
  yield takeLatest(LDD_TEA_Saga, workerLDD);
};