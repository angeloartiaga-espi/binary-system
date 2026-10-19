import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../app/axios";

/*
|--------------------------------------------------------------------------
| FETCH PROJECT LOCATIONS (PAGINATED TABLE)
|--------------------------------------------------------------------------
*/
export const fetchProjectLocations = createAsyncThunk(
  "projectLocations/fetchAll",
  async ({ page = 1, search = "", status = "", location = "" } = {}) => {
    const res = await api.get("/project-locations", {
      params: { page, search, status, location },
    });

    return res.data.data; // { items, total, page, totalPages }
  },
);

/*
|--------------------------------------------------------------------------
| FETCH ALL PROJECT LOCATIONS FOR PDF
|--------------------------------------------------------------------------
| Fetches every API page using the same filters.
| Does NOT overwrite the table's Redux list or pagination.
|--------------------------------------------------------------------------
*/
export const fetchAllProjectLocationsForPdf = createAsyncThunk(
  "projectLocations/fetchAllForPdf",
  async (
    { search = "", status = "", location = "" } = {},
    { rejectWithValue },
  ) => {
    try {
      // Fetch the first page to determine how many pages exist.
      const firstResponse = await api.get("/project-locations", {
        params: {
          page: 1,
          search,
          status,
          location,
        },
      });

      const firstPage = firstResponse.data.data;

      if (!firstPage) {
        throw new Error("The server returned an empty response.");
      }

      const allProjects = [...(firstPage.items || [])];
      const totalPages = Math.max(1, Number(firstPage.totalPages) || 1);

      // Fetch every remaining page.
      for (let page = 2; page <= totalPages; page += 1) {
        const response = await api.get("/project-locations", {
          params: {
            page,
            search,
            status,
            location,
          },
        });

        const pageData = response.data.data;

        allProjects.push(...(pageData?.items || []));
      }

      return allProjects;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch all project locations for PDF.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| FETCH PROJECT LOCATION BY ID
|--------------------------------------------------------------------------
*/
export const fetchProjectLocationById = createAsyncThunk(
  "projectLocations/fetchOne",
  async (id) => {
    const res = await api.get(`/project-locations/${id}`);
    return res.data.data;
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
      console.log("Creating project location with payload:", payload);

      const res = await api.post("/project-locations", payload);

      return res.data.data;
    } catch (err) {
      console.error("Create project location error:", {
        status: err.response?.status,
        response: err.response?.data,
        payload,
      });

      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create project location",
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
  selectedProject: null,
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
      | FETCH PAGINATED TABLE
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
      | FETCH ALL FOR PDF
      |--------------------------------------------------------------------------
      | Intentionally does not modify state.list or table pagination.
      | The complete array is returned by the thunk's fulfilled action.
      |--------------------------------------------------------------------------
      */
      .addCase(fetchAllProjectLocationsForPdf.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch projects for PDF.";
      })

      /*
      |--------------------------------------------------------------------------
      | FETCH ONE
      |--------------------------------------------------------------------------
      */
      .addCase(fetchProjectLocationById.fulfilled, (state, action) => {
        state.selectedProject = action.payload;
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
