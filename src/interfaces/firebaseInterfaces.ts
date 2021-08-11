import { firebase } from '../firebase/config';
//collection tuple is ['DOCREF', 'Subcollection']
export enum FirestoreTopCollectionNames {
  TEA = 'TEA',
  LTE = 'LTE',
  TASKS = 'TASKS'
}

export type FirestoreCollRefTuple = [FirestoreTopCollectionNames, string];

export type FirestoreDocRefTuple = [...FirestoreCollRefTuple, string];

export interface FirestoreOrderByConfig<Type> {
  field: keyof Type,
  dir?: firebase.firestore.OrderByDirection};

export interface FirestorFieldUpdate<T, K extends keyof T> {
  fieldNameToUpdate: K;
  fieldNewValue: T[K];
  entityId?: string;
  entityRefIndex?: number;
}


export interface BatchSetUDataDocumentConfig {
  batchWriteType: 'set';
  firestoreDocRefTuple: FirestoreDocRefTuple;
  documentObject: unknown;
}

export interface BatchAddUDataDocumentConfig {
  batchWriteType: 'add';
  firestoreCollRefTuple: FirestoreCollRefTuple;
  documentObject: unknown;
}

export interface BatchUpdateUDataDocumentConfig {
  batchWriteType: 'update';
  firestoreDocRefTuple: FirestoreDocRefTuple;
  documentObject: firebase.firestore.UpdateData;
}

export interface BatchDeleteUDataDocumentConfig {
  batchWriteType: 'delete';
  firestoreDocRefTuple: FirestoreDocRefTuple;
}