import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useProductById } from "../hooks/useProductById";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import "./Product.css";

export default function Product() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const { product, loading } = useProductById(id);
  const { products: allProducts } = useProducts();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚽</div>
          <p style={{ color: "var(--text-3)" }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-wrapper not-found">
        <div className="container">
          <h1>Jersey not found</h1>
          <Link to="/shop" className="btn btn-primary">← Back to Shop</Link>
        </div>
      </div>
    );
  }

  // Related: same category or country, exclude current
  const related = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.country === product.country))
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const outOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2500);
      return;
    }
    const cleanSize = selectedSize.includes(':') ? selectedSize.split(':')[0] : selectedSize;
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: cleanSize,
        quantity,
      },
    });
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2500);
      return;
    }
    const cleanSize = selectedSize.includes(':') ? selectedSize.split(':')[0] : selectedSize;
    
    navigate("/order", {
      state: {
        buyNowItem: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          size: cleanSize,
          quantity,
        }
      }
    });
  };

  return (
    <div className="product-page page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb product-breadcrumb">
          <Link to="/">{t('navbar.home')}</Link>
          <span>/</span>
          <Link to="/shop">{t('navbar.shop')}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="product-detail-grid">
          {/* ── Gallery ── */}
          <div className="product-gallery">
            <div className="main-image-wrap">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="main-image"
              />
              {product.badge && (
                <div className="main-image-badge">
                  <span className={`badge ${product.badge === "Sale" || product.badge === "Limited" ? "badge-accent" :
                    product.badge === "Retro" ? "badge-dark" : "badge-gold"
                    }`}>{product.badge}</span>
                  {discount && <span className="badge badge-accent">-{discount}%</span>}
                </div>
              )}
            </div>
            <div className="thumbnails">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`thumb${selectedImage === i ? " active" : ""}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* ── Info ── */}
          <div className="product-info-panel">
            <div className="product-meta-row">
              <span className="meta-badge">{product.category.toUpperCase()}</span>
              <span className="meta-badge">{product.country}</span>
              {product.club && <span className="meta-badge">{product.club}</span>}
            </div>

            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-rating">
              <span className="stars">{"★".repeat(Math.floor(product.rating))}{"☆".repeat(5 - Math.floor(product.rating))}</span>
              <span className="rating-num">{product.rating}</span>
              <span className="rating-reviews">({product.reviews} {t('product.reviews')})</span>
            </div>

            <div className="detail-prices">
              <span className="detail-price">{product.price.toFixed(0)} DH</span>
              {product.originalPrice && (
                <>
                  <span className="detail-original">{product.originalPrice.toFixed(0)} DH</span>
                  <span className="discount-chip">{t('product.save')} {discount}%</span>
                </>
              )}
            </div>

            <div className="divider" />

            {/* Size Selector */}
            {outOfStock ? (
              <div className="out-of-stock-banner">
                <span>🚫</span>
                <span>{t('product.outOfStock')}</span>
              </div>
            ) : (
              <>
                <div className="selector-group">
                  <div className="selector-label">
                    <span>{t('product.size')}</span>
                    {selectedSize && <span className="selected-val">{selectedSize.includes(':') ? selectedSize.split(':')[0] : selectedSize}</span>}
                  </div>
                  <div className={`size-grid${sizeError ? " size-error" : ""}`}>
                    {product.sizes.map((s) => {
                      const sizeName = s.includes(':') ? s.split(':')[0] : s;
                      const sizeStock = s.includes(':') ? parseInt(s.split(':')[1]) : null;
                      const isOutOfStock = sizeStock === 0;
                      return (
                        <button
                          key={s}
                          className={`size-btn${selectedSize === s ? " active" : ""}${isOutOfStock ? " disabled-size" : ""}`}
                          onClick={() => {
                            if (!isOutOfStock) {
                              setSelectedSize(s);
                              setSizeError(false);
                              const newMax = sizeStock !== null ? sizeStock : (product.stock || 10);
                              if (quantity > newMax) {
                                setQuantity(Math.max(1, newMax));
                              }
                            }
                          }}
                          disabled={isOutOfStock}
                          title={isOutOfStock ? t('product.outOfStock') : ''}
                        >
                          {sizeName}
                        </button>
                      );
                    })}
                  </div>
                  {sizeError && <p className="error-msg">⚠ {t('product.sizeError')}</p>}
                </div>

                {/* Quantity */}
                <div className="selector-group">
                  <div className="selector-label"><span>{t('product.quantity')}</span></div>
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >−</button>
                    <span className="qty-value">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => {
                        let maxAvailable = product.stock || 10;
                        if (selectedSize && selectedSize.includes(':')) {
                          maxAvailable = parseInt(selectedSize.split(':')[1]) || 0;
                        }
                        const finalMax = Math.min(10, maxAvailable);
                        setQuantity((q) => Math.min(finalMax, q + 1));
                      }}
                      disabled={(() => {
                        let maxAvailable = product.stock || 10;
                        if (selectedSize && selectedSize.includes(':')) {
                          maxAvailable = parseInt(selectedSize.split(':')[1]) || 0;
                        }
                        return quantity >= Math.min(10, maxAvailable);
                      })()}
                    >+</button>
                  </div>
                </div>

                {/* Actions */}
                <div className="product-actions">
                  <button
                    className={`btn btn-primary add-to-cart-main${addedMsg ? " success" : ""}`}
                    onClick={handleAddToCart}
                  >
                    {addedMsg
                      ? "✓"
                      : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                          {t('product.addToCart')}
                        </>
                      )
                    }
                  </button>
                  <button className="btn btn-outline buy-now-btn" onClick={handleBuyNow}>
                    {t('product.buyNow')}
                  </button>
                </div>
              </>
            )}

            {/* Trust badges */}
            <div className="trust-badges">
              <div className="trust-badge"><span>📦</span> {t('product.freeShipping')}</div>
              <div className="trust-badge"><span>↩️</span> {t('product.easyReturns')}</div>
              <div className="trust-badge"><span>📞</span> {t('product.phoneConfirm')}</div>
            </div>

            <div className="divider" />

            {/* Tags */}
            <div className="product-tags">
              {product.tags.map((t) => (
                <span key={t} className="tag">#{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="product-tabs">
          <div className="tabs-nav">
            {[
              { key: "description", label: t('product.tabDescription') },
              { key: "sizing",      label: t('product.tabSizing') },
              { key: "delivery",    label: t('product.tabDelivery') },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`tab-btn${activeTab === key ? " active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="tab-content glass-card">
            {activeTab === "description" && (
              <div>
                <p className="tab-text">{product.description}</p>
                <ul className="feature-list">
                  <li>✓ {t('product.feat1')}</li>
                  <li>✓ {t('product.feat2')}</li>
                  <li>✓ {t('product.feat3')}</li>
                  <li>✓ {t('product.feat4')}</li>
                </ul>
              </div>
            )}
            {activeTab === "sizing" && (
              <div className="sizing-table-wrap">
                <p className="tab-text" style={{ marginBottom: '20px' }}>{t('product.sizingNote')}</p>
                <table className="sizing-table">
                  <thead><tr><th>{t('product.sizingSize')}</th><th>{t('product.sizingChest')}</th><th>{t('product.sizingLength')}</th><th>{t('product.sizingFit')}</th></tr></thead>
                  <tbody>
                    <tr><td>XS</td><td>84–89</td><td>67</td><td>{t('product.fitSlim')}</td></tr>
                    <tr><td>S</td><td>90–95</td><td>70</td><td>{t('product.fitSlim')}</td></tr>
                    <tr><td>M</td><td>96–101</td><td>73</td><td>{t('product.fitRegular')}</td></tr>
                    <tr><td>L</td><td>102–107</td><td>76</td><td>{t('product.fitRegular')}</td></tr>
                    <tr><td>XL</td><td>108–113</td><td>79</td><td>{t('product.fitRelaxed')}</td></tr>
                    <tr><td>XXL</td><td>114–119</td><td>82</td><td>{t('product.fitRelaxed')}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "delivery" && (
              <div>
                <ul className="feature-list">
                  <li>{t('product.delivery1')}</li>
                  <li>{t('product.delivery2')}</li>
                  <li>{t('product.delivery3')}</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section className="related-section">
            <div className="section-header">
              <div className="section-label">{t('product.related')}</div>
              <h2 className="section-title">{t('product.relatedTitle1')} <span>{t('product.relatedTitle2')}</span></h2>
              <div className="gold-line" />
            </div>
            <div className="related-grid">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
