
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

// Static nav list for now
const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'User management', to: '/users', adminOnly: true },
];

export default function Sidebar({ isAdmin }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-brand-dark text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="text-brand-gold text-2xl">⌂</span>
        <span className="font-bold tracking-wide text-sm">
          ESPI PORTAL
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-4 py-3 text-sm rounded-md mb-1 border-l-4 transition-colors ${
                isActive
                  ? 'border-brand-gold bg-white/10 font-semibold'
                  : 'border-transparent text-gray-300 hover:bg-white/5'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-6 border-t border-white/10 pt-4">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-sm rounded-md text-gray-300 hover:bg-white/5 hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

