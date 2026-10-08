import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../app/axios.js";

// Fetch all lot quotations
export const fetchLotQuotations = createAsyncThunk(
  "lotQuotations/fetchLotQuotations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get("/lot-quotations", {
        params,
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lot quotations",
      );
    }
  },
);

// Fetch one lot quotation
export const fetchLotQuotation = createAsyncThunk(
  "lotQuotations/fetchLotQuotation",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/lot-quotations/${id}`);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lot quotation",
      );
    }
  },
);

// Create lot quotation
export const createLotQuotation = createAsyncThunk(
  "lotQuotations/createLotQuotation",
  async (quotationData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/lot-quotations", quotationData);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create lot quotation",
      );
    }
  },
);

// Update lot quotation
export const updateLotQuotation = createAsyncThunk(
  "lotQuotations/updateLotQuotation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/lot-quotations/${id}`, data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update lot quotation",
      );
    }
  },
);

// Delete lot quotation
export const deleteLotQuotation = createAsyncThunk(
  "lotQuotations/deleteLotQuotation",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/lot-quotations/${id}`);

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete lot quotation",
      );
    }
  },
);

const initialState = {
  quotations: [],
  quotation: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  loading: false,
  error: null,
};

const lotQuotationsSlice = createSlice({
  name: "lotQuotations",
  initialState,

  reducers: {
    clearLotQuotation: (state) => {
      state.quotation = null;
      state.error = null;
    },

    clearLotQuotationError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =========================
      // FETCH LOT QUOTATIONS
      // =========================
      .addCase(fetchLotQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchLotQuotations.fulfilled, (state, action) => {
        state.loading = false;

        state.quotations = action.payload.items || [];

        state.pagination = action.payload.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        };
      })

      .addCase(fetchLotQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // FETCH SINGLE QUOTATION
      // =========================
      .addCase(fetchLotQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchLotQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.quotation = action.payload;
      })

      .addCase(fetchLotQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // CREATE QUOTATION
      // =========================
      .addCase(createLotQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createLotQuotation.fulfilled, (state, action) => {
        state.loading = false;

        state.quotations.unshift(action.payload);

        state.pagination.total += 1;
      })

      .addCase(createLotQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // UPDATE QUOTATION
      // =========================
      .addCase(updateLotQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateLotQuotation.fulfilled, (state, action) => {
        state.loading = false;

        const updatedQuotation = action.payload;

        const index = state.quotations.findIndex(
          (quotation) => quotation.id === updatedQuotation.id,
        );

        if (index !== -1) {
          state.quotations[index] = updatedQuotation;
        }

        if (state.quotation?.id === updatedQuotation.id) {
          state.quotation = updatedQuotation;
        }
      })

      .addCase(updateLotQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // DELETE QUOTATION
      // =========================
      .addCase(deleteLotQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteLotQuotation.fulfilled, (state, action) => {
        state.loading = false;

        state.quotations = state.quotations.filter(
          (quotation) => quotation.id !== action.payload,
        );

        state.pagination.total = Math.max(0, state.pagination.total - 1);

        if (state.quotation?.id === action.payload) {
          state.quotation = null;
        }
      })

      .addCase(deleteLotQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLotQuotation, clearLotQuotationError } =
  lotQuotationsSlice.actions;

export default lotQuotationsSlice.reducer;
