import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { apiGet, apiPatch } from "../api.js";

const TODAY = () => new Date().toDateString();

function normalizeStatus(value) {
  const status = String(value || "pending").toLowerCase();
  if (status === "verified" || status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  return "pending";
}

function normalizeCertificate(certificate) {
  const normalizedId = String(certificate?.id || certificate?._id || "");
  const status = normalizeStatus(certificate?.status);
  const createdAt = certificate?.createdAt || certificate?.uploadedAt || certificate?.updatedAt || new Date().toISOString();
  const updatedAt = certificate?.updatedAt || certificate?.uploadedAt || createdAt;

  return {
    _id: normalizedId,
    id: normalizedId,
    studentName: certificate?.studentName || "CampusBloom Student",
    achievementTitle: certificate?.title || "Untitled Achievement",
    category: certificate?.category || "General",
    fileUrl: certificate?.fileUrl || certificate?.previewUrl || "",
    studentId: String(certificate?.studentId || ""),
    submissionDate: createdAt,
    hasCertificate: true,
    status,
    createdAt,
    updatedAt,
    approvedAt: status === "approved" ? updatedAt : null,
    rejectedAt: status === "rejected" ? updatedAt : null,
    raw: certificate
  };
}

function isToday(value) {
  return new Date(value).toDateString() === TODAY();
}

function computeAverageMinutes(records) {
  if (!records.length) return 0;
  const total = records.reduce((sum, item) => {
    const createdAt = new Date(item.createdAt).getTime();
    const updatedAt = new Date(item.updatedAt).getTime();
    const diff = Math.max(0, updatedAt - createdAt);
    return sum + diff / 60000;
  }, 0);
  return Math.round((total / records.length) * 10) / 10;
}

function ensureNewestFirst(queue) {
  return [...queue].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
}

async function fetchSpringCertificates() {
  const response = await apiGet("/api/student/certificates");
  return Array.isArray(response) ? response : [];
}

export const fetchApprovalsSnapshot = createAsyncThunk(
  "approvals/fetchApprovalsSnapshot",
  async (_, { rejectWithValue }) => {
    try {
      const records = (await fetchSpringCertificates()).map(normalizeCertificate);
      const pendingQueue = ensureNewestFirst(records.filter((item) => item.status === "pending"));
      const approvedTodayRecords = records.filter((item) => item.status === "approved" && isToday(item.updatedAt));
      const rejectedTodayRecords = records.filter((item) => item.status === "rejected" && isToday(item.updatedAt));

      return {
        queue: pendingQueue,
        stats: {
          pending: pendingQueue.length,
          approvedToday: approvedTodayRecords.length,
          rejectedToday: rejectedTodayRecords.length,
          avgApprovalTimeMinutes: computeAverageMinutes([...approvedTodayRecords, ...rejectedTodayRecords])
        },
        syncedAt: Date.now()
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch approvals.");
    }
  }
);

export const changeCertificateStatus = createAsyncThunk(
  "approvals/changeCertificateStatus",
  async ({ id, status, remarks }, { rejectWithValue }) => {
    try {
      const response = await apiPatch(`/api/student/certificates/${id}/status`, { status, remarks });
      return normalizeCertificate(response || {});
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update certificate status.");
    }
  }
);

const initialState = {
  approvalsQueue: [],
  stats: {
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0,
    avgApprovalTimeMinutes: 0
  },
  loading: false,
  error: "",
  filters: {
    search: "",
    category: "All",
    page: 1,
    pageSize: 8
  },
  syncedAt: null,
  newlyAddedIds: []
};

const approvalsSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {
    setApprovalsFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearRowHighlight(state, action) {
      state.newlyAddedIds = state.newlyAddedIds.filter((id) => id !== action.payload);
    },
    applyCertificateCreated() {},
    applyCertificateUpdated() {},
    applyCertificateDeleted() {},
    applyCertificateStatusChanged() {}
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovalsSnapshot.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchApprovalsSnapshot.fulfilled, (state, action) => {
        state.loading = false;
        state.approvalsQueue = action.payload.queue;
        state.stats = action.payload.stats;
        state.syncedAt = action.payload.syncedAt;
        state.newlyAddedIds = [];
      })
      .addCase(fetchApprovalsSnapshot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Could not load approvals.";
      })
      .addCase(changeCertificateStatus.rejected, (state, action) => {
        state.error = action.payload || "Status update failed.";
      })
      .addCase(changeCertificateStatus.fulfilled, (state, action) => {
        const item = action.payload;
        const withoutExisting = state.approvalsQueue.filter((entry) => entry.id !== item.id);
        state.approvalsQueue = item.status === "pending" ? ensureNewestFirst([item, ...withoutExisting]) : withoutExisting;
        if (item.status === "approved" && isToday(item.updatedAt)) state.stats.approvedToday += 1;
        if (item.status === "rejected" && isToday(item.updatedAt)) state.stats.rejectedToday += 1;
        state.stats.pending = state.approvalsQueue.length;
        state.syncedAt = Date.now();
      });
  }
});

export const {
  setApprovalsFilters,
  clearRowHighlight,
  applyCertificateCreated,
  applyCertificateUpdated,
  applyCertificateDeleted,
  applyCertificateStatusChanged
} = approvalsSlice.actions;

const selectApprovalsState = (state) => state.approvals;

export const selectApprovalsQueue = createSelector(
  [selectApprovalsState],
  (state) => state.approvalsQueue
);

export const selectApprovalsStats = createSelector(
  [selectApprovalsState],
  (state) => state.stats
);

export const selectApprovalsFilters = createSelector(
  [selectApprovalsState],
  (state) => state.filters
);

export const selectApprovalsMeta = createSelector([selectApprovalsState], (state) => ({
  loading: state.loading,
  error: state.error,
  syncedAt: state.syncedAt,
  newlyAddedIds: state.newlyAddedIds
}));

export const selectFilteredQueue = createSelector(
  [selectApprovalsQueue, selectApprovalsFilters],
  (queue, filters) => {
    const q = filters.search.trim().toLowerCase();
    return queue.filter((item) => {
      const matchesSearch =
        !q ||
        item.studentName.toLowerCase().includes(q) ||
        item.achievementTitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesCategory = filters.category === "All" || item.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }
);

export const selectPagedQueue = createSelector(
  [selectFilteredQueue, selectApprovalsFilters],
  (queue, filters) => {
    const total = queue.length;
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
    const page = Math.min(filters.page, totalPages);
    const start = (page - 1) * filters.pageSize;
    const items = queue.slice(start, start + filters.pageSize);
    return {
      items,
      total,
      page,
      pageSize: filters.pageSize,
      totalPages
    };
  }
);

export default approvalsSlice.reducer;
