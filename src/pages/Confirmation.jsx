import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Confirmation.css";

export default function Confirmation() {
  const { t } = useTranslation();
  const { state } = useLocation();

  const name = state?.name || "Customer";
  const phone = state?.phone || "";

  useEffect(() => {
    if (window.fbq) {
      window.fbq("track", "Purchase", {
        value: state?.total || 350,
        currency: "MAD",
      });
    }
  }, [state]);

  return (
    <div className="confirmation-page page-wrapper">
      <div className="container">
        <div className="confirmation-card glass-card">

          <div className="confirm-icon-wrap">
            <div className="confirm-ring confirm-ring-1" />
            <div className="confirm-ring confirm-ring-2" />
            <div className="confirm-icon">✓</div>
          </div>

          <div className="confirm-badge badge badge-gold">
            {t("confirmation.badge")}
          </div>

          <h1 className="confirm-title">
            {t("confirmation.title")},
            <br />
            {name.split(" ")[0]}!
          </h1>

          <p className="confirm-message">
            {t("confirmation.message")}
            {phone ? ` (${phone})` : ""}
          </p>

          <div className="confirm-steps">

            <div className="confirm-step done">
              <div className="cs-icon">✓</div>

              <div>
                <strong>
                  {t("confirmation.steps.placedTitle")}
                </strong>

                <p>
                  {t("confirmation.steps.placedDesc")}
                </p>
              </div>
            </div>

            <div className="confirm-step-line" />

            <div className="confirm-step pending">
              <div className="cs-icon">📞</div>

              <div>
                <strong>
                  {t("confirmation.steps.phoneTitle")}
                </strong>

                <p>
                  {t("confirmation.steps.phoneDesc")}
                </p>
              </div>
            </div>

            <div className="confirm-step-line" />

            <div className="confirm-step pending">
              <div className="cs-icon">🚀</div>

              <div>
                <strong>
                  {t("confirmation.steps.deliveryTitle")}
                </strong>

                <p>
                  {t("confirmation.steps.deliveryDesc")}
                </p>
              </div>
            </div>

          </div>

          <div className="confirm-info-box">
            <p>
              <strong>{t("confirmation.help")}</strong>{" "}

              <a
                href="https://wa.me/212675777859"
                target="_blank"
                rel="noreferrer"
                className="confirm-link"
              >
                06 75 77 78 59
              </a>

              {" "}
              {t("confirmation.email")}{" "}

              <a
                href="mailto:akswear1@gmail.com"
                className="confirm-link"
              >
                akswear1@gmail.com
              </a>
            </p>
          </div>

          <div className="confirm-actions">

            <Link
              to="/shop"
              className="btn btn-primary confirm-btn"
            >
              {t("cart.continueShopping")} →
            </Link>

            <Link
              to="/"
              className="btn btn-outline confirm-btn"
            >
              {t("navbar.home")}
            </Link>

          </div>

        </div>

        <p className="confirm-footer-note">
          <img
            src="/logo.png"
            alt="AKS Wear"
            className="confirm-footer-logo"
          />{" "}
          — {t("confirmation.footer")}
        </p>

      </div>
    </div>
  );
}