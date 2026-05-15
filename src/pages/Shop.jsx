import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import "./Shop.css";

const SORT_OPTIONS = [
  { value: "featured", labelKey: "sortPopular" },
  { value: "price-asc",  labelKey: "sortLowHigh" },
  { value: "price-desc", labelKey: "sortHighLow" },
  { value: "rating",     labelKey: "sortPopular" },
  { value: "newest",     labelKey: "sortPopular" },
];

export default function Shop() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { products, loading, clubs, countries } = useProducts();

  // Filter state
  const [filters, setFilters] = useState({
    category: params.get("category") || "",
    country:  params.get("country")  || "",
    club:     params.get("club")     || "",
    size:     params.get("size")     || "",
    badge:    params.get("badge")    || "",
    priceMax: params.get("priceMax") || "2000",
    sort:     "featured",
    search:   params.get("search")   || "",
  });

  useEffect(() => {
    setFilters((f) => ({
      ...f,
      category: params.get("category") || "",
      country:  params.get("country")  || "",
      club:     params.get("club")     || "",
      badge:    params.get("badge")    || "",
      search:   params.get("search")   || "",
    }));
  }, [params]);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.club && p.club.toLowerCase().includes(q)) ||
          p.country.toLowerCase().includes(q)
      );
    }
    if (filters.category) list = list.filter((p) => p.category === filters.category);
    if (filters.country)  list = list.filter((p) => p.country  === filters.country);
    if (filters.club)     list = list.filter((p) => p.club     === filters.club);
    if (filters.badge)    list = list.filter((p) => p.badge    === filters.badge);
    if (filters.size)     list = list.filter((p) => p.sizes.includes(filters.size));
    list = list.filter((p) => p.price <= parseFloat(filters.priceMax));

    switch (filters.sort) {
      case "price-asc":  list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating":     list.sort((a, b) => b.rating - a.rating); break;
      case "featured":
      default:
        list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        break;
    }

    return list;
  }, [filters, products]);

  const clearFilters = () => {
    setFilters({ category: "", country: "", club: "", size: "", badge: "", priceMax: "2000", sort: "featured", search: "" });
    setParams({});
  };

  const hasActiveFilters = filters.category || filters.country || filters.club || filters.size || filters.badge || filters.search;

  return (
    <div className="shop page-wrapper">
      {/* Banner */}
      <div className="shop-banner">
        <div className="container shop-banner-inner">
          <div>
            <div className="section-label">{t('shop.title')}</div>
            <h1 className="section-title">The <span>Collection</span></h1>
          </div>
          <nav className="breadcrumb">
            <Link to="/">{t('navbar.home')}</Link> <span>/</span> <span>{t('navbar.shop')}</span>
          </nav>
        </div>
      </div>

      <div className="container shop-layout">
        {/* ── Sidebar ── */}
        <aside className={`shop-sidebar${filtersOpen ? " open" : ""}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-title">{t('shop.filters')}</h2>
            {hasActiveFilters && (
              <button className="clear-filters" onClick={clearFilters}>{t('shop.clearAll')}</button>
            )}
          </div>

          {/* Category */}
          <div className="filter-group">
            <h3 className="filter-label">{t('shop.category')}</h3>
            <div className="filter-pills">
              {["", "club", "national", "retro"].map((c) => (
                <button
                  key={c}
                  className={`filter-pill${filters.category === c ? " active" : ""}`}
                  onClick={() => setFilter("category", c)}
                >
                  {c === "" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div className="filter-group">
            <h3 className="filter-label">Country</h3>
            <select
              className="filter-select"
              value={filters.country}
              onChange={(e) => setFilter("country", e.target.value)}
            >
              <option value="">All</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Club */}
          <div className="filter-group">
            <h3 className="filter-label">Club</h3>
            <select
              className="filter-select"
              value={filters.club}
              onChange={(e) => setFilter("club", e.target.value)}
            >
              <option value="">All Clubs</option>
              {clubs.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Size */}
          <div className="filter-group">
            <h3 className="filter-label">Size</h3>
            <div className="filter-pills">
              {["", "XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                <button
                  key={s}
                  className={`filter-pill${filters.size === s ? " active" : ""}`}
                  onClick={() => setFilter("size", s)}
                >
                  {s || "All"}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="filter-group">
            <h3 className="filter-label">{t('shop.price')}: <span className="price-val">{filters.priceMax} DH</span></h3>
            <input
              type="range"
              min="400" max="2000" step="50"
              value={filters.priceMax}
              onChange={(e) => setFilter("priceMax", e.target.value)}
              className="price-range"
            />
            <div className="price-range-labels"><span>400 DH</span><span>2000 DH</span></div>
          </div>

          {/* Badge */}
          <div className="filter-group">
            <h3 className="filter-label">Collection</h3>
            <div className="filter-pills wrap">
              {["", "New", "Sale", "Best Seller", "Retro", "Limited"].map((b) => (
                <button
                  key={b}
                  className={`filter-pill${filters.badge === b ? " active" : ""}`}
                  onClick={() => setFilter("badge", b)}
                >
                  {b || "All"}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {filtersOpen && <div className="sidebar-overlay" onClick={() => setFiltersOpen(false)} />}

        {/* ── Main ── */}
        <main className="shop-main">
          {/* Toolbar */}
          <div className="shop-toolbar">
            <div className="result-count">
              {filtered.length} {t('shop.results')}
              {filters.search && <span className="search-tag"> "{filters.search}"</span>}
            </div>
            <div className="toolbar-right">
              <button className="filter-toggle-btn" onClick={() => setFiltersOpen((v) => !v)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                {t('shop.filters')}
              </button>
              <select
                className="sort-select"
                value={filters.sort}
                onChange={(e) => setFilter("sort", e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(`shop.${o.labelKey}`)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="active-filters">
              {filters.category && <span className="active-tag">{filters.category} ✕<button onClick={() => setFilter("category", "")}/></span>}
              {filters.country  && <span className="active-tag">{filters.country} <button onClick={() => setFilter("country", "")}>✕</button></span>}
              {filters.club     && <span className="active-tag">{filters.club} <button onClick={() => setFilter("club", "")}>✕</button></span>}
              {filters.size     && <span className="active-tag">Size: {filters.size} <button onClick={() => setFilter("size", "")}>✕</button></span>}
              {filters.badge    && <span className="active-tag">{filters.badge} <button onClick={() => setFilter("badge", "")}>✕</button></span>}
              {filters.search   && <span className="active-tag">"{filters.search}" <button onClick={() => setFilter("search", "")}>✕</button></span>}
            </div>
          )}

          {loading ? (
            <div className="shop-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card-skeleton" style={{
                  height: 360, borderRadius: 14,
                  background: "linear-gradient(90deg,#e4dfd3 25%,#f0ece4 50%,#e4dfd3 75%)",
                  backgroundSize: "800px 100%",
                  animation: "shimmer 1.4s infinite linear"
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👕</div>
              <h3>{t('shop.noResults')}</h3>
              <button className="btn btn-outline" onClick={clearFilters}>{t('shop.clearAll')}</button>
            </div>
          ) : (
            <div className="shop-grid">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
