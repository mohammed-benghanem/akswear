import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";
import "./Navbar.css";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <img src="/logo.png" alt="AKS Wear" className="nav-logo-img" />
          </Link>

          {/* Desktop Links */}
          <ul className="nav-links">
            <li><Link to="/" className="nav-link">{t('navbar.home')}</Link></li>
            <li><Link to="/shop" className="nav-link">{t('navbar.shop')}</Link></li>
            <li><Link to="/shop?category=club" className="nav-link">{t('navbar.clubKits')}</Link></li>
            <li><Link to="/shop?category=national" className="nav-link">{t('navbar.nationalTeams')}</Link></li>
            <li><Link to="/shop?category=retro" className="nav-link">{t('navbar.retroKits')}</Link></li>
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            <select
              className="lang-switcher"
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              aria-label="Change Language"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="ar">AR</option>
            </select>

            <button
              className="nav-icon-btn"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t('navbar.search')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>

            <Link to="/cart" className="nav-cart-btn" aria-label={t('navbar.cart')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>

            <button
              className="hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <span className={menuOpen ? "open" : ""}></span>
              <span className={menuOpen ? "open" : ""}></span>
              <span className={menuOpen ? "open" : ""}></span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="search-bar-wrap">
            <form className="container search-form" onSubmit={handleSearch}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                ref={searchRef}
                type="text"
                placeholder={t('navbar.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary search-submit">{t('navbar.search')}</button>
              <button type="button" className="nav-icon-btn" onClick={() => setSearchOpen(false)}>✕</button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <ul className="mobile-nav-links">
          <li><Link to="/">{t('navbar.home')}</Link></li>
          <li><Link to="/shop">{t('navbar.allJerseys')}</Link></li>
          <li><Link to="/shop?category=club">{t('navbar.clubKits')}</Link></li>
          <li><Link to="/shop?category=national">{t('navbar.nationalTeams')}</Link></li>
          <li><Link to="/shop?category=retro">{t('navbar.retroKits')}</Link></li>
          <li><Link to="/cart">{t('navbar.cart')} {totalItems > 0 && `(${totalItems})`}</Link></li>
        </ul>
      </div>
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
