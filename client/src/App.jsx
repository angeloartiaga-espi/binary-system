import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/users/UsersList';
import DashboardLayout from './components/DashboardLayout';
import PrivateRoute from './routes/PrivateRoute';
import RequireAdmin from './routes/RequireAdmin';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMe } from './features/auth/authSlice';

export default function App() {

   const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            dispatch(fetchMe());
        }
    }, [dispatch]);
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      <Route element={<PrivateRoute />}>
        {/* Every route below shares the sidebar/topbar shell */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route element={<RequireAdmin />}>
            <Route path="/users" element={<UsersList />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}