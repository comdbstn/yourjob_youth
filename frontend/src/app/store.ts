import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';

const initialState = {};

const rootSlice = createSlice({
  name: 'root',
  initialState,
  reducers: {}
});

export const store = configureStore({
  reducer: {
    root: rootSlice.reducer,
    auth: authReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export interface JobPostSearchFilterOption {
  label: string;
  value: string;
}

export default store;
