import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const registerUser = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
    try {
        const res = await api.post('/auth/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        return res.data.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const res = await api.post('/auth/login', credentials);
        return res.data.data; // { token, user }
    } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, token: localStorage.getItem('token') || null, status: 'idle', error: null },
    reducers: {
        logout(state) { state.user = null; state.token = null; localStorage.removeItem('token'); },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => { state.error = action.payload; });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;