import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
import LoadingScreen from "./components/LoadingScreen";
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

const BASE_URL = "https://akswear.shop";

const seoData = {
  "/": {
    title: "AKS Wear – Premium Football Jerseys & Soccer Kits",
    description:
      "Shop premium football jerseys, soccer kits, club jerseys, national team kits, and retro football shirts at AKS Wear. Free delivery across Morocco.",
  },
  "/shop": {
    title: "Shop Football Jerseys | AKS Wear",
    description:
      "Browse premium football jerseys, club kits, national team shirts, and retro football kits with delivery across Morocco.",
  },
  "/club-kits": {
    title: "Club Football Jerseys | AKS Wear",
    description:
      "Shop premium club football jerseys from top teams including Real Madrid, Barcelona, AC Milan, Manchester United, and more.",
  },
  "/national-teams": {
    title: "National Team Jerseys | AKS Wear",
    description:
      "Shop premium national team football jerseys including Morocco, Brazil, Argentina, France, Portugal, and more.",
  },
  "/retro-kits": {
    title: "Retro Football Shirts | AKS Wear",
    description:
      "Explore classic retro football shirts and vintage football kits from legendary clubs and national teams.",
  },
  "/cart": {
    title: "Your Cart | AKS Wear",
    description:
      "Review your selected football jerseys and complete your AKS Wear order.",
  },
  "/order": {
    title: "Checkout | AKS Wear",
    description:
      "Complete your football jersey order with phone confirmation and cash on delivery.",
  },
  "/confirmation": {
    title: "Order Confirmation | AKS Wear",
    description:
      "Your AKS Wear order has been confirmed. We will contact you by phone before delivery.",
  },
};

function StoreWrapper() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
      document.body.className = document.body.className.replace(
        /\blang-[a-z]{2}\b/g,
        ""
      );
      document.body.classList.add("lang-en");
    } else {
      const dir = i18n.language === "ar" ? "rtl" : "ltr";
      document.documentElement.dir = dir;
      document.documentElement.lang = i18n.language;
      document.body.className = document.body.className.replace(
        /\blang-[a-z]{2}\b/g,
        ""
      );
      document.body.classList.add(`lang-${i18n.language}`);
    }
  }, [isAdmin, i18n.language]);

  const lang = isAdmin ? "en" : i18n.language;
  const dir = isAdmin ? "ltr" : i18n.dir();

  const currentSeo = seoData[pathname] || {
    title: t("site.title") || "AKS Wear – Premium Football Jerseys",
    description:
      t("site.description") ||
      "Premium football jerseys, soccer kits, club jerseys, national team kits, and retro football shirts.",
  };

  const canonicalUrl = `${BASE_URL}${pathname === "/" ? "/" : pathname}`;

  return (
    <>
      <Helmet htmlAttributes={{ lang, dir }}>
        <title>{currentSeo.title}</title>

        <meta name="description" content={currentSeo.description} />
        <meta
          name="keywords"
          content="football jerseys, soccer kits, club jerseys, national team kits, retro football shirts, football kits Morocco, Real Madrid jersey, Barcelona jersey, Morocco jersey"
        />

        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={currentSeo.title} />
        <meta property="og:description" content={currentSeo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${BASE_URL}/og-image.jpg`} />
        <meta property="og:site_name" content="AKS Wear" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentSeo.title} />
        <meta name="twitter:description" content={currentSeo.description} />
        <meta name="twitter:image" content={`${BASE_URL}/og-image.jpg`} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "AKS Wear",
            url: BASE_URL,
            description:
              "Premium football jerseys, soccer kits, retro football shirts, club jerseys, and national team kits.",
            logo: `${BASE_URL}/logo.png`,
            image: `${BASE_URL}/og-image.jpg`,
            paymentAccepted: "Cash on Delivery",
            areaServed: {
              "@type": "Country",
              name: "Morocco",
            },
          })}
        </script>
      </Helmet>

      <ScrollToTop />

      {!isAdmin && <Navbar />}

      <Routes>
        {/* Store routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />

        {/* Sitelink-friendly routes */}
        <Route path="/club-kits" element={<Shop category="club" />} />
        <Route path="/national-teams" element={<Shop category="national" />} />
        <Route path="/retro-kits" element={<Shop category="retro" />} />

        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
        <Route path="/confirmation" element={<Confirmation />} />

        {/* Admin routes */}
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

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AdminProvider>
      <CartProvider>
        <BrowserRouter>
          {isLoading && <LoadingScreen onFinish={() => setIsLoading(false)} />}
          <StoreWrapper />
        </BrowserRouter>
      </CartProvider>
    </AdminProvider>
  );
}

function NotFound() {
  return (
    <div
      className="page-wrapper"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        textAlign: "center",
      }}
    >
      <div>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>⚽</div>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "4rem",
            color: "var(--gold)",
          }}
        >
          404
        </h1>
        <p style={{ color: "var(--white-80)", marginBottom: "24px" }}>
          Page not found. The ball went out of bounds!
        </p>
        <a href="/" className="btn btn-primary">
          Back to Home
        </a>
      </div>
    </div>
  );
}