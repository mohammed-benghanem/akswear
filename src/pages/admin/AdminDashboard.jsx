import { useAdmin } from "../../context/AdminContext";
import "./AdminDashboard.css";

const STATUS_COLORS = {
  pending:   { bg: "rgba(234,179,8,0.12)",  color: "#f59e0b", label: "Pending" },
  shipped:   { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", label: "Shipped" },
  delivered: { bg: "rgba(34,197,94,0.12)",  color: "#4ade80", label: "Delivered" },
  cancelled: { bg: "rgba(239,68,68,0.12)",  color: "#f87171", label: "Cancelled" },
};

export default function AdminDashboard() {
  const { stats, products, orders } = useAdmin();

  // Build simple bar chart data: revenue per day (last 7 days)
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const dayLabels = days.map((d) =>
    d.toLocaleDateString("en-US", { weekday: "short" })
  );
  const dayRevenue = days.map((d) => {
    const dayStr = d.toISOString().slice(0, 10);
    return orders
      .filter((o) => o.createdAt?.slice(0, 10) === dayStr)
      .reduce((acc, o) => acc + (o.total || 0), 0);
  });
  const maxRevenue = Math.max(...dayRevenue, 1);

  // Top products by sales count
  const topProducts = products
    .map((p) => {
      const sold = orders.reduce((acc, o) => {
        const item = o.items?.find((i) => i.id === p.id);
        return acc + (item ? item.quantity : 0);
      }, 0);
      return { ...p, sold };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  return (
    <div className="adb-root">
      {/* Header */}
      <div className="adb-header">
        <div>
          <h1 className="adb-title">Dashboard</h1>
          <p className="adb-subtitle">Welcome back! Here's what's happening in your store.</p>
        </div>
        <div className="adb-date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="adb-stats-grid">
        <div className="adb-stat-card">
          <div className="adb-stat-icon adb-stat-icon-gold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <div className="adb-stat-info">
            <span className="adb-stat-label">Total Products</span>
            <span className="adb-stat-value">{stats.totalProducts}</span>
          </div>
          <div className="adb-stat-trend adb-trend-up">Active</div>
        </div>

        <div className="adb-stat-card">
          <div className="adb-stat-icon adb-stat-icon-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div className="adb-stat-info">
            <span className="adb-stat-label">Total Orders</span>
            <span className="adb-stat-value">{stats.totalOrders}</span>
          </div>
          <div className="adb-stat-trend adb-trend-pending">
            {stats.pendingOrders} pending
          </div>
        </div>

        <div className="adb-stat-card">
          <div className="adb-stat-icon adb-stat-icon-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div className="adb-stat-info">
            <span className="adb-stat-label">Total Revenue</span>
            <span className="adb-stat-value">{stats.totalRevenue.toFixed(0)} DH</span>
          </div>
          <div className="adb-stat-trend adb-trend-up">All time</div>
        </div>

        <div className="adb-stat-card">
          <div className="adb-stat-icon adb-stat-icon-purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div className="adb-stat-info">
            <span className="adb-stat-label">Customers</span>
            <span className="adb-stat-value">{stats.totalOrders}</span>
          </div>
          <div className="adb-stat-trend adb-trend-up">Unique orders</div>
        </div>
      </div>

      <div className="adb-middle-grid">
        {/* Revenue Chart */}
        <div className="adb-chart-card">
          <div className="adb-card-header">
            <h2 className="adb-card-title">Revenue (Last 7 Days)</h2>
            <span className="adb-card-sub">in DH</span>
          </div>
          <div className="adb-chart">
            {dayRevenue.map((rev, i) => (
              <div key={i} className="adb-chart-col">
                <div className="adb-bar-wrap">
                  <div
                    className="adb-bar"
                    style={{ height: `${(rev / maxRevenue) * 100}%` }}
                    title={`${dayLabels[i]}: ${rev} DH`}
                  >
                    {rev > 0 && <span className="adb-bar-val">{rev}</span>}
                  </div>
                </div>
                <span className="adb-bar-label">{dayLabels[i]}</span>
              </div>
            ))}
          </div>
          {stats.totalOrders === 0 && (
            <div className="adb-chart-empty">
              No orders yet — place an order via the store to see data here.
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="adb-top-card">
          <div className="adb-card-header">
            <h2 className="adb-card-title">Top Products</h2>
            <span className="adb-card-sub">by units sold</span>
          </div>
          <div className="adb-top-list">
            {topProducts.map((p, i) => (
              <div key={p.id} className="adb-top-item">
                <span className="adb-top-rank">{i + 1}</span>
                <div className="adb-top-img-wrap">
                  <img
                    src={typeof p.images?.[0] === "string" ? p.images[0] : "/logo.png"}
                    alt={p.name}
                    className="adb-top-img"
                  />
                </div>
                <div className="adb-top-info">
                  <span className="adb-top-name">{p.name}</span>
                  <span className="adb-top-cat">{p.category}</span>
                </div>
                <span className="adb-top-sold">{p.sold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="adb-orders-card">
        <div className="adb-card-header">
          <h2 className="adb-card-title">Recent Orders</h2>
          <a href="/admin/orders" className="adb-see-all">See all →</a>
        </div>
        {orders.length === 0 ? (
          <div className="adb-empty">
            <div className="adb-empty-icon">📦</div>
            <p>No orders yet. Orders placed in the store will appear here.</p>
          </div>
        ) : (
          <div className="adb-table-wrap">
            <table className="adb-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => {
                  const st = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={order.id}>
                      <td><span className="adb-order-id">#{order.id}</span></td>
                      <td>
                        <div className="adb-customer">
                          <div className="adb-avatar">
                            {(order.customerName || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="adb-customer-name">{order.customerName}</div>
                            <div className="adb-customer-phone">{order.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>{order.items?.length || 0} item(s)</td>
                      <td><strong>{(order.total || 0).toFixed(0)} DH</strong></td>
                      <td>
                        <span className="adb-status-badge" style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="adb-date-cell">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
