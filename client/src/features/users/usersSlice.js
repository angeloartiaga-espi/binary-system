import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async ({ page = 1, search = '' } = {}, { rejectWithValue }) => {
        try {
            const res = await api.get('/users', {
                params: { page, search },
            });

            return res.data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to fetch users'
            );
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'users/fetchOne',
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.get(`/users/${id}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to fetch user'
            );
        }
    }
);

export const createUser = createAsyncThunk(
    'users/create',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.post('/users', payload);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to create user'
            );
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
            return rejectWithValue(
                err.response?.data?.message || 'Failed to update user'
            );
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
            return rejectWithValue(
                err.response?.data?.message || 'Failed to delete user'
            );
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

            // Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })

            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';

                const data = action.payload || {};

                state.list = Array.isArray(data.users)
                    ? data.users
                    : [];

                state.total = data.pagination?.total ?? 0;
                state.page = data.pagination?.page ?? 1;
                state.totalPages =
                    data.pagination?.totalPages ?? 1;
            })

            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error =
                    action.payload ||
                    action.error?.message ||
                    'Failed to fetch users';

                state.list = [];
            })

            // Fetch one user
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.selectedUser = action.payload;
            })

            // Delete / deactivate user
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.list = state.list.filter(
                    (u) => u.id !== action.payload
                );
            });
    },
});

export default usersSlice.reducer;