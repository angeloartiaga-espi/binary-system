import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const user = useSelector((state) => state.auth.user);

  const permissions = (user?.roles || []).flatMap(
    (userRole) =>
      userRole?.role?.permissions?.map(
        (rolePermission) => rolePermission?.permission?.name,
      ) || [],
  );

  return (
    <div className="flex min-h-screen bg-brand-cream">
      <Sidebar permissions={permissions} />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
