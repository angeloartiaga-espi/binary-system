import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import UsersList from "./pages/users/UsersList";

import RolesList from "./pages/roles/RolesList";
import AssignRole from "./pages/roles/AssignRole";

import DashboardLayout from "./components/DashboardLayout";

import PrivateRoute from "./routes/PrivateRoute";
import RequirePermission from "./routes/RequirePermission";

import PermissionsList from "./pages/permissions/PermissionLists";
import AssignPermission from "./pages/permissions/AssignPermission";

import { fetchMe } from "./features/auth/authSlice";

export default function App() {
  const dispatch = useDispatch();

  // Restore the logged-in user when the app loads
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        {/* Shared dashboard layout */}
        <Route element={<DashboardLayout />}>
          {/* Dashboard */}
          <Route element={<RequirePermission permission="view_dashboard" />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* User management */}
          <Route element={<RequirePermission permission="manage_users" />}>
            <Route path="/users" element={<UsersList />} />
          </Route>

          {/* Role management */}
          <Route element={<RequirePermission permission="manage_roles" />}>
            <Route path="/roles" element={<RolesList />} />
            <Route path="/roles/assign" element={<AssignRole />} />
          </Route>

          <Route
            element={<RequirePermission permission="manage_permissions" />}
          >
            <Route path="/permissions" element={<PermissionsList />} />
            <Route path="/permissions/assign" element={<AssignPermission />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
