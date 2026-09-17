import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../app/axios";

// Fetch all roles
export const fetchRoles = createAsyncThunk(
  "roles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/roles");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch roles",
      );
    }
  },
);

// Fetch users available for role assignment
export const fetchAssignableUsers = createAsyncThunk(
  "roles/fetchAssignableUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/roles/assignable-users");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

// Assign a role to a user
export const assignRole = createAsyncThunk(
  "roles/assign",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const res = await api.post("/roles/assign", {
        userId,
        role,
      });

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to assign role",
      );
    }
  },
);

// Fetch all permissions
export const fetchPermissions = createAsyncThunk(
  "roles/fetchPermissions",
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

// Create role
export const createRole = createAsyncThunk(
  "roles/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/roles", payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create role",
      );
    }
  },
);

// Update role
export const updateRole = createAsyncThunk(
  "roles/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/roles/${id}`, payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update role",
      );
    }
  },
);

// Delete role
export const deleteRole = createAsyncThunk(
  "roles/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/roles/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete role",
      );
    }
  },
);

const rolesSlice = createSlice({
  name: "roles",

  initialState: {
    list: [],
    permissions: [],
    assignableUsers: [],
    status: "idle",
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // -------------------------
      // Fetch Roles
      // -------------------------
      .addCase(fetchRoles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })

      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // -------------------------
      // Fetch Assignable Users
      // -------------------------
      .addCase(fetchAssignableUsers.pending, (state) => {
        state.error = null;
      })

      .addCase(fetchAssignableUsers.fulfilled, (state, action) => {
        state.assignableUsers = action.payload;
      })

      .addCase(fetchAssignableUsers.rejected, (state, action) => {
        state.error = action.payload;
      })

      // -------------------------
      // Assign Role
      // -------------------------
      .addCase(assignRole.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(assignRole.fulfilled, (state) => {
        state.status = "succeeded";
      })

      .addCase(assignRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // -------------------------
      // Fetch Permissions
      // -------------------------
      .addCase(fetchPermissions.pending, (state) => {
        state.error = null;
      })

      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload;
      })

      .addCase(fetchPermissions.rejected, (state, action) => {
        state.error = action.payload;
      })

      // -------------------------
      // Create Role
      // -------------------------
      .addCase(createRole.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(createRole.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list.push(action.payload);
      })

      .addCase(createRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // -------------------------
      // Update Role
      // -------------------------
      .addCase(updateRole.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(updateRole.fulfilled, (state, action) => {
        state.status = "succeeded";

        const index = state.list.findIndex(
          (role) => role.id === action.payload.id,
        );

        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      .addCase(updateRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // -------------------------
      // Delete Role
      // -------------------------
      .addCase(deleteRole.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(deleteRole.fulfilled, (state, action) => {
        state.status = "succeeded";

        state.list = state.list.filter((role) => role.id !== action.payload);
      })

      .addCase(deleteRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default rolesSlice.reducer;
