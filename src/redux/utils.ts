import { createAction, ActionCreatorWithPreparedPayload } from '@reduxjs/toolkit';

export function makeActionCreatorWithPayload<T>(type: string, timeEntryMeta?: T) {
  return createAction(type, (payload) => ({
    payload,
    meta: timeEntryMeta,
  }));
}

export type ActionCreatorWithPayload  = ActionCreatorWithPreparedPayload<[payload: any], number, string, never, unknown>;