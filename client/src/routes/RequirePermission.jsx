import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RequirePermission({ permission }) {
  const user = useSelector((state) => state.auth.user);

  const permissions = (user?.roles || []).flatMap(
    (userRole) =>
      userRole?.role?.permissions?.map(
        (rolePermission) => rolePermission?.permission?.name
      ) || []
  );

  return permissions.includes(permission) ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}