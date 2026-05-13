import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import "./Cart.css";

export default function Cart() {
  const { t } = useTranslation();
  const { items, dispatch, totalPrice } = useCart();

  const updateQty = (id, size, qty) => {
    if (qty < 1) return;
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, size, quantity: qty } });
  };

  const remove = (id, size) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id, size } });
  };

  if (items.length === 0) {
    return (
      <div className="cart-page page-wrapper">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>{t('cart.empty')}</h2>
            <Link to="/shop" className="btn btn-primary">{t('cart.continueShopping')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const shipping = 0;
  const total = totalPrice;

  return (
    <div className="cart-page page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="cart-header">
          <div>
            <div className="section-label">{t('cart.selection')}</div>
            <h1 className="section-title">{t('cart.title')}</h1>
            <div className="gold-line" />
          </div>
          <nav className="breadcrumb">
            <Link to="/">{t('navbar.home')}</Link> <span>/</span>
            <Link to="/shop">{t('navbar.shop')}</Link> <span>/</span>
            <span>{t('navbar.cart')}</span>
          </nav>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            <div className="cart-items-header">
              <span>{t('cart.product')}</span>
              <span>{t('cart.price')}</span>
              <span>{t('cart.quantity')}</span>
              <span>{t('cart.itemTotal')}</span>
              <span></span>
            </div>

            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="cart-item">
                <div className="cart-item-product">
                  <Link to={`/product/${item.id}`} className="cart-item-img-wrap">
                    <img src={item.image} alt={item.name} />
                  </Link>
                  <div className="cart-item-details">
                    <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                    <div className="cart-item-meta">{t('cart.size')} <span>{item.size}</span></div>
                  </div>
                </div>

                <div className="cart-item-price">{item.price.toFixed(0)} {t('cart.currency')}</div>

                <div className="cart-item-qty">
                  <button
                    className="qty-btn-sm"
                    onClick={() => updateQty(item.id, item.size, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >−</button>
                  <span>{item.quantity}</span>
                  <button
                    className="qty-btn-sm"
                    onClick={() => updateQty(item.id, item.size, item.quantity + 1)}
                    disabled={item.quantity >= 10}
                  >+</button>
                </div>

                <div className="cart-item-total">{(item.price * item.quantity).toFixed(0)} {t('cart.currency')}</div>

                <button
                  className="remove-btn"
                  onClick={() => remove(item.id, item.size)}
                  aria-label="Remove item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            ))}

            {/* Continue shopping */}
            <div className="cart-continue">
              <Link to="/shop" className="btn btn-dark">
                ← {t('cart.continueShopping')}
              </Link>
              <button
                className="btn-danger btn"
                onClick={() => dispatch({ type: "CLEAR_CART" })}
              >
                {t('cart.clearCart')}
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside className="cart-summary glass-card">
            <h2 className="summary-title">{t('cart.summary')}</h2>

            <div className="summary-rows">
              <div className="summary-row">
                <span>{t('cart.subtotal')} ({items.reduce((a, i) => a + i.quantity, 0)})</span>
                <span>{totalPrice.toFixed(0)} {t('cart.currency')}</span>
              </div>
              <div className="summary-row">
                <span>{t('cart.shipping')}</span>
                <span className={shipping === 0 ? "free-shipping" : ""}>
                  {shipping === 0 ? t('cart.freeShipping') : `${shipping.toFixed(0)} ${t('cart.currency')}`}
                </span>
              </div>

            </div>

            <div className="divider" />

            <div className="summary-total">
              <span>{t('cart.total')}</span>
              <span>{total.toFixed(0)} {t('cart.currency')}</span>
            </div>

            <Link to="/order" className="btn btn-primary place-order-btn">
              {t('cart.checkout')} →
            </Link>

            <div className="no-payment-note">
              <span>📞</span>
              <span>{t('cart.noOnlinePayment')}</span>
            </div>

            <div className="summary-accepts">
              <span className="accept-tag">💵 {t('cart.cod')}</span>
              <span className="accept-tag">📦 {t('cart.freeReturns')}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
