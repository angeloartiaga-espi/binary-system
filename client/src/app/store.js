import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import usersReducer from "../features/users/usersSlice";
import rolesReducer from "../features/roles/rolesSlice";
import permissionsReducer from "../features/permissions/permissionsSlice";
import projectLocationsReducer from "../features/projectLocations/projectLocationsSlice";
import lotsReducer from "../features/lots/lotsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
    projectLocations: projectLocationsReducer,
    lots: lotsReducer,
  },
});
