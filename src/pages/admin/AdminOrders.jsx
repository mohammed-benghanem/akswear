import { useState } from "react";
import { createPortal } from "react-dom";
import { useAdmin } from "../../context/AdminContext";
import "./AdminOrders.css";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"];
const STATUS_COLORS = {
  pending: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  shipped: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa" },
  delivered: { bg: "rgba(74,222,128,0.12)", color: "#4ade80" },
  cancelled: { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
};

const getProductSizes = (prod) => {
  if (!prod) return [];
  let raw = prod.sizes;
  if (!raw || (Array.isArray(raw) && raw.length === 0)) {
    return ["XS", "S", "M", "L", "XL", "XXL"];
  }
  if (Array.isArray(raw)) {
    return raw
      .flatMap(s => typeof s === "string" ? s.split(",").map(x => x.trim()) : s)
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw.split(",").map(s => s.trim()).filter(Boolean);
  }
  return ["XS", "S", "M", "L", "XL", "XXL"];
};

export default function AdminOrders() {
  const {
    orders,
    ordersLoading,
    ordersError,
    products,
    updateOrderStatus,
    updateOrderDetails,
    deleteOrder,
    addOrder,
  } = useAdmin();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [form, setForm] = useState(null);
  const [newItem, setNewItem] = useState({ productId: "", size: "", quantity: 1 });
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const openAdd = () => {
    setForm({
      customerName: "",
      phone: "",
      city: "",
      address: "",
      note: "",
      total: 0,
      items: [],
    });
    setNewItem({ productId: "", size: "", quantity: 1 });
    setModalMode("add");
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err) {
      console.error("Status update failed:", err);
      showToast("❌ Failed to update status: " + (err?.message || "Unknown error"));
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      await deleteOrder(id);
      showToast("✓ Order deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("❌ Failed to delete order: " + (err?.message || "Unknown error"));
    }
  };

  const handleEditClick = (e, order) => {
    e.stopPropagation();
    setForm({
      ...order,
      items: Array.isArray(order.items) ? order.items : [],
      total: order.total || 0,
    });
    setNewItem({ productId: "", size: "", quantity: 1 });
    setModalMode("edit");
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.productId || !newItem.size || newItem.quantity < 1) return;
    const prod = products.find(p => String(p.id) === String(newItem.productId));
    if (!prod) return;

    let img = "/logo.png";
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      img = prod.images[0];
    } else if (typeof prod.images === "string" && prod.images.trim()) {
      img = prod.images.split("\n")[0].trim();
    }

    const itemToAdd = {
      productId: prod.id,
      name: prod.name,
      image: img,
      size: newItem.size,
      quantity: parseInt(newItem.quantity) || 1,
      price: prod.price,
    };

    const updatedItems = [...(form.items || []), itemToAdd];
    const newTotal = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    setForm({ ...form, items: updatedItems, total: newTotal });
    setNewItem({ productId: "", size: "", quantity: 1 });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = (form.items || []).filter((_, i) => i !== index);
    const newTotal = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setForm({ ...form, items: updatedItems, total: newTotal });
  };

  const handleSave = async () => {
    if (!form.customerName?.trim()) {
      showToast("❌ Customer name is required");
      return;
    }
    setSaving(true);
    try {
      if (modalMode === "add") {
        const total = form.items.length > 0
          ? form.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
          : parseFloat(form.total) || 0;

        await addOrder({
          customerName: form.customerName,
          phone: form.phone,
          city: form.city,
          address: form.address,
          note: form.note,
          total,
          subtotal: total,
          shipping: 0,
          items: form.items || [],
        });
        showToast("✓ Order added successfully");
      } else {
        await updateOrderDetails(form.id, {
          customerName: form.customerName,
          phone: form.phone,
          city: form.city,
          address: form.address,
          note: form.note,
          total: parseFloat(form.total) || 0,
          items: form.items || [],
        });
        showToast("✓ Order updated successfully");
      }
      setModalMode(null);
      setForm(null);
    } catch (err) {
      console.error("Save order failed:", err);
      showToast(
        modalMode === "add"
          ? "❌ Failed to add order: " + (err?.message || "Unknown error")
          : "❌ Failed to update order: " + (err?.message || "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  };

  const filtered = orders
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter((o) => {
      const q = search.toLowerCase();
      return (
        !q ||
        String(o.id)?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.phone?.includes(q)
      );
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
        <button className="ado-add-btn" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Order
        </button>
      </div>

      {/* Supabase Error */}
      {ordersError && (
        <div className="ado-error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Supabase error: {ordersError}. Make sure you are logged in and Supabase RLS policies allow admin access.</span>
        </div>
      )}

      {/* Filters */}
      <div className="ado-filters">
        <div className="ado-search-wrap">
          <svg className="ado-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
      {ordersLoading ? (
        <div className="ado-loading">
          <span className="ado-spinner-icon" />
          <span>Loading orders...</span>
        </div>
      ) : filtered.length === 0 ? (
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
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>

                  <div className="ado-cell ado-customer-cell">
                    <div className="ado-avatar">
                      {(order.customerName || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="ado-cname">{order.customerName || "—"}</div>
                      <div className="ado-cphone">{order.phone || "—"}</div>
                      {order.address && (
                        <div
                          className="ado-caddress"
                          style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}
                        >
                          {order.address}{order.city ? `, ${order.city}` : ""}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ado-cell">
                    <span className="ado-items-count">
                      {Array.isArray(order.items) ? order.items.length : 0} item(s)
                    </span>
                  </div>

                  <div className="ado-cell">
                    <span className="ado-total">{Number(order.total || 0).toFixed(0)} DH</span>
                  </div>

                  <div className="ado-cell" onClick={(e) => e.stopPropagation()}>
                    <select
                      className="ado-status-select"
                      value={order.status || "pending"}
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
                      <button
                        className="ado-action-btn edit"
                        onClick={(e) => handleEditClick(e, order)}
                        title="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        className="ado-action-btn del"
                        onClick={(e) => handleDeleteClick(e, order.id)}
                        title="Delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <span className={`ado-chevron${isExpanded ? " up" : ""}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="ado-expanded">
                    <div className="ado-exp-section">
                      <div className="ado-exp-title">Order Items</div>
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        <div className="ado-items-grid">
                          {order.items.map((item, i) => (
                            <div key={i} className="ado-item">
                              <img
                                src={item.image || "/logo.png"}
                                alt={item.name}
                                className="ado-item-img"
                                onError={(e) => { e.target.src = "/logo.png"; }}
                              />
                              <div className="ado-item-info">
                                <span className="ado-item-name">{item.name}</span>
                                <span className="ado-item-meta">Size: {item.size} · Qty: {item.quantity}</span>
                              </div>
                              <span className="ado-item-price">
                                {((item.price || 0) * (item.quantity || 1)).toFixed(0)} DH
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>No items recorded.</p>
                      )}
                    </div>

                    {order.address && (
                      <div className="ado-exp-section">
                        <div className="ado-exp-title">Shipping Address</div>
                        <p className="ado-exp-addr">
                          {order.address}{order.city ? `, ${order.city}` : ""}
                        </p>
                      </div>
                    )}

                    {order.note && (
                      <div className="ado-exp-section">
                        <div className="ado-exp-title">Customer Note</div>
                        <p className="ado-exp-note">"{order.note}"</p>
                      </div>
                    )}

                    <div className="ado-exp-totals">
                      <span className="ado-exp-total-final">
                        Total: <strong>{Number(order.total || 0).toFixed(0)} DH</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {modalMode && form && createPortal(
        <div className="ado-overlay" onClick={() => { setModalMode(null); setForm(null); }}>
          <div className="ado-modal" onClick={e => e.stopPropagation()}>
            <div className="ado-modal-header">
              <h2 className="ado-modal-title">
                {modalMode === "add" ? "Add New Order" : `Edit Order #${form.id}`}
              </h2>
              <button className="ado-modal-close" onClick={() => { setModalMode(null); setForm(null); }}>✕</button>
            </div>
            <div className="ado-modal-body">
              <div className="ado-form-grid">
                <div className="ado-field">
                  <label>Customer Name *</label>
                  <input value={form.customerName || ""} onChange={handleChange("customerName")} placeholder="Full name" />
                </div>
                <div className="ado-field">
                  <label>Phone Number</label>
                  <input value={form.phone || ""} onChange={handleChange("phone")} placeholder="0612345678" />
                </div>
                <div className="ado-field ado-field-full">
                  <label>Address</label>
                  <input value={form.address || ""} onChange={handleChange("address")} placeholder="Street address" />
                </div>
                <div className="ado-field">
                  <label>City</label>
                  <input value={form.city || ""} onChange={handleChange("city")} placeholder="Casablanca" />
                </div>

                {/* Items Section */}
                <div className="ado-field ado-field-full">
                  <label>Order Items</label>
                  <div className="ado-items-editor">
                    <div className="ado-item-add-row">
                      <select
                        value={newItem.productId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const prod = products.find(p => String(p.id) === String(pId));
                          let dSize = "";
                          if (prod) {
                            const sizesArr = getProductSizes(prod);
                            if (sizesArr.length > 0) dSize = sizesArr[0];
                          }
                          setNewItem({ ...newItem, productId: pId, size: dSize });
                        }}
                        className="ado-item-select"
                      >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.price} DH
                          </option>
                        ))}
                      </select>
                      <select
                        value={newItem.size}
                        onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
                        disabled={!newItem.productId}
                        className="ado-item-size"
                      >
                        <option value="">Size...</option>
                        {(() => {
                          if (!newItem.productId) return null;
                          const prod = products.find(p => String(p.id) === String(newItem.productId));
                          const sizesArr = getProductSizes(prod);
                          return sizesArr.map((s, idx) => (
                            <option key={`${s}-${idx}`} value={s}>{s}</option>
                          ));
                        })()}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                        className="ado-item-qty"
                        placeholder="Qty"
                      />
                      <button
                        className="ado-add-item-btn"
                        onClick={handleAddItem}
                        disabled={!newItem.productId || !newItem.size}
                      >
                        Add
                      </button>
                    </div>

                    <div className="ado-items-list">
                      {(form.items || []).length === 0 ? (
                        <p className="ado-items-empty">No items added yet. Select a product above.</p>
                      ) : (
                        (form.items || []).map((it, idx) => (
                          <div key={idx} className="ado-item-row">
                            <img
                              src={it.image || "/logo.png"}
                              alt=""
                              className="ado-item-row-img"
                              onError={(e) => { e.target.src = "/logo.png"; }}
                            />
                            <div className="ado-item-row-info">
                              <span className="ado-item-row-name">{it.name}</span>
                              <span className="ado-item-row-meta">
                                Size: {it.size} | Qty: {it.quantity} | {((it.price || 0) * (it.quantity || 1)).toFixed(0)} DH
                              </span>
                            </div>
                            <button className="ado-remove-item-btn" onClick={() => handleRemoveItem(idx)}>✕</button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="ado-field">
                  <label>Total (DH)</label>
                  <input
                    type="number"
                    value={form.items?.length > 0
                      ? form.items.reduce((acc, it) => acc + ((it.price || 0) * (it.quantity || 1)), 0).toFixed(0)
                      : (form.total || "")}
                    onChange={handleChange("total")}
                    readOnly={form.items?.length > 0}
                    style={{ opacity: form.items?.length > 0 ? 0.7 : 1 }}
                  />
                </div>
                <div className="ado-field ado-field-full">
                  <label>Customer Note</label>
                  <textarea value={form.note || ""} onChange={handleChange("note")} rows={3} />
                </div>
              </div>
            </div>
            <div className="ado-modal-footer">
              <button className="ado-cancel-btn" onClick={() => { setModalMode(null); setForm(null); }}>Cancel</button>
              <button
                className={`ado-save-btn${saving ? " loading" : ""}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? <><span className="ado-spinner"/>Saving...</>
                  : modalMode === "add" ? "Add Order" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmId && createPortal(
        <div className="ado-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="ado-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="ado-confirm-icon">🗑️</div>
            <h3>Delete Order?</h3>
            <p>
              Are you sure you want to delete order <strong>#{deleteConfirmId}</strong>? This cannot be undone.
            </p>
            <div className="ado-confirm-actions">
              <button className="ado-cancel-btn" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="ado-delete-confirm-btn" onClick={confirmDelete}>Delete Order</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
