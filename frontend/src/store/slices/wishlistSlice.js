// wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/wishlist');
    return res.data.wishlist;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.post('/wishlist/toggle', { productId });
    if (res.data.action === 'added') toast.success('Added to wishlist ❤️');
    else toast.success('Removed from wishlist');
    return { productId, action: res.data.action };
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, { payload }) => { state.items = payload; })
      .addCase(toggleWishlist.fulfilled, (state, { payload }) => {
        if (payload.action === 'removed') {
          state.items = state.items.filter(i => i._id !== payload.productId);
        }
      });
  }
});

export const isInWishlist = (productId) => (state) =>
  state.wishlist.items.some(i => (i._id || i) === productId);

export default wishlistSlice.reducer;
