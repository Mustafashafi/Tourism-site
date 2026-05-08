import { useCallback, useEffect, useState } from "react";
import { apiService } from "../api";

export const useDashboardData = () => {
  const [stats, setStats] = useState({
    categoryCount: 0,
    cityCount: 0,
    productCount: 0,
  });
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    stats,
    categories,
    cities,
    loading,
    error,
    reload,
  };
};
