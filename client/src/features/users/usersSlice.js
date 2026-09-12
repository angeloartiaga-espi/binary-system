import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async ({ page = 1, search = '' } = {}) => {
        const res = await api.get('/users', { params: { page, search } });
        return res.data.data; // { items, total, page, totalPages }
    }
);

export const fetchUserById = createAsyncThunk('users/fetchOne', async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
});

export const createUser = createAsyncThunk(
    'users/create',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.post('/users', payload);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create user');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/update',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/users/${id}`, payload);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/users/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState: {
        list: [],
        total: 0,
        page: 1,
        totalPages: 1,
        selectedUser: null,
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload.items;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchUsers.rejected, (state) => {
                state.status = 'failed';
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.selectedUser = action.payload;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.list = state.list.filter((u) => u.id !== action.payload);
            });
    },
});

export default usersSlice.reducer;
