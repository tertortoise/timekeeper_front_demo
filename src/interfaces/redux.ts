import { store } from "../redux/store";
import { FetchStatus } from "./dataSyncable";
import { TimeEntry } from "./timeTracker";

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

//#region selectors
export type FetchStatusSelector = (state: RootState) => FetchStatus;
export type TimeEntryDataSelector = (state: RootState) => TimeEntry | undefined;

//#endregion

//#region metaConfigs
export interface MetaEntityUpdateById {
  entityId: string;
}
export interface MetaEntityUpdateByIdAndIdx extends MetaEntityUpdateById {
  entityRefIndex: number; //
}

//#endregion
