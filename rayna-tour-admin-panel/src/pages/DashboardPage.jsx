import { useEffect, useState } from "react";
import { apiService } from "../api";
import { useAuth } from "../context/AuthContext";
import ResourceSection from "../components/ResourceSection";
import ProductSection from "../components/ProductSection";
import StatCard from "../components/StatCard";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    categoryCount: 0,
    cityCount: 0,
    productCount: 0,
  });
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState("");

  const loadLookups = async () => {
    try {
      const [categoryItems, cityItems, dashboardStats] =
        await Promise.all([
          apiService.listResource("/categories"),
          apiService.listResource("/cities"),
          apiService.getDashboardMeta(),
        ]);
      setCategories(categoryItems);
      setCities(cityItems);
      setStats(dashboardStats);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-brand-600">
              Rayna Tours
            </p>
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-surface-900">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-surface-600">{user?.email}</p>
            </div>
            <button className="btn-secondary" onClick={logout} type="button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Categories" value={stats.categoryCount} />
          <StatCard label="Cities" value={stats.cityCount} />
          <StatCard label="Products" value={stats.productCount} />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ResourceSection title="Categories" resourcePath="/categories" />
          <ResourceSection title="Cities" resourcePath="/cities" />
        </section>

        <ProductSection
          categories={categories}
          cities={cities}
        />
      </main>
    </div>
  );
};

export default DashboardPage;
