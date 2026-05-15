import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAdmin } from "../context/AdminContext";
import "./Order.css";

export default function Order() {
  const { t } = useTranslation();
  const { items, totalPrice, dispatch } = useCart();
  const { addOrder } = useAdmin();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    city: "",
    address: "",
    phone: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const shippingDisplay = 0;
  const totalDisplay = totalPrice + shippingDisplay;

  if (items.length === 0) {
    return (
      <div className="order-page page-wrapper">
        <div className="container">
          <div className="order-empty">
            <div className="empty-icon">🛒</div>
            <h2>{t('checkout.emptyCart')}</h2>
            <p>{t('checkout.emptyMsg')}</p>
            <Link to="/shop" className="btn btn-primary">{t('checkout.browse')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = t('checkout.firstNameReq');
    if (!form.lastName.trim()) e.lastName = t('checkout.lastNameReq');
    if (!form.city.trim()) e.city = t('checkout.cityReq');
    if (!form.address.trim()) e.address = t('checkout.addressReq');
    if (!form.phone.trim()) e.phone = t('checkout.phoneReq');
    else if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone)) e.phone = t('checkout.phoneInvalid');
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const shipping = 0;
  const total = totalPrice + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);

    // Save order to admin dashboard
    await addOrder({
      customerName: `${form.firstName} ${form.lastName}`.trim(),
      phone: form.phone,
      city: form.city,
      address: form.address,
      note: form.note,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
      })),
      subtotal: totalPrice,
      shipping,
      total,
    });

    dispatch({ type: "CLEAR_CART" });
    navigate("/confirmation", { state: { name: `${form.firstName} ${form.lastName}`.trim(), phone: form.phone } });
  };

  return (
    <div className="order-page page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="order-header">
          <div>
            <div className="section-label">{t('checkout.almostDone')}</div>
            <h1 className="section-title">{t('checkout.title')}</h1>
            <div className="gold-line" />
          </div>
          <nav className="breadcrumb">
            <Link to="/">{t('navbar.home')}</Link> <span>/</span>
            <Link to="/cart">{t('navbar.cart')}</Link> <span>/</span>
            <span>{t('checkout.title')}</span>
          </nav>
        </div>

        {/* Steps indicator */}
        <div className="order-steps">
          <div className="step done"><div className="step-circle">✓</div><span>{t('checkout.stepCart')}</span></div>
          <div className="step-line done" />
          <div className="step active"><div className="step-circle">2</div><span>{t('checkout.stepDetails')}</span></div>
          <div className="step-line" />
          <div className="step"><div className="step-circle">3</div><span>{t('checkout.stepConfirm')}</span></div>
        </div>

        <div className="order-layout">
          {/* ── Form ── */}
          <div className="order-form-wrap">
            <div className="no-payment-banner">
              <span className="banner-icon">📞</span>
              <div>
                <strong>{t('home.promo.verify')}</strong>
                <p>{t('checkout.paymentNote')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="order-form" noValidate>
              <div className="form-section-title">{t('checkout.shipping')}</div>

              <div className="form-row">
                <div className={`form-group${errors.firstName ? " has-error" : ""}`}>
                  <label htmlFor="firstName">{t('checkout.firstName')} <span className="required">*</span></label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder={t('checkout.firstNameEg')}
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    autoComplete="given-name"
                  />
                  {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                </div>

                <div className={`form-group${errors.lastName ? " has-error" : ""}`}>
                  <label htmlFor="lastName">{t('checkout.lastName')} <span className="required">*</span></label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder={t('checkout.lastNameEg')}
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    autoComplete="family-name"
                  />
                  {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className={`form-group${errors.city ? " has-error" : ""}`}>
                  <label htmlFor="city">{t('checkout.city')} <span className="required">*</span></label>
                  <input
                    id="city"
                    type="text"
                    placeholder={t('checkout.cityEg')}
                    value={form.city}
                    onChange={handleChange("city")}
                    autoComplete="address-level2"
                  />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>

                <div className={`form-group${errors.phone ? " has-error" : ""}`}>
                  <label htmlFor="phone">{t('checkout.phone')} <span className="required">*</span></label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder={t('checkout.phoneEg')}
                    value={form.phone}
                    onChange={handleChange("phone")}
                    autoComplete="tel"
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                  <span className="field-hint">{t('checkout.phoneHint')}</span>
                </div>
              </div>

              <div className={`form-group${errors.address ? " has-error" : ""}`}>
                <label htmlFor="address">{t('checkout.address')} <span className="required">*</span></label>
                <textarea
                  id="address"
                  placeholder={t('checkout.addressEg')}
                  value={form.address}
                  onChange={handleChange("address")}
                  rows={3}
                  autoComplete="street-address"
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="note">{t('checkout.note')} <span className="optional">{t('checkout.noteOptional')}</span></label>
                <textarea
                  id="note"
                  placeholder={t('checkout.noteEg')}
                  value={form.note}
                  onChange={handleChange("note")}
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary submit-order-btn${submitting ? " loading" : ""}`}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className="spinner" /> {t('checkout.processing')}</>
                ) : (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg> {t('checkout.confirm')}</>
                )}
              </button>
            </form>
          </div>

          {/* ── Order Summary ── */}
          <aside className="order-summary glass-card">
            <h2 className="summary-title">{t('checkout.yourOrder')}</h2>

            <div className="order-items-list">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="order-item">
                  <div className="order-item-img">
                    <img src={item.image} alt={item.name} />
                    <span className="order-item-qty">{item.quantity}</span>
                  </div>
                  <div className="order-item-info">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-size">{t('checkout.size')}: {item.size}</p>
                  </div>
                  <span className="order-item-price">{(item.price * item.quantity).toFixed(0)} DH</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div className="order-totals">
              <div className="total-row"><span>{t('cart.subtotal')}</span><span>{totalPrice.toFixed(0)} DH</span></div>
              <div className="total-row">
                <span>{t('cart.shipping')}</span>
                <span className={shippingDisplay === 0 ? "free-shipping" : ""}>{shippingDisplay === 0 ? t('cart.freeShipping') : `${shippingDisplay.toFixed(0)} DH`}</span>
              </div>
              <div className="total-row total-final">
                <span>{t('cart.total')}</span>
                <span>{totalDisplay.toFixed(0)} DH</span>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
