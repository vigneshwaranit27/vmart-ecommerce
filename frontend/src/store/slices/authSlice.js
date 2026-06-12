import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

const user = JSON.parse(localStorage.getItem('vmartUser'));
const token = localStorage.getItem('vmartToken');

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('vmartToken', res.data.token);
    localStorage.setItem('vmartUser', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    localStorage.setItem('vmartToken', res.data.token);
    localStorage.setItem('vmartUser', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    localStorage.setItem('vmartUser', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    localStorage.removeItem('vmartToken');
    localStorage.removeItem('vmartUser');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch {}
  localStorage.removeItem('vmartToken');
  localStorage.removeItem('vmartUser');
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/users/profile', data);
    localStorage.setItem('vmartUser', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user || null,
    token: token || null,
    isLoading: false,
    isAuthenticated: !!token,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.token;
        state.isAuthenticated = true;
        toast.success(`Welcome to VMart, ${payload.user.name}! 🎉`);
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        toast.error(payload);
      })
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.token;
        state.isAuthenticated = true;
        toast.success(`Welcome back, ${payload.user.name}! 👋`);
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        toast.error(payload);
      })
      .addCase(loadUser.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        toast.success('Logged out successfully');
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        toast.success('Profile updated!');
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
