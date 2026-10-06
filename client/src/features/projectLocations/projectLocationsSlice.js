import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../app/axios";

/*
|--------------------------------------------------------------------------
| FETCH PROJECT LOCATIONS
|--------------------------------------------------------------------------
*/
export const fetchProjectLocations = createAsyncThunk(
  "projectLocations/fetchAll",
  async ({ page = 1, search = "", status = "" } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/project-locations", {
        params: {
          page,
          search,
          status,
        },
      });

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch project locations",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| CREATE PROJECT LOCATION
|--------------------------------------------------------------------------
*/
export const createProjectLocation = createAsyncThunk(
  "projectLocations/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/project-locations", payload);

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create project location",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| UPDATE PROJECT LOCATION
|--------------------------------------------------------------------------
*/
export const updateProjectLocation = createAsyncThunk(
  "projectLocations/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/project-locations/${id}`, payload);

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update project location",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| DELETE PROJECT LOCATION
|--------------------------------------------------------------------------
*/
export const deleteProjectLocation = createAsyncThunk(
  "projectLocations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/project-locations/${id}`);

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete project location",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/
const initialState = {
  list: [],
  total: 0,
  page: 1,
  totalPages: 1,
  status: "idle",
  error: null,
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/
const projectLocationsSlice = createSlice({
  name: "projectLocations",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      /*
      |--------------------------------------------------------------------------
      | FETCH
      |--------------------------------------------------------------------------
      */
      .addCase(fetchProjectLocations.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchProjectLocations.fulfilled, (state, action) => {
        state.status = "succeeded";

        state.list = action.payload?.items || [];
        state.total = action.payload?.total || 0;
        state.page = action.payload?.page || 1;
        state.totalPages = action.payload?.totalPages || 1;
        state.error = null;
      })

      .addCase(fetchProjectLocations.rejected, (state, action) => {
        state.status = "failed";

        state.error = action.payload || "Failed to fetch project locations";
      })

      /*
      |--------------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------------
      */
      .addCase(createProjectLocation.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(createProjectLocation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;

        const newProject = action.payload;

        if (newProject) {
          state.list.unshift(newProject);
          state.total += 1;
        }
      })

      .addCase(createProjectLocation.rejected, (state, action) => {
        state.status = "failed";

        state.error = action.payload || "Failed to create project location";
      })

      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */
      .addCase(updateProjectLocation.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(updateProjectLocation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;

        const updatedProject = action.payload;

        if (!updatedProject) {
          return;
        }

        const index = state.list.findIndex(
          (project) => project.id === updatedProject.id,
        );

        if (index !== -1) {
          state.list[index] = updatedProject;
        }
      })

      .addCase(updateProjectLocation.rejected, (state, action) => {
        state.status = "failed";

        state.error = action.payload || "Failed to update project location";
      })

      /*
      |--------------------------------------------------------------------------
      | DELETE
      |--------------------------------------------------------------------------
      */
      .addCase(deleteProjectLocation.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(deleteProjectLocation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;

        state.list = state.list.filter(
          (project) => project.id !== action.payload,
        );

        state.total = Math.max(0, state.total - 1);
      })

      .addCase(deleteProjectLocation.rejected, (state, action) => {
        state.status = "failed";

        state.error = action.payload || "Failed to delete project location";
      });
  },
});

export default projectLocationsSlice.reducer;
