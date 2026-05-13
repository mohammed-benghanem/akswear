import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { AdminProvider } from "./context/AdminContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Order from "./pages/Order";
import Confirmation from "./pages/Confirmation";
import ScrollToTop from "./components/ScrollToTop";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import "./index.css";





function StoreWrapper() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  // Only change dir/lang on the HTML element — never touch i18n language for admin
  useEffect(() => {
    if (isAdmin) {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
      document.body.className = document.body.className.replace(/\blang-[a-z]{2}\b/g, "");
      document.body.classList.add("lang-en");
    } else {
      const dir = i18n.language === "ar" ? "rtl" : "ltr";
      document.documentElement.dir = dir;
      document.documentElement.lang = i18n.language;
      document.body.className = document.body.className.replace(/\blang-[a-z]{2}\b/g, "");
      document.body.classList.add(`lang-${i18n.language}`);
    }
  }, [isAdmin, i18n.language]);

  const lang = isAdmin ? "en" : i18n.language;
  const dir  = isAdmin ? "ltr" : i18n.dir();

  return (
    <>
      <Helmet htmlAttributes={{ lang, dir }}>
        <title>{t('site.title')}</title>
        <meta name="description" content={t('site.description')} />
      </Helmet>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <Routes>
        {/* ── Store routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
        <Route path="/confirmation" element={<Confirmation />} />

        {/* ── Admin routes ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <CartProvider>
        <BrowserRouter>
          <StoreWrapper />
        </BrowserRouter>
      </CartProvider>
    </AdminProvider>
  );
}

function NotFound() {
  return (
    <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>
      <div>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>⚽</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "4rem", color: "var(--gold)" }}>404</h1>
        <p style={{ color: "var(--white-80)", marginBottom: "24px" }}>Page not found. The ball went out of bounds!</p>
        <a href="/" className="btn btn-primary">Back to Home</a>
      </div>
    </div>
  );
}
