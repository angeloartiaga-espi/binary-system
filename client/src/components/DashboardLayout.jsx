import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    const user = useSelector((state) => state.auth.user);

    const isAdmin =
        user?.roles?.some(
            (userRole) => userRole.role?.name === 'admin'
        ) ?? false;

    return (
        <div className="flex min-h-screen bg-brand-cream">
            <Sidebar isAdmin={isAdmin} />

            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}