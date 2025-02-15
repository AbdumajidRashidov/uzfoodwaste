import axios from 'axios';
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';

import {PromocodeType} from '../../types';
import {BASE_URL, ENDPOINTS, CONFIG} from '../../config';

type Props = {
  loading: boolean;
  error: string | null;
  success: boolean;
};

const initialState: Props = {
  loading: false,
  error: null,
  success: false,
};

export const codeGet = createAsyncThunk('code/get', async (code: string) => {
  const url = BASE_URL + ENDPOINTS.get.promocode;
  try {
    const response = await axios.post(url, code);
    return response.data;
  } catch (err) {
    // return rejectWithValue(err.response.data);
  }
});

export const codeGetSlice = createSlice({
  name: 'promocode',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(codeGet.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(
      codeGet.fulfilled,
      (state, action: PayloadAction<PromocodeType>) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      },
    );
    builder.addCase(codeGet.rejected, (state, action) => {
      state.loading = false;
      // state.error = action.error.message;
      state.success = false;
    });
  },
});
