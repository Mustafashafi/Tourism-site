import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Overview", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "Cities", to: "/cities" },
  { label: "Products", to: "/products" },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 flex-col border-r border-surface-200 bg-surface-900 p-5 text-surface-100 lg:flex">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-100">
              Rayna Tours
            </p>
            <h1 className="mt-2 text-xl font-semibold">Admin Console</h1>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "text-surface-300 hover:bg-surface-800 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-lg border border-surface-700 p-3 text-xs text-surface-300">
            <p className="font-medium text-surface-100">{user?.name || "Admin"}</p>
            <p className="mt-1">{user?.email}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-surface-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-5 py-4 lg:px-8">
              <p className="text-sm font-medium text-surface-600">
                Professional Admin Panel
              </p>
              <button className="btn-secondary" onClick={logout} type="button">
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
