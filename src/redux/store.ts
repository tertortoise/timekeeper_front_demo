import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import {all} from 'redux-saga/effects';

import timeEntryActiveReducer from './timeEntryActiveSlice';
import timeEntryActiveSaga from './timeEntryActiveSaga';
import LTEReducer from './LTESlice';
import LTESaga from './LTESaga';
import tfmReducer from './tfmSlice';
import tfmSaga from './tfmSaga';
import infoSnackbarReducer from './infoSnackbarSlice';
import initialSyncSliceReducer from './initialSyncSlice';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    timeTracker: combineReducers({
      timeEntryActive: timeEntryActiveReducer,
      LTE: LTEReducer,
    }),
    tfm: tfmReducer,
    infoSnackbars: infoSnackbarReducer,
    initialSyncStatus: initialSyncSliceReducer,
  },
  middleware: [...getDefaultMiddleware({thunk: false}), sagaMiddleware]
});

sagaMiddleware.run(function* () {
  yield all([
    timeEntryActiveSaga(),
    tfmSaga(),
    LTESaga(),
  ])
});
