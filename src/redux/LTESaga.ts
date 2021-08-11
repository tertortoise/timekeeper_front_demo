import { PayloadAction } from '@reduxjs/toolkit';
import { call, takeLeading, takeLatest, put, select, takeEvery } from 'redux-saga/effects';

import {
  CRUD_LTE_Loading,
  LDR_LTE_Success,
  CRUD_LTE_Error,
  CRUD_LTE_TEC_Request,
  CRUD_LTE_TEC_Error,
  CRUD_LTE_TEC_Success,
  LDC_LTE_TEC_Success,
  LDU_LTE_TEC_Commit,
  LDD_LTE_TEC_Success,
} from './LTESlice';
import {
  CRUD_TEA_Loading,
  LDCR_TEA_Success,
  selectTEADataSlice
} from './timeEntryActiveSlice';
import { firestoreDocRefTupleTEA } from './timeEntryActiveSaga';
import { setInitialSyncStatusTrue } from './initialSyncSlice';
import { createInfoSnackbar } from './infoSnackbarSlice';
import { TEDataSliceInt, TimeEntry } from '../interfaces/timeTracker';
import {
  FirestoreTopCollectionNames,
  FirestoreCollRefTuple,
  FirestorFieldUpdate,
  FirestoreOrderByConfig,
  BatchSetUDataDocumentConfig,
  BatchAddUDataDocumentConfig
} from '../interfaces/firebaseInterfaces';
import { batchWriteUDataDocuments, setUDataDocumentById, getUDataAllDocumentsOrdered, GetUDataAllDocumentsOrdered, addUDataDocument, updateUDataDocumentById, deleteUDataDocument } from '../firebase/firestoreUtils';

import { MetaEntityUpdateByIdAndIdx } from '../interfaces/redux';



export const LDR_LTE_Saga = 'LTE/LDR_LTE_Saga';
export const LDC_LTE_TEC_Saga = 'LTE/LDC_LTE_TEC_Saga';
export const LDC_LTE_TEC_TEA_Saga = 'LTE/LDC_LTE_TEC_TEA_Saga';
export const LDU_LTE_TEC_Saga = 'LTE/LDU_LTE_TEC_Saga';
export const LDD_LTE_TEC_Saga = 'LTE/LDD_LTE_TEC_Saga';

export const firestoreCollRefTupleLTE: FirestoreCollRefTuple = [FirestoreTopCollectionNames.LTE, 'CURRENT'];

const orderByConfig: FirestoreOrderByConfig<TimeEntry>[] = [{ field: 'start', dir: 'desc' }];

const getUDataAllDocumentsOrderedLTE: GetUDataAllDocumentsOrdered<TimeEntry> = getUDataAllDocumentsOrdered;

function* workerLDR_LTE() {
  yield put(CRUD_LTE_Loading());
  try {
    // const result: TimeEntry[] = yield call<GetUDataAllDocumentsOrdered<TimeEntry>>(getUDataAllDocumentsOrdered, firestoreCollRefTupleLTE, orderByConfig);
    const result: TimeEntry[] = yield call(getUDataAllDocumentsOrderedLTE, firestoreCollRefTupleLTE, orderByConfig);
    yield put(LDR_LTE_Success(result))
    yield put(setInitialSyncStatusTrue('LTE'))
  } catch (e) {
    yield put(CRUD_LTE_Error())
    yield put(createInfoSnackbar({ message: `Time entries initial sync failure: ${e.message}`, severity: 'error' }))
  }
}

function* workerLDC_LTE_TEC({ payload }: PayloadAction<TimeEntry>) {
  yield put(CRUD_LTE_Loading());
  try {
    const id: string = yield call(addUDataDocument, firestoreCollRefTupleLTE, payload);
    yield put(LDC_LTE_TEC_Success({ ...payload, id }));
    yield put(createInfoSnackbar({ message: `successfully created time entry` }))
  } catch (e) {
    yield put(CRUD_LTE_Error())
    yield put(createInfoSnackbar({ message: `failed to create time entry: ${e.message}`, severity: 'error' }))
  }
}

// if there is a TEA running, (a) create TEC from TEA, (b) create TEA from payload - batched writing
// if no TEA, just (b)
function* workerLDC_LTE_TEC_TEA({ payload }: PayloadAction<TimeEntry>) {
  const currentTEA: TEDataSliceInt = yield select(selectTEADataSlice);
  let newTEC: TimeEntry;
  yield put(CRUD_TEA_Loading());
  if (currentTEA.data) {
    newTEC = {
      ...currentTEA.data,
      end: Date.now(),
    }
    yield put(CRUD_LTE_Loading());
  }
  try {
    if (!currentTEA.data) {
      yield call(setUDataDocumentById, firestoreDocRefTupleTEA, payload);
    } else {
      const batchSetTEAConfig: BatchSetUDataDocumentConfig = {
        batchWriteType: 'set',
        firestoreDocRefTuple: firestoreDocRefTupleTEA,
        documentObject: payload,
      }
      const batchAddTECConfig: BatchAddUDataDocumentConfig = {
        batchWriteType: 'add',
        firestoreCollRefTuple: firestoreCollRefTupleLTE,
        documentObject: newTEC!,
      }
      const [, newTECId]: string[] = yield call(batchWriteUDataDocuments, [batchSetTEAConfig, batchAddTECConfig]);
      yield put(LDC_LTE_TEC_Success({ ...newTEC!, id: newTECId }));
      yield put(createInfoSnackbar({ message: `successfully created time entry` }))
    }
    yield put(LDCR_TEA_Success(payload));
    yield put(createInfoSnackbar({ message: `successfully started timer` }))
  } catch (e) {
    yield put(CRUD_LTE_Error())
    yield put(createInfoSnackbar({ message: `failed to create time entry: ${e.message}`, severity: 'error' }))
  }

}

function* workerLDU_LTE_TEC({ payload, meta: { entityId: timeEntryId } }: PayloadAction<FirestorFieldUpdate<TimeEntry, keyof TimeEntry>, string, MetaEntityUpdateByIdAndIdx>) {
  // yield put(CRUD_LTE_TEC_Request(entityRefIndex));
  yield put(LDU_LTE_TEC_Commit({ ...payload, entityId: timeEntryId }));
  try {
    yield call(updateUDataDocumentById, [...firestoreCollRefTupleLTE, timeEntryId], { [payload.fieldNameToUpdate]: payload.fieldNewValue });
    yield put(CRUD_LTE_TEC_Success(timeEntryId));
    yield put(createInfoSnackbar({ message: `successfully updated ${payload.fieldNameToUpdate}` }))
  } catch (e) {
    yield put(CRUD_LTE_TEC_Error(timeEntryId))
    yield put(createInfoSnackbar({ message: `failed to update ${payload.fieldNameToUpdate}: ${e.message}`, severity: 'error' }))
  }
}

function* workerLDD_LTE_TEC({ meta: { entityId: timeEntryId } }: PayloadAction<FirestorFieldUpdate<TimeEntry, keyof TimeEntry>, string, MetaEntityUpdateByIdAndIdx>) {
  yield put(CRUD_LTE_TEC_Request(timeEntryId));
  try {
    yield call(deleteUDataDocument, [...firestoreCollRefTupleLTE, timeEntryId]);
    yield put(LDD_LTE_TEC_Success(timeEntryId));
    yield put(createInfoSnackbar({ message: `successfully deleted time entry` }))
  } catch (e) {
    yield put(CRUD_LTE_TEC_Error(timeEntryId))
    yield put(createInfoSnackbar({ message: `failed to delete time entry: ${e.message}`, severity: 'error' }))
  }
}

export default function* watchFetchTimeEntryActiveSaga() {
  yield takeLeading(LDR_LTE_Saga, workerLDR_LTE);
  yield takeLatest(LDC_LTE_TEC_Saga, workerLDC_LTE_TEC);
  yield takeLatest(LDC_LTE_TEC_TEA_Saga, workerLDC_LTE_TEC_TEA);
  yield takeEvery(LDU_LTE_TEC_Saga, workerLDU_LTE_TEC);
  yield takeEvery(LDD_LTE_TEC_Saga, workerLDD_LTE_TEC);
};