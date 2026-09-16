
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

// Navigation items are controlled by permissions.
// The backend remains the real authorization layer.
const NAV_ITEMS = [
  {
    label: 'Overview',
    to: '/dashboard',
    permission: 'view_dashboard',
  },
  {
    label: 'User management',
    to: '/users',
    permission: 'manage_users',
  },
  {
    label: 'Role management',
    to: '/roles',
    permission: 'manage_roles',
  },
  {
    label: 'Settings',
    to: '/settings',
    permission: 'manage_settings',
  },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const permissions = (user?.roles || []).flatMap(
    (userRole) =>
      userRole?.role?.permissions?.map(
        (rolePermission) => rolePermission?.permission?.name
      ) || []
  );

  const visibleItems = NAV_ITEMS.filter((item) =>
    permissions.includes(item.permission)
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-brand-dark text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="text-brand-gold text-2xl">
          ⌂
        </span>

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
```

### One important issue

Your current database seed, based on what we've been building, has permissions such as:

```text
view_dashboard
manage_users
manage_properties
```

But the Sidebar above references additional permissions:

```text
manage_leads
manage_site_progress
manage_news
manage_careers
manage_roles
manage_settings
```

**Don't add these to the Sidebar until those permissions exist in your database.** Otherwise those navigation items simply won't appear.

For your current stage, I'd actually keep the navigation limited to the permissions you have already implemented:

```js
const NAV_ITEMS = [
  {
    label: 'Overview',
    to: '/dashboard',
    permission: 'view_dashboard',
  },
  {
    label: 'Properties',
    to: '/properties',
    permission: 'manage_properties',
  },
  {
    label: 'User management',
    to: '/users',
    permission: 'manage_users',
  },
  {
    label: 'Role management',
    to: '/roles',
    permission: 'manage_roles',
  },
];
