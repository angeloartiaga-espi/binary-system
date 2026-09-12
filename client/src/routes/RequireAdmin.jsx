import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RequireAdmin() {
    const user = useSelector((state) => state.auth.user);
    const isAdmin = user?.roles?.some((ur) => ur.role.name === 'admin');
    return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}