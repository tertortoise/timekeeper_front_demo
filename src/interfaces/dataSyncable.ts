export interface FetchStatus {
    loading: 0 | 1 | 2;  //0 - false, 1 - normal loading, 2 - timed out, but loading
    editing: boolean;
    error: boolean; //when
}

export type FetchStatusList = Omit<FetchStatus, 'loadingBackground'>
export interface StateWithFetchStatus {
    status: FetchStatus,
}

export interface DataSyncable<T> extends StateWithFetchStatus  {
    data?: T,
}