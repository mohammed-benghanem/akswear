import { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import "./AdminOrders.css";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"];
const STATUS_COLORS = {
  pending: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  shipped: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa" },
  delivered: { bg: "rgba(74,222,128,0.12)", color: "#4ade80" },
  cancelled: { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
};

export default function AdminOrders() {
  const { orders, updateOrderStatus, updateOrderDetails, deleteOrder } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast(`Order status updated to "${newStatus}"`);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    try {
      await deleteOrder(deleteConfirmId);
      showToast("Order deleted successfully");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete order");
    }
    setDeleteConfirmId(null);
  };

  const handleEditClick = (e, order) => {
    e.stopPropagation();
    setEditForm({ ...order });
    setEditModalOpen(true);
  };

  const handleEditChange = (field) => (e) => {
    setEditForm({ ...editForm, [field]: e.target.value });
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await updateOrderDetails(editForm.id, {
        customerName: editForm.customerName,
        phone: editForm.phone,
        city: editForm.city,
        address: editForm.address,
        note: editForm.note,
        total: parseFloat(editForm.total) || 0,
      });
      showToast("Order updated successfully");
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const filtered = orders
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter((o) => {
      const q = search.toLowerCase();
      return !q ||
        o.id?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.phone?.includes(q);
    });

  return (
    <div className="ado-root">
      {toast && <div className="ado-toast">{toast}</div>}

      {/* Header */}
      <div className="ado-header">
        <div>
          <h1 className="ado-title">Orders</h1>
          <p className="ado-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="ado-filters">
        <div className="ado-search-wrap">
          <svg className="ado-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="ado-search"
            placeholder="Search by ID, name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ado-status-tabs">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              className={`ado-status-tab${statusFilter === s ? " active" : ""}`}
              style={
                statusFilter === s && s !== "all"
                  ? { color: STATUS_COLORS[s]?.color, borderColor: STATUS_COLORS[s]?.color + "50" }
                  : {}
              }
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="ado-empty-card">
          <div className="ado-empty-icon">📦</div>
          <h3>{orders.length === 0 ? "No orders yet" : "No matching orders"}</h3>
          <p>
            {orders.length === 0
              ? "Orders will appear here once customers place them in the store."
              : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <div className="ado-list">
          {filtered.map((order) => {
            const st = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className={`ado-row-card${isExpanded ? " expanded" : ""}`}>
                {/* Main row */}
                <div className="ado-row" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                  <div className="ado-cell ado-id-cell">
                    <span className="ado-id">#{order.id}</span>
                    <span className="ado-date">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </span>
                  </div>

                  <div className="ado-cell ado-customer-cell">
                    <div className="ado-avatar">
                      {(order.customerName || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="ado-cname">{order.customerName}</div>
                      <div className="ado-cphone">{order.phone}</div>
                      {order.address && (
                        <div className="ado-caddress" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                          {order.address}, {order.city}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ado-cell">
                    <span className="ado-items-count">{order.items?.length || 0} item(s)</span>
                  </div>

                  <div className="ado-cell">
                    <span className="ado-total">{(order.total || 0).toFixed(0)} DH</span>
                  </div>

                  <div className="ado-cell" onClick={(e) => e.stopPropagation()}>
                    <select
                      className="ado-status-select"
                      value={order.status}
                      style={{ background: st.bg, color: st.color, borderColor: st.color + "40" }}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} style={{ background: "#0f1623", color: "#e2e8f0" }}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ado-cell ado-expand-cell">
                    <div className="ado-actions">
                      <button className="ado-action-btn edit" onClick={(e) => handleEditClick(e, order)} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button className="ado-action-btn del" onClick={(e) => handleDeleteClick(e, order.id)} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                    <span className={`ado-chevron${isExpanded ? " up" : ""}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="ado-expanded">
                    <div className="ado-exp-section">
                      <div className="ado-exp-title">Order Items</div>
                      <div className="ado-items-grid">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="ado-item">
                            <img
                              src={item.image || "/logo.png"}
                              alt={item.name}
                              className="ado-item-img"
                            />
                            <div className="ado-item-info">
                              <span className="ado-item-name">{item.name}</span>
                              <span className="ado-item-meta">Size: {item.size} · Qty: {item.quantity}</span>
                            </div>
                            <span className="ado-item-price">{(item.price * item.quantity).toFixed(0)} DH</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.address && (
                      <div className="ado-exp-section">
                        <div className="ado-exp-title">Shipping Address</div>
                        <p className="ado-exp-addr">{order.address}, {order.city}</p>
                      </div>
                    )}

                    {order.note && (
                      <div className="ado-exp-section">
                        <div className="ado-exp-title">Customer Note</div>
                        <p className="ado-exp-note">"{order.note}"</p>
                      </div>
                    )}

                    <div className="ado-exp-totals">
                      <span className="ado-exp-total-final">Total: <strong>{(order.total || 0).toFixed(0)} DH</strong></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editModalOpen && editForm && (
        <div className="ado-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="ado-modal" onClick={e => e.stopPropagation()}>
            <div className="ado-modal-header">
              <h2 className="ado-modal-title">Edit Order #{editForm.id}</h2>
              <button className="ado-modal-close" onClick={() => setEditModalOpen(false)}>✕</button>
            </div>
            <div className="ado-modal-body">
              <div className="ado-form-grid">
                <div className="ado-field">
                  <label>Customer Name</label>
                  <input value={editForm.customerName || ""} onChange={handleEditChange("customerName")} />
                </div>
                <div className="ado-field">
                  <label>Phone Number</label>
                  <input value={editForm.phone || ""} onChange={handleEditChange("phone")} />
                </div>
                <div className="ado-field ado-field-full">
                  <label>Address</label>
                  <input value={editForm.address || ""} onChange={handleEditChange("address")} />
                </div>
                <div className="ado-field">
                  <label>City</label>
                  <input value={editForm.city || ""} onChange={handleEditChange("city")} />
                </div>
                <div className="ado-field">
                  <label>Total (DH)</label>
                  <input type="number" value={editForm.total || 0} onChange={handleEditChange("total")} />
                </div>
                <div className="ado-field ado-field-full">
                  <label>Customer Note</label>
                  <textarea value={editForm.note || ""} onChange={handleEditChange("note")} rows={3} />
                </div>
              </div>
            </div>
            <div className="ado-modal-footer">
              <button className="ado-cancel-btn" onClick={() => setEditModalOpen(false)}>Cancel</button>
              <button className="ado-save-btn" onClick={handleEditSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmId && (
        <div className="ado-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="ado-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="ado-confirm-icon">🗑️</div>
            <h3>Delete Order?</h3>
            <p>Are you sure you want to delete order <strong>#{deleteConfirmId}</strong>? This cannot be undone.</p>
            <div className="ado-confirm-actions">
              <button className="ado-cancel-btn" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="ado-delete-confirm-btn" onClick={confirmDelete}>Delete Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
