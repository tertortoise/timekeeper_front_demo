import { StateWithFetchStatus, FetchStatus } from "../interfaces/dataSyncable";

export const idleFetchStatus: FetchStatus = {
  loading: 0,
  editing: false,
  error: false,
}

export const loadingFetchStatus: FetchStatus = {
  loading: 1,
  editing: false,
  error: false,
}

export const loadingTooLongStatus: FetchStatus = {
  loading: 2,
  editing: false,
  error: false,
}

export const editingStatus: FetchStatus = {
  loading: 0,
  editing: true,
  error: false,
}

export const editingAndLoadingStatus: FetchStatus = {
  loading: 1,
  editing: true,
  error: false,
}

export const errorFetchStatus: FetchStatus = {
  loading: 0,
  editing: false,
  error: true,
}

export const fetchStatusLoadingReducer = (state: StateWithFetchStatus) => {
  state.status = loadingFetchStatus;
};

export const fetchStatusErrorReducer = (state: StateWithFetchStatus) => {
  state.status = errorFetchStatus;
};

export const fetchStatusSuccessReducer = (state: StateWithFetchStatus) => {
  state.status = idleFetchStatus;
};

// export const localUpdateFetchSuccessReducer = (state: StateWithFetchStatus) => {
//   state.status.loading = 0;
//   state.status.error = false;
// };