import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../app/axios";

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/permissions");

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch permissions",
      );
    }
  },
);

export const fetchAssignableRoles = createAsyncThunk(
  "permissions/fetchAssignableRoles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/permissions/assignable-roles");

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch assignable roles",
      );
    }
  },
);

export const createPermission = createAsyncThunk(
  "permissions/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/permissions", payload);

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create permission",
      );
    }
  },
);

export const updatePermission = createAsyncThunk(
  "permissions/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/permissions/${id}`, payload);

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update permission",
      );
    }
  },
);

export const deletePermission = createAsyncThunk(
  "permissions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/permissions/${id}`);

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete permission",
      );
    }
  },
);

export const assignPermissions = createAsyncThunk(
  "permissions/assign",
  async ({ roleId, permissionIds }, { rejectWithValue }) => {
    try {
      const res = await api.post("/permissions/assign", {
        roleId,
        permissionIds,
      });

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to assign permissions",
      );
    }
  },
);

const permissionsSlice = createSlice({
  name: "permissions",

  initialState: {
    list: [],
    assignableRoles: [],
    status: "idle",
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Fetch permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
        state.error = null;
      })

      .addCase(fetchPermissions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch assignable roles
      .addCase(fetchAssignableRoles.pending, (state) => {
        state.error = null;
      })

      .addCase(fetchAssignableRoles.fulfilled, (state, action) => {
        state.assignableRoles = action.payload;
        state.error = null;
      })

      .addCase(fetchAssignableRoles.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Create permission
      .addCase(createPermission.pending, (state) => {
        state.error = null;
      })

      .addCase(createPermission.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.error = null;
      })

      .addCase(createPermission.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update permission
      .addCase(updatePermission.pending, (state) => {
        state.error = null;
      })

      .addCase(updatePermission.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (permission) => permission.id === action.payload.id,
        );

        if (index !== -1) {
          state.list[index] = action.payload;
        }

        state.error = null;
      })

      .addCase(updatePermission.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete permission
      .addCase(deletePermission.pending, (state) => {
        state.error = null;
      })

      .addCase(deletePermission.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (permission) => permission.id !== action.payload,
        );

        state.error = null;
      })

      .addCase(deletePermission.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Assign permissions
      .addCase(assignPermissions.pending, (state) => {
        state.error = null;
      })

      .addCase(assignPermissions.fulfilled, (state) => {
        state.error = null;
      })

      .addCase(assignPermissions.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default permissionsSlice.reducer;
