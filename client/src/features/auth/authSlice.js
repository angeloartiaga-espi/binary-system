import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

const savedUser = localStorage.getItem('user');

export const registerUser = createAsyncThunk(
    'auth/register',
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return res.data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Registration failed'
            );
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/login', credentials);

            return res.data.data; // { token, user }
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Login failed'
            );
        }
    }
);

// Restore logged-in user after page refresh
export const fetchMe = createAsyncThunk(
    'auth/fetchMe',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/auth/me');

            return res.data.data;
        } catch (err) {
            localStorage.removeItem('token');

            return rejectWithValue(
                err.response?.data?.message || 'Session expired'
            );
        }
    }
);

const authSlice = createSlice({
    name: 'auth',

    initialState: {
        user: savedUser ? JSON.parse(savedUser) : null,
        token: localStorage.getItem('token') || null,
        status: savedUser ? 'succeeded' : 'idle',
        error: null,
    },

    reducers: {
     logout(state) {
    state.user = null;
    state.token = null;
    state.status = 'idle';

    localStorage.removeItem('token');
    localStorage.removeItem('user');
},
    },

    extraReducers: (builder) => {
        builder

            // LOGIN
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })

           .addCase(loginUser.fulfilled, (state, action) => {
    state.status = 'succeeded';

    state.user = action.payload.user;
    state.token = action.payload.token;

    localStorage.setItem('token', action.payload.token);
    localStorage.setItem('user', JSON.stringify(action.payload.user));
})
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // RESTORE SESSION
            .addCase(fetchMe.pending, (state) => {
                state.status = 'loading';
            })

         .addCase(fetchMe.fulfilled, (state, action) => {
    state.status = 'succeeded';
    state.user = action.payload;

    localStorage.setItem('user', JSON.stringify(action.payload));
})
            .addCase(fetchMe.rejected, (state, action) => {
                state.status = 'failed';
                state.user = null;
                state.token = null;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;