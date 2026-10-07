import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../app/axios";

export const fetchLots = createAsyncThunk(
  "lots/fetchAll",
  async ({ projectLocationId, page = 1, search = "", status = "" }) => {
    const res = await api.get("/lots", {
      params: { projectLocationId, page, search, status },
    });
    return res.data.data; // { items, total, page, totalPages }
  },
);

export const createLot = createAsyncThunk(
  "lots/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/lots", payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create lot",
      );
    }
  },
);

export const updateLot = createAsyncThunk(
  "lots/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/lots/${id}`, payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update lot",
      );
    }
  },
);

export const deleteLot = createAsyncThunk(
  "lots/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/lots/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete lot",
      );
    }
  },
);

const lotsSlice = createSlice({
  name: "lots",
  initialState: {
    list: [],
    total: 0,
    page: 1,
    totalPages: 1,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLots.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLots.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchLots.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(deleteLot.fulfilled, (state, action) => {
        state.list = state.list.filter((l) => l.id !== action.payload);
      });
  },
});

export default lotsSlice.reducer;
