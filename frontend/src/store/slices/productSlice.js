import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/products', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data.product;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/categories');
    return res.data.categories;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [], currentProduct: null, categories: [],
    pagination: {}, isLoading: false, error: null, filters: {}
  },
  reducers: {
    setFilters: (state, { payload }) => { state.filters = { ...state.filters, ...payload }; },
    clearFilters: (state) => { state.filters = {}; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.items = payload.products;
        state.pagination = payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => {
        state.isLoading = false; state.error = payload;
      })
      .addCase(fetchProduct.pending, (state) => { state.isLoading = true; state.currentProduct = null; })
      .addCase(fetchProduct.fulfilled, (state, { payload }) => {
        state.isLoading = false; state.currentProduct = payload;
      })
      .addCase(fetchProduct.rejected, (state, { payload }) => {
        state.isLoading = false; state.error = payload;
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => { state.categories = payload; });
  }
});

export const { setFilters, clearFilters } = productSlice.actions;
export default productSlice.reducer;
