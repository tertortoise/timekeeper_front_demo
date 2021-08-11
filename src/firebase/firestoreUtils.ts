import { firebase, firestore, udataId } from './config';
import {
  FirestoreDocRefTuple,
  FirestoreCollRefTuple,
  FirestoreOrderByConfig,
  BatchSetUDataDocumentConfig,
  BatchAddUDataDocumentConfig,
  BatchUpdateUDataDocumentConfig,
  BatchDeleteUDataDocumentConfig
} from '../interfaces/firebaseInterfaces';



const resolveFireStoreDocRef = (firestoreDocRefTuple: FirestoreDocRefTuple): firebase.firestore.DocumentReference => {
  return firestore.collection(udataId).doc(firestoreDocRefTuple[0]).collection(firestoreDocRefTuple[1]).doc(firestoreDocRefTuple[2]);
}

// only for 2-tier collections
const resolveFireStoreCollRef = (firestoreCollRefTuple: FirestoreCollRefTuple): firebase.firestore.CollectionReference => {
  return firestore.collection(udataId).doc(firestoreCollRefTuple[0]).collection(firestoreCollRefTuple[1]);
}

const buildErrorMessage = (e: Error & firebase.firestore.FirestoreError): string => {
  if (e.name && e.code && e.name === 'FirebaseError') {
    return `${e.name} : ${e.code} : ${e.message}`
  } else {
    return e.message ? `internal Error: ${e.message}` : `internal unspicified error`
  }
}

export const readUDataDocumentById = async (
  firestoreDocRefTuple: FirestoreDocRefTuple,
  getOptions?: firebase.firestore.GetOptions
): Promise<firebase.firestore.DocumentData | undefined> => {
  const docRef = resolveFireStoreDocRef(firestoreDocRefTuple);
  try {
    const result: firebase.firestore.DocumentSnapshot = await docRef.get(getOptions);
    return result.data();
  } catch (e) {
    throw new Error(buildErrorMessage(e))
  }

}

export const updateUDataDocumentById = async (
  firestoreDocRefTuple: FirestoreDocRefTuple,
  updateObject: firebase.firestore.UpdateData,
): Promise<void> => {
  const docRef = resolveFireStoreDocRef(firestoreDocRefTuple);

  try {
    await docRef.update(updateObject);
  } catch (e) {
    throw new Error(buildErrorMessage(e));
  }
}

export const setUDataDocumentById = async<T>(
  firestoreDocRefTuple: FirestoreDocRefTuple,
  documentObject: T,
): Promise<void> => {
  const docRef = resolveFireStoreDocRef(firestoreDocRefTuple);
  try {
    await docRef.set(documentObject);
  } catch (e) {
    throw new Error(buildErrorMessage(e));
  }
}

export const addUDataDocument = async<T>(
  firestoreCollRefTuple: FirestoreCollRefTuple,
  documentObject: T,
): Promise<string> => {
  const collRef = resolveFireStoreCollRef(firestoreCollRefTuple);
  try {
    const docRef = await collRef.add(documentObject);
    return docRef.id;
  } catch (e) {
    throw new Error(buildErrorMessage(e));
  }
}

export const deleteUDataDocument = async (
  firestoreDocRefTuple: FirestoreDocRefTuple
): Promise<void> => {
  const docRef = resolveFireStoreDocRef(firestoreDocRefTuple);
  try {
    await docRef.delete();
  } catch (e) {
    throw new Error(buildErrorMessage(e));
  }
}

export type GetUDataCollDocsAndNormalize<T> = (
  firestoreCollRefTuple: FirestoreCollRefTuple,
) => Promise<{[key: string]: T}>;

export const getUDataCollDocsAndNormalize = async <T>(
  firestoreCollRefTuple: FirestoreCollRefTuple,
): Promise<{[key: string]: T}> => {
  try {
    const result: {[key: string]: T} = {};

    const collRef = resolveFireStoreCollRef(firestoreCollRefTuple);
    let querySnapshot = await collRef.get();
    querySnapshot.forEach((doc) => {
      result[doc.id] = doc.data() as T;
    })
    return result;
  } catch (e) {
    throw new Error(buildErrorMessage(e));
  }


}

export type GetUDataAllDocumentsOrdered<T> = (
  firestoreCollRefTuple: FirestoreCollRefTuple,
  orderByConfig: FirestoreOrderByConfig<T>[]
) => Promise<T[]>;

export const getUDataAllDocumentsOrdered = async <T>(
  firestoreCollRefTuple: FirestoreCollRefTuple,
  orderByConfig: FirestoreOrderByConfig<T>[]
): Promise<T[]> => {
  const collRef = resolveFireStoreCollRef(firestoreCollRefTuple);
  const result: T[] = [];
  let querySnapshot: firebase.firestore.QuerySnapshot;
  switch (orderByConfig.length) {
    case 2:
      querySnapshot = await collRef.orderBy(orderByConfig[0].field as string, orderByConfig[0].dir).orderBy(orderByConfig[1].field as string, orderByConfig[1].dir).get();
      break;
    default: //1
      querySnapshot = await collRef.orderBy(orderByConfig[0].field as string, orderByConfig[0].dir).get();
  }

  querySnapshot.forEach((doc) => {
    result.push(
      {
        id: doc.id,
        ...doc.data() as T,
      }
    )
  })
  return result;
}


export const batchWriteUDataDocuments = async (batchWriteObjs: Array<BatchSetUDataDocumentConfig | BatchAddUDataDocumentConfig | BatchUpdateUDataDocumentConfig | BatchDeleteUDataDocumentConfig>): Promise<string[]> => {
  const batch = firestore.batch();
  const resultIds: string[] = [];

  batchWriteObjs.forEach((batchWriteObj) => {
    let docRef: firebase.firestore.DocumentReference;
    if (batchWriteObj.batchWriteType === 'set') {
      const { firestoreDocRefTuple, documentObject } = batchWriteObj;
      docRef = resolveFireStoreDocRef(firestoreDocRefTuple);
      batch.set(docRef, documentObject);
    } else if (batchWriteObj.batchWriteType === 'add') {
      const { firestoreCollRefTuple, documentObject } = batchWriteObj;
      docRef = resolveFireStoreCollRef(firestoreCollRefTuple).doc();
      batch.set(docRef, documentObject);
    } else if (batchWriteObj.batchWriteType === 'update') {
      const { firestoreDocRefTuple, documentObject } = batchWriteObj;
      docRef = resolveFireStoreDocRef(firestoreDocRefTuple);
      batch.update(docRef, documentObject);
    } else if (batchWriteObj.batchWriteType === 'delete') {
      const { firestoreDocRefTuple } = batchWriteObj;
      docRef = resolveFireStoreDocRef(firestoreDocRefTuple);
      batch.delete(docRef);
    }

    resultIds.push(docRef!.id);
  })

  try {
    await batch.commit();
  } catch (e) {
    throw new Error(buildErrorMessage(e));
  }

  return resultIds;
}

