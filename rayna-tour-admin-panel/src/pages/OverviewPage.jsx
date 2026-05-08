import StatCard from "../components/StatCard";
import { useDashboardData } from "../hooks/useDashboardData";

const OverviewPage = () => {
  const { stats, error, loading } = useDashboardData();

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-surface-900">Overview</h2>
        <p className="text-sm text-surface-600">
          Key business numbers and platform activity.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Categories" value={loading ? "..." : stats.categoryCount} />
        <StatCard label="Cities" value={loading ? "..." : stats.cityCount} />
        <StatCard label="Products" value={loading ? "..." : stats.productCount} />
      </div>
    </section>
  );
};

export default OverviewPage;
