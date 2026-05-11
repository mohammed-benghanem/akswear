import { useState, useRef } from "react";
import { useAdmin } from "../../context/AdminContext";
import { uploadImage } from "../../lib/productService";
import "./AdminProducts.css";

const EMPTY_FORM = {
  name: "", club: "", country: "", category: "club",
  price: "", originalPrice: "", badge: "", stock: 50,
  description: "", tags: "", sizes: "XS,S,M,L,XL,XXL",
  images: "",
};
const CATEGORIES = ["club", "national", "retro"];
const BADGES = ["", "New", "Sale", "Limited", "Retro", "Best"];

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [modal, setModal]     = useState(null); // null | 'add' | 'edit'
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [search, setSearch]   = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [toast, setToast]     = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditProduct(null);
    setModal("add");
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name || "",
      club: product.club || "",
      country: product.country || "",
      category: product.category || "club",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      badge: product.badge || "",
      stock: product.stock ?? 50,
      description: product.description || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      sizes: Array.isArray(product.sizes) ? product.sizes.join(",") : "XS,S,M,L,XL,XXL",
      images: Array.isArray(product.images) ? product.images.filter(s => typeof s === "string").join("\n") : "",
    });
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditProduct(null);
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const buildPayload = () => ({
    ...form,
    price: parseFloat(form.price) || 0,
    originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
    stock: parseInt(form.stock) || 0,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
    club: form.club || null,
    badge: form.badge || null,
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    setTimeout(() => {
      if (modal === "add") {
        addProduct(buildPayload());
        showToast("✓ Product added successfully");
      } else {
        updateProduct(editProduct.id, buildPayload());
        showToast("✓ Product updated successfully");
      }
      setSaving(false);
      closeModal();
    }, 600);
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    setDeleteConfirm(null);
    showToast("Product deleted");
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const urls = await Promise.all(files.map(file => uploadImage(file)));
      setForm(f => ({
        ...f,
        images: f.images ? `${f.images}\n${urls.join('\n')}` : urls.join('\n')
      }));
      showToast("✓ Images uploaded");
    } catch (err) {
      console.error("Image upload failed:", err);
      showToast("❌ Image upload failed");
    } finally {
      setUploadingImages(false);
      e.target.value = null; // reset input
    }
  };

  const filtered = products
    .filter((p) => catFilter === "all" || p.category === catFilter)
    .filter((p) => {
      const q = search.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || (p.club || "").toLowerCase().includes(q);
    });

  return (
    <div className="adp-root">
      {toast && <div className="adp-toast">{toast}</div>}

      {/* Header */}
      <div className="adp-header">
        <div>
          <h1 className="adp-title">Products</h1>
          <p className="adp-subtitle">{products.length} jerseys in your catalog</p>
        </div>
        <button id="adp-add-btn" className="adp-add-btn" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="adp-filters">
        <div className="adp-search-wrap">
          <svg className="adp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="adp-search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="adp-cat-tabs">
          {["all", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              className={`adp-cat-tab${catFilter === cat ? " active" : ""}`}
              onClick={() => setCatFilter(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="adp-table-card">
        <div className="adp-table-wrap">
          <table className="adp-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Badge</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.25)" }}>
                    No products found
                  </td>
                </tr>
              ) : filtered.map((p) => {
                const imgSrc = typeof p.images?.[0] === "string" ? p.images[0] : "/logo.png";
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="adp-product-cell">
                        <div className="adp-thumb-wrap">
                          <img src={imgSrc} alt={p.name} className="adp-thumb" />
                        </div>
                        <div>
                          <div className="adp-prod-name">{p.name}</div>
                          <div className="adp-prod-sub">{p.club || p.country}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`adp-cat-badge adp-cat-${p.category}`}>
                        {p.category}
                      </span>
                    </td>
                    <td>
                      <div className="adp-price-cell">
                        <span className="adp-price">{p.price} DH</span>
                        {p.originalPrice && (
                          <span className="adp-original">{p.originalPrice} DH</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`adp-stock ${(p.stock ?? 50) < 10 ? "adp-stock-low" : ""}`}>
                        {p.stock ?? 50}
                      </span>
                    </td>
                    <td>
                      {p.badge ? (
                        <span className="adp-badge-pill">{p.badge}</span>
                      ) : (
                        <span className="adp-no-badge">—</span>
                      )}
                    </td>
                    <td>
                      <span className="adp-rating">★ {p.rating?.toFixed(1)}</span>
                      <span className="adp-reviews"> ({p.reviews})</span>
                    </td>
                    <td>
                      <div className="adp-actions">
                        <button className="adp-edit-btn" onClick={() => openEdit(p)} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button className="adp-del-btn" onClick={() => setDeleteConfirm(p)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      {modal && (
        <div className="adp-overlay" onClick={closeModal}>
          <div className="adp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adp-modal-header">
              <h2 className="adp-modal-title">
                {modal === "add" ? "Add New Product" : "Edit Product"}
              </h2>
              <button className="adp-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="adp-modal-body">
              <div className="adp-form-grid">
                <div className="adp-field adp-field-full">
                  <label>Product Name *</label>
                  <input value={form.name} onChange={handleChange("name")} placeholder="e.g. Real Madrid Home Kit 2024/25" />
                </div>
                <div className="adp-field">
                  <label>Club</label>
                  <input value={form.club} onChange={handleChange("club")} placeholder="e.g. Real Madrid" />
                </div>
                <div className="adp-field">
                  <label>Country</label>
                  <input value={form.country} onChange={handleChange("country")} placeholder="e.g. Spain" />
                </div>
                <div className="adp-field">
                  <label>Category *</label>
                  <select value={form.category} onChange={handleChange("category")}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="adp-field">
                  <label>Badge</label>
                  <select value={form.badge} onChange={handleChange("badge")}>
                    {BADGES.map((b) => <option key={b} value={b}>{b || "None"}</option>)}
                  </select>
                </div>
                <div className="adp-field">
                  <label>Price (DH) *</label>
                  <input type="number" value={form.price} onChange={handleChange("price")} placeholder="89.99" min="0" />
                </div>
                <div className="adp-field">
                  <label>Original Price (DH)</label>
                  <input type="number" value={form.originalPrice} onChange={handleChange("originalPrice")} placeholder="119.99" min="0" />
                </div>
                <div className="adp-field">
                  <label>Stock Quantity</label>
                  <input type="number" value={form.stock} onChange={handleChange("stock")} min="0" />
                </div>
                <div className="adp-field">
                  <label>Sizes (comma-separated)</label>
                  <input value={form.sizes} onChange={handleChange("sizes")} placeholder="XS,S,M,L,XL,XXL" />
                </div>
                <div className="adp-field adp-field-full">
                  <label>Tags (comma-separated)</label>
                  <input value={form.tags} onChange={handleChange("tags")} placeholder="official, home, nike" />
                </div>
                <div className="adp-field adp-field-full">
                  <label>Description</label>
                  <textarea value={form.description} onChange={handleChange("description")} rows={3} placeholder="Product description..." />
                </div>
                <div className="adp-field adp-field-full">
                  <label>Images</label>
                  <div className="adp-image-upload-wrap">
                    <label className={`adp-upload-btn ${uploadingImages ? 'disabled' : ''}`}>
                      {uploadingImages ? <span className="adp-spinner"/> : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      )}
                      <span>{uploadingImages ? "Uploading..." : "Upload Images"}</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={uploadingImages}
                        hidden
                      />
                    </label>
                  </div>
                  <textarea 
                    value={form.images} 
                    onChange={handleChange("images")} 
                    rows={3} 
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" 
                    className="adp-images-textarea"
                  />
                  <small className="adp-field-hint">Upload files or paste direct URLs (one per line).</small>
                </div>
              </div>
            </div>

            <div className="adp-modal-footer">
              <button className="adp-cancel-btn" onClick={closeModal}>Cancel</button>
              <button
                className={`adp-save-btn${saving ? " loading" : ""}`}
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.price}
              >
                {saving ? <><span className="adp-spinner"/>Saving...</> : modal === "add" ? "Add Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="adp-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="adp-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adp-confirm-icon">🗑️</div>
            <h3>Delete Product?</h3>
            <p>Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.</p>
            <div className="adp-confirm-actions">
              <button className="adp-cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="adp-delete-confirm-btn" onClick={() => handleDelete(deleteConfirm.id)}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
