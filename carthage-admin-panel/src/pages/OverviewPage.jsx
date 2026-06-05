import React, { useState, useEffect } from "react";
import { apiService } from "../api";
import { 
  TrendingUp, ShoppingBag, Users, DollarSign, Calendar, Clock, 
  CheckCircle, AlertCircle, ArrowRight, UserPlus 
} from "lucide-react";
import { Link } from "react-router-dom";

const OverviewPage = () => {
  const [reportData, setReportData] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [reportsSettled, bookingsSettled, usersSettled] = await Promise.allSettled([
          apiService.getReports(),
          apiService.listBookings({ limit: 5 }),
          apiService.listCustomers()
        ]);

        if (reportsSettled.status === "fulfilled") {
          setReportData(reportsSettled.value);
        }
        if (bookingsSettled.status === "fulfilled") {
          setRecentBookings(bookingsSettled.value.items || []);
        }
        if (usersSettled.status === "fulfilled") {
          setCustomers(usersSettled.value.slice(0, 5) || []);
        }

        if (
          reportsSettled.status === "rejected" ||
          bookingsSettled.status === "rejected" ||
          usersSettled.status === "rejected"
        ) {
          console.error("Dashboard error details:", {
            reports: reportsSettled,
            bookings: bookingsSettled,
            users: usersSettled,
          });
          setError("Some dashboard panels could not be loaded. Check backend connectivity.");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
        <p className="text-sm text-surface-500 font-medium">Aggregating dashboard analytics...</p>
      </div>
    );
  }

  const summary = reportData?.summary || {
    totalRevenue: 0,
    totalBookings: 0,
    totalCustomers: 0,
    newCustomers30d: 0,
    statusCounts: { new: 0, in_progress: 0, completed: 0, cancelled: 0 }
  };

  const timeline = reportData?.revenueTimeline || [];

  // Find max amount for scaling SVG chart
  const maxAmount = Math.max(...timeline.map(t => t.amount), 1000);

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Dashboard Overview</h2>
        <p className="text-sm text-surface-600">
          Real-time performance analytics, booking volume, and client signups.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

      {/* ── METRIC CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        
        {/* Total Revenue */}
        <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-2xl font-black text-surface-900">AED {summary.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Total Bookings */}
        <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">Total Bookings</span>
            <span className="text-2xl font-black text-surface-900">{summary.totalBookings}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Registered Customers */}
        <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">Registered Customers</span>
            <span className="text-2xl font-black text-surface-900">{summary.totalCustomers}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* New Clients (30d) */}
        <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider block">New Clients (30d)</span>
            <span className="text-2xl font-black text-surface-900">+{summary.newCustomers30d}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <UserPlus size={24} />
          </div>
        </div>

      </div>

      {/* ── REVENUE ANALYTICS CHART ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-brand-600" /> Revenue Timeline (Last 6 Months)
        </h3>
        
        {/* Custom SVG Bar Chart */}
        <div className="w-full h-64 flex items-end gap-4 md:gap-8 pt-4 pb-2 border-b border-surface-100">
          {timeline.map((bar, idx) => {
            const pct = (bar.amount / maxAmount) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-bold text-surface-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-surface-900 text-white px-2 py-0.5 rounded">
                  AED {bar.amount.toLocaleString()}
                </div>
                <div 
                  style={{ height: `${Math.max(pct, 5)}%` }}
                  className="w-full bg-gradient-to-t from-brand-600 to-brand-500 rounded-t-lg transition-all duration-500 hover:from-brand-700 hover:to-brand-600 cursor-pointer shadow-sm relative"
                />
                <span className="text-[11px] font-semibold text-surface-500 truncate w-full text-center">
                  {bar.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TWO-COLUMN TABLES GRID ────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Bookings */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-base font-bold text-surface-900">Recent Bookings</h3>
              <Link to="/bookings" className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-surface-500 py-6 text-center">No bookings placed yet.</p>
            ) : (
              <div className="divide-y divide-surface-50">
                {recentBookings.map((b) => (
                  <div key={b._id} className="flex justify-between items-center py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#CC1422]">{b.bookingId}</p>
                      <p className="text-sm font-semibold text-surface-800 truncate">{b.customerDetails?.fullName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-surface-900">AED {b.totalAmount}</p>
                      <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        b.bookingStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        b.bookingStatus === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {b.bookingStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Newly Registered Customers */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-base font-bold text-surface-900">New Customers</h3>
              <Link to="/customers" className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {customers.length === 0 ? (
              <p className="text-sm text-surface-500 py-6 text-center">No customer profiles registered.</p>
            ) : (
              <div className="divide-y divide-surface-50">
                {customers.map((c) => (
                  <div key={c._id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm shrink-0">
                      {c.name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-surface-800 truncate">{c.name}</h4>
                      <p className="text-xs text-surface-400 truncate">{c.email}</p>
                    </div>
                    <span className="text-xs text-surface-400">
                      {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </section>
  );
};

export default OverviewPage;
