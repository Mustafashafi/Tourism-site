import React, { useEffect, useState } from "react";
import { apiService } from "../api";
import { BarChart3, DollarSign, TrendingUp, Users, ShoppingBag, CircleDot } from "lucide-react";
import toast from "react-hot-toast";

const statusLabels = {
  new: "New",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const data = await apiService.getReports();
        setReportData(data);
      } catch (err) {
        console.error(err);
        toast.error("Unable to load reports.");
        setError(err.message || "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        <p className="text-sm text-surface-500">Loading reports and insights...</p>
      </div>
    );
  }

  const summary = reportData?.summary || {};
  const revenueTimeline = reportData?.revenueTimeline || [];
  const statusCounts = summary.statusCounts || {};
  const maxRevenue = Math.max(...revenueTimeline.map((item) => item.amount), 1000);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-surface-500">Business Intelligence</p>
        <h1 className="text-3xl font-bold text-surface-900">Reports & Analysis</h1>
        <p className="mt-2 text-sm text-surface-600 max-w-2xl">
          Review booking performance, revenue trends, customer growth, and service-level outcomes across the business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-surface-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Revenue</p>
              <p className="mt-3 text-3xl font-black text-surface-900">AED {Number(summary.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <DollarSign size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-surface-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Bookings</p>
              <p className="mt-3 text-3xl font-black text-surface-900">{summary.totalBookings || 0}</p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-600">
              <ShoppingBag size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-surface-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Customers</p>
              <p className="mt-3 text-3xl font-black text-surface-900">{summary.totalCustomers || 0}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Users size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-surface-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-surface-400">New Customers (30d)</p>
              <p className="mt-3 text-3xl font-black text-surface-900">+{summary.newCustomers30d || 0}</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
              <TrendingUp size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-surface-900">Revenue Timeline</h2>
              <p className="text-sm text-surface-500">Last 6 months of booking revenue</p>
            </div>
            <div className="flex items-center gap-2 text-surface-400 text-xs uppercase tracking-[0.24em]">
              <BarChart3 size={16} /> Analytics
            </div>
          </div>
          <div className="grid gap-4">
            {revenueTimeline.map((item) => {
              const value = Number(item.amount || 0);
              const width = maxRevenue ? Math.max((value / maxRevenue) * 100, 5) : 5;
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-surface-500">
                    <span>{item.name}</span>
                    <span className="font-semibold text-surface-900">AED {value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-surface-900">Booking Status Breakdown</h2>
              <p className="text-sm text-surface-500">Current pipeline by status</p>
            </div>
            <CircleDot size={18} className="text-surface-400" />
          </div>
          <div className="space-y-4">
            {Object.keys(statusLabels).map((key) => {
              const count = statusCounts[key] || 0;
              const percentage = summary.totalBookings ? Math.round((count / summary.totalBookings) * 100) : 0;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-surface-800">
                    <span>{statusLabels[key]}</span>
                    <span>{count} bookings</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}
    </section>
  );
};

export default ReportsPage;
