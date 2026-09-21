import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

// Items with `children` render as expandable sidebar groups.
// `permission` hides the item unless the user has that permission.
const NAV_ITEMS = [
  { label: "Overview", to: "/dashboard" },

  {
    label: "User management",
    to: "/users",
    permission: "manage_users",
  },

  {
    label: "Role management",
    permission: "manage_roles",
    children: [
      { label: "Role List", to: "/roles" },
      { label: "Assign Role", to: "/roles/assign" },
    ],
  },

  {
    label: "Permission management",
    permission: "manage_permissions",
    children: [
      { label: "Permission List", to: "/permissions" },
      { label: "Assign Permission", to: "/permissions/assign" },
    ],
  },

  { label: "Settings", to: "/settings" },
];

const linkClasses = ({ isActive }) =>
  `block px-4 py-3 text-sm rounded-md mb-1 border-l-4 transition-colors ${
    isActive
      ? "border-brand-gold bg-white/10 font-semibold"
      : "border-transparent text-gray-300 hover:bg-white/5"
  }`;

function NavGroup({ item }) {
  const location = useLocation();

  const hasActiveChild = item.children.some(
    (child) => location.pathname === child.to,
  );

  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-md border-l-4 transition-colors ${
          hasActiveChild
            ? "border-brand-gold bg-white/5 font-semibold"
            : "border-transparent text-gray-300 hover:bg-white/5"
        }`}
      >
        <span>{item.label}</span>

        <span
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="ml-3 mt-1 border-l border-white/10 pl-2">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              end
              className={({ isActive }) =>
                `block px-4 py-2 text-sm rounded-md mb-1 transition-colors ${
                  isActive
                    ? "bg-white/10 text-brand-gold font-semibold"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ permissions = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || permissions.includes(item.permission),
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-brand-dark text-white flex flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="text-brand-gold text-2xl">⌂</span>

        <span className="font-bold tracking-wide text-sm">ESPI PORTAL</span>
      </div>

      <nav className="flex-1 px-2">
        {visibleItems.map((item) =>
          item.children ? (
            <NavGroup key={item.label} item={item} />
          ) : (
            <NavLink key={item.to} to={item.to} className={linkClasses}>
              {item.label}
            </NavLink>
          ),
        )}
      </nav>

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
