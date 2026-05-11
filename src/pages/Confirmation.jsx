import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Confirmation.css";

export default function Confirmation() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const name = state?.name || "Valued Customer";
  const phone = state?.phone || "";

  return (
    <div className="confirmation-page page-wrapper">
      <div className="container">
        <div className="confirmation-card glass-card">
          {/* Confetti / Icon */}
          <div className="confirm-icon-wrap">
            <div className="confirm-ring confirm-ring-1" />
            <div className="confirm-ring confirm-ring-2" />
            <div className="confirm-icon">✓</div>
          </div>

          {/* Message */}
          <div className="confirm-badge badge badge-gold">Order Received 🎉</div>

          <h1 className="confirm-title">
            Thank You,<br />{name.split(" ")[0]}!
          </h1>

          <p className="confirm-message">
            Your order has been <strong>successfully received</strong>. Our team will contact you soon by phone{phone ? ` at ${phone}` : ""} to confirm delivery details and arrange shipment.
          </p>

          <div className="confirm-steps">
            <div className="confirm-step done">
              <div className="cs-icon">✓</div>
              <div>
                <strong>Order Placed</strong>
                <p>Your order details have been recorded</p>
              </div>
            </div>
            <div className="confirm-step-line" />
            <div className="confirm-step pending">
              <div className="cs-icon">📞</div>
              <div>
                <strong>Phone Confirmation</strong>
                <p>We'll call you to confirm within 24h</p>
              </div>
            </div>
            <div className="confirm-step-line" />
            <div className="confirm-step pending">
              <div className="cs-icon">🚀</div>
              <div>
                <strong>Delivery</strong>
                <p>Your jersey will be shipped promptly</p>
              </div>
            </div>
          </div>

          <div className="confirm-info-box">
            <p>
              <strong>Need help?</strong> WhatsApp us at{" "}
              <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="confirm-link">
                +1 234 567 890
              </a>
              {" "}or email{" "}
              <a href="mailto:support@akswear.com" className="confirm-link">
                support@akswear.com
              </a>
            </p>
          </div>

          <div className="confirm-actions">
            <Link to="/shop" className="btn btn-primary confirm-btn">
              {t('cart.continueShopping')} →
            </Link>
            <Link to="/" className="btn btn-outline confirm-btn">
              {t('navbar.home')}
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="confirm-footer-note">
          <img src="/logo.png" alt="AKS Wear" className="confirm-footer-logo" /> — Premium Football Jerseys. Thank you for trusting us!
        </p>
      </div>
    </div>
  );
}
