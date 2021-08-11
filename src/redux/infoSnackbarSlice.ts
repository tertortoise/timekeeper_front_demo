import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import { RootState } from '../interfaces/redux';
import { InfoSnackbar } from '../interfaces/infoSnackbar';

//need to make it a map
const initialState: InfoSnackbar[] = [];

export const infoSnackbarSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {
        createInfoSnackbar: (state: InfoSnackbar[], action: PayloadAction<InfoSnackbar>) => {
            const id = uuidv4();
            state.push({ ...action.payload, id });
        },
        closeInfoSnackbar: (state: InfoSnackbar[], action: PayloadAction<string>) => {
            return state.filter(({ id }: InfoSnackbar) => action.payload !== id);
        },
    }
});

export const selectInfoSnackbars = (state: RootState): InfoSnackbar[] | undefined => state.infoSnackbars;


export const { createInfoSnackbar, closeInfoSnackbar } = infoSnackbarSlice.actions;

export default infoSnackbarSlice.reducer;