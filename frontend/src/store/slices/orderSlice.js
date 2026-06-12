// orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders', data);
    toast.success('Order placed successfully! 🎉');
    return res.data.order;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Order failed');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders/my-orders', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/cancel`, { reason });
    toast.success('Order cancelled');
    return res.data.order;
  } catch (err) {
    toast.error(err.response?.data?.message);
    return rejectWithValue(err.response?.data?.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { items: [], currentOrder: null, pagination: {}, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.fulfilled, (state, { payload }) => { state.currentOrder = payload; })
      .addCase(fetchMyOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.items = payload.orders;
        state.pagination = payload.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state) => { state.isLoading = false; })
      .addCase(fetchOrder.fulfilled, (state, { payload }) => { state.currentOrder = payload; })
      .addCase(cancelOrder.fulfilled, (state, { payload }) => {
        state.items = state.items.map(o => o._id === payload._id ? payload : o);
        state.currentOrder = payload;
      });
  }
});

export default orderSlice.reducer;
