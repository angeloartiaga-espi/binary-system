import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

// Items with `children` render as expandable navigation groups.
// `permission` hides the item unless the user has that permission.
const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard",
  },

  {
    label: "User management",
    to: "/users",
    permission: "manage_users",
  },

  {
    label: "Role management",
    permission: "manage_roles",
    children: [
      {
        label: "Role List",
        to: "/roles",
      },
      {
        label: "Assign Role",
        to: "/roles/assign",
      },
    ],
  },

  {
    label: "Permission management",
    permission: "manage_permissions",
    children: [
      {
        label: "Permission List",
        to: "/permissions",
      },
      {
        label: "Assign Permission",
        to: "/permissions/assign",
      },
    ],
  },
  {
    label: "Inventory Management",
    permission: "manage_properties",
    to: "/properties",
  },
];

const linkClasses = ({ isActive }) =>
  `block px-4 py-3 text-sm rounded-md mb-1 border-l-4 transition-colors ${
    isActive
      ? "border-brand-gold bg-white/10 font-semibold"
      : "border-transparent text-gray-300 hover:bg-white/5"
  }`;

/* =========================
   LOGO
========================= */

function Logo({ idPrefix }) {
  // Unique gradient IDs because the logo appears twice:
  // desktop sidebar + mobile top bar
  const goldId = `${idPrefix}-elGold`;
  const gold2Id = `${idPrefix}-elGold2`;

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0b6b4a] text-[#e6b84f]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 720 520"
          role="img"
          aria-label="EstateLink"
        >
          <defs>
            <linearGradient
              id={goldId}
              gradientUnits="userSpaceOnUse"
              x1="100"
              y1="500"
              x2="620"
              y2="70"
            >
              <stop offset="0" stopColor="#b98a2b" />
              <stop offset=".45" stopColor="#e9c368" />
              <stop offset=".62" stopColor="#f4dc98" />
              <stop offset="1" stopColor="#c8963a" />
            </linearGradient>

            <linearGradient
              id={gold2Id}
              gradientUnits="userSpaceOnUse"
              x1="100"
              y1="430"
              x2="680"
              y2="230"
            >
              <stop offset="0" stopColor="#b98a2b" />
              <stop offset=".5" stopColor="#eccb75" />
              <stop offset="1" stopColor="#c8963a" />
            </linearGradient>
          </defs>

          <path
            fill={`url(#${goldId})`}
            d="M390 62 L593 192 L605 232 L390 110 L228 213 L228 265 L420 265 L383 297 L228 297 L228 357 L385 357 L360 388 L318 399 L228 399 L228 420 L185 420 L185 193 Z"
          />

          <path
            fill={`url(#${goldId})`}
            d="M185 480 L420 467 L420 510 L185 510 Z"
          />

          <g fill={`url(#${goldId})`}>
            <rect x="359" y="158" width="26" height="26" />
            <rect x="393" y="158" width="26" height="26" />
            <rect x="359" y="192" width="26" height="26" />
            <rect x="393" y="192" width="26" height="26" />
          </g>

          <g fill="#12544F">
            <path d="M451 183 L501 213 L501 347 L451 360 Z" />
            <path d="M451 410 L501 390 L501 467 L618 467 L658 510 L451 510 Z" />
          </g>

          <path
            fill={`url(#${gold2Id})`}
            d="M165 348 C120 370 95 395 98 420 C110 445 190 445 290 425 C450 392 610 320 668 262 C690 240 680 222 640 217 C625 215 612 216 604 222 C608 240 570 270 480 310 C390 348 290 385 200 400 C160 408 130 410 125 398 C124 380 145 362 165 348 Z"
          />
        </svg>
      </div>

      <span className="text-xl font-bold tracking-wide">
        <span className="text-[#d9a93f]">Estate</span>
        <span className="text-[#0b6b4a]">Link</span>
      </span>
    </div>
  );
}

/* =========================
   NAVIGATION GROUP
========================= */

function NavGroup({ item, onNavigate }) {
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
        aria-expanded={open}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-md border-l-4 transition-colors ${
          hasActiveChild
            ? "border-brand-gold bg-white/5 font-semibold"
            : "border-transparent text-gray-300 hover:bg-white/5"
        }`}
      >
        <span>{item.label}</span>

        <span
          aria-hidden="true"
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
              onClick={onNavigate}
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

/* =========================
   SIDEBAR
========================= */

export default function Sidebar({ permissions = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Controls the mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // Only show navigation items the user has permission to access
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || permissions.includes(item.permission),
  );

  // Close mobile sidebar
  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // Logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  /* =========================
     LOCK PAGE SCROLL WHEN MENU
     IS OPEN ON MOBILE
  ========================= */

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  /* =========================
     CLOSE MOBILE MENU WHEN
     RESIZED TO DESKTOP
  ========================= */

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const onChange = (e) => {
      if (e.matches) {
        setMobileOpen(false);
      }
    };

    mq.addEventListener("change", onChange);

    return () => {
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <>
      {/* =========================
          MOBILE TOP BAR
      ========================= */}

      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 bg-brand-dark px-4 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="app-sidebar"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Logo idPrefix="top" />
      </header>

      {/* =========================
          MOBILE BACKDROP
      ========================= */}

      <div
        onClick={closeMobileMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col bg-brand-dark text-white transition-[transform,visibility] duration-200 ease-out lg:visible lg:static lg:min-h-screen lg:max-w-none lg:translate-x-0 lg:shrink-0 ${
          mobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        {/* =========================
            SIDEBAR HEADER
        ========================= */}

        <div className="flex items-center justify-between px-6 py-6">
          <Logo idPrefix="drawer" />

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close menu"
            className="-mr-3 flex h-10 w-10 items-center justify-center rounded-md text-gray-300 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* =========================
            NAVIGATION
        ========================= */}

        <nav className="flex-1 overflow-y-auto px-2">
          {visibleItems.map((item) =>
            item.children ? (
              <NavGroup
                key={item.label}
                item={item}
                onNavigate={closeMobileMenu}
              />
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={linkClasses}
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        {/* =========================
            LOGOUT
        ========================= */}

        <div className="border-t border-white/10 px-2 pb-6 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
