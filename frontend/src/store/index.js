import { configureStore } from "@reduxjs/toolkit";
import approvalsReducer from "./approvalsSlice.js";

const store = configureStore({
  reducer: {
    approvals: approvalsReducer
  }
});

export default store;