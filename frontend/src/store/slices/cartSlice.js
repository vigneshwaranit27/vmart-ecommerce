import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart');
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart/add', data);
    toast.success('Added to cart! 🛒');
    return res.data.cart;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to add to cart');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/cart/item/${itemId}`, { quantity });
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/removeItem', async (itemId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/cart/item/${itemId}`);
    toast.success('Item removed from cart');
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart/clear');
    return null;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], isLoading: false, error: null },
  reducers: {
    clearCartState: (state) => { state.items = []; }
  },
  extraReducers: (builder) => {
    const setCart = (state, { payload }) => {
      state.isLoading = false;
      state.items = payload?.items || [];
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state) => { state.isLoading = false; })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCart.fulfilled, (state) => { state.items = []; });
  }
});

export const cartItemCount = (state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const cartSubtotal = (state) => state.cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
