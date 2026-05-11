import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import heroBg from "../assets/background.jpg";
import "./Home.css";
import nationalImg from "../assets/nationalteams.jpg";
import retroImg from "../assets/retro.avif";
import clubImg from "../assets/club.png";
import { FaShippingFast, FaPhoneAlt, FaUndo, FaCheckCircle, FaBolt, FaShieldAlt } from "react-icons/fa";

const CLUB_LOGOS = [
  { name: "Real Madrid", src: "https://media.api-sports.io/football/teams/541.png" },
  { name: "Barcelona", src: "https://media.api-sports.io/football/teams/529.png" },
  { name: "Manchester City", src: "https://media.api-sports.io/football/teams/50.png" },
  { name: "Liverpool", src: "https://media.api-sports.io/football/teams/40.png" },
  { name: "PSG", src: "https://media.api-sports.io/football/teams/85.png" },
  { name: "Bayern Munich", src: "https://media.api-sports.io/football/teams/157.png" },
  { name: "Ajax", src: "https://media.api-sports.io/football/teams/194.png" },
  { name: "AC Milan", src: "https://media.api-sports.io/football/teams/489.png" },
  { name: "Juventus", src: "https://media.api-sports.io/football/teams/496.png" },
  { name: "Chelsea", src: "https://media.api-sports.io/football/teams/49.png" },
  { name: "Arsenal", src: "https://media.api-sports.io/football/teams/42.png" },
  { name: "Dortmund", src: "https://media.api-sports.io/football/teams/165.png" },
];

const LEAGUE_LOGOS = [
  { name: "Champions League", src: "https://media.api-sports.io/football/leagues/2.png" },
  { name: "Premier League", src: "https://media.api-sports.io/football/leagues/39.png" },
  { name: "La Liga", src: "https://media.api-sports.io/football/leagues/140.png" },
  { name: "Bundesliga", src: "https://media.api-sports.io/football/leagues/78.png" },
  { name: "Serie A", src: "https://media.api-sports.io/football/leagues/135.png" },
  { name: "Ligue 1", src: "https://media.api-sports.io/football/leagues/61.png" },
  { name: "Europa League", src: "https://media.api-sports.io/football/leagues/3.png" },
  { name: "World Cup", src: "https://media.api-sports.io/football/leagues/1.png" },
  { name: "Eredivisie", src: "https://media.api-sports.io/football/leagues/88.png" },
  { name: "Primeira Liga", src: "https://media.api-sports.io/football/leagues/94.png" },
];

const collections = [
  {
    id: "club",
    title: "Club Jerseys",
    sub: "Top European clubs",
    count: "200+ styles",
    img: clubImg,
  },
  {
    id: "national",
    title: "National Teams",
    sub: "Represent your nation",
    count: "80+ countries",
    img: nationalImg,

  },
  {
    id: "retro",
    title: "Retro Kits",
    sub: "Golden era classics",
    count: "150+ vintage styles",
    img: retroImg,
  },
];

const testimonials = [
  { stars: 5, text: "The quality is outstanding. The Argentina World Cup kit arrived in perfect condition, exactly as described.", name: "James M.", sub: "London, UK", avatar: "⚽" },
  { stars: 5, text: "Super fast delivery and a phone call to confirm my order — love the personal touch. Will order again!", name: "Sofia L.", sub: "Madrid, Spain", avatar: "🏆" },
  { stars: 5, text: "Best retro kit store online. Got the AC Milan 2003 jersey and it looks incredible. 10/10.", name: "Marco T.", sub: "Milan, Italy", avatar: "🌟" },
];

const CardSkeleton = () => (
  <div style={{ height: 340, borderRadius: 14, background: "linear-gradient(90deg,#e4dfd3 25%,#f0ece4 50%,#e4dfd3 75%)", backgroundSize: "800px 100%", animation: "shimmer 1.4s infinite linear" }} />
);

export default function Home() {
  const { t } = useTranslation();
  const { products, loading } = useProducts();
  const featured    = products.filter((p) => p.badge === "Best Seller" || p.badge === "Limited" || p.rating >= 4.8).slice(0, 4);
  const newArrivals = products.filter((p) => p.badge === "New").slice(0, 4);

  const translatedCollections = [
    { ...collections[0], title: t('home.collections.club.title'), sub: t('home.collections.club.sub'), count: t('home.collections.club.count') },
    { ...collections[1], title: t('home.collections.national.title'), sub: t('home.collections.national.sub'), count: t('home.collections.national.count') },
    { ...collections[2], title: t('home.collections.retro.title'), sub: t('home.collections.retro.sub'), count: t('home.collections.retro.count') }
  ];

  const translatedWhy = [
    { icon: <FaBolt />, title: t('home.why.fastDispatch.title'), desc: t('home.why.fastDispatch.desc') },
    { icon: <FaShieldAlt />, title: t('home.why.authentic.title'), desc: t('home.why.authentic.desc') },
    { icon: <FaPhoneAlt />, title: t('home.why.phoneConfirm.title'), desc: t('home.why.phoneConfirm.desc') },
    { icon: <FaUndo />, title: t('home.why.returns.title'), desc: t('home.why.returns.desc') },
  ];

  const translatedTestimonials = [
    { ...testimonials[0], text: t('home.testimonials.t1') },
    { ...testimonials[1], text: t('home.testimonials.t2') },
    { ...testimonials[2], text: t('home.testimonials.t3') },
  ];

  return (
    <div className="home page-wrapper">

      {/* ── PROMO STRIP ── */}
      <div className="promo-strip">
        <div className="promo-strip-inner">
          <div className="promo-strip-item"><FaShippingFast className="promo-icon" /> <span>{t('home.promo.fastDelivery')}</span></div>
          <div className="promo-strip-dot" />
          <div className="promo-strip-item"><FaPhoneAlt className="promo-icon" /> <span>{t('home.promo.orderPhone')}</span></div>
          <div className="promo-strip-dot" />
          <div className="promo-strip-item"><FaUndo className="promo-icon" /> <span>{t('home.promo.returns')}</span></div>
          <div className="promo-strip-dot" />
          <div className="promo-strip-item"><FaCheckCircle className="promo-icon" /> <span>{t('home.promo.authentic')}</span></div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src={heroBg}
            alt="Premium football jerseys"
            className="hero-bg-img"
          />
          <div className="hero-bg-gradient" />
        </div>

        <div className="hero-content container">
          <div className="hero-inner">
            <div className="hero-text fade-in-up">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-line" />
                {t('home.hero.eyebrow')}
              </div>
              <h1 className="hero-title">
                {t('home.hero.title1')}<br />
                <span className="hero-title-accent">{t('home.hero.title2')}</span>
              </h1>
              <p className="hero-subtitle">
                {t('home.hero.subtitle')}
              </p>
              <div className="hero-actions">
                <Link to="/shop" className="btn hero-btn-main">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                  {t('home.hero.shopNow')}
                </Link>
                <Link to="/shop?badge=New" className="btn hero-btn-secondary">
                  {t('home.hero.newArrivals')}
                </Link>
              </div>
            </div>


          </div>
        </div>

        <div className="hero-scroll">
          <div className="scroll-line" />
        </div>
      </section>



      {/* ── LOGOS MARQUEE ── */}
      <div className="logos-marquee-section">
        <div className="logos-row">
          <div className="logos-track logos-track--left">
            {[...CLUB_LOGOS, ...CLUB_LOGOS, ...CLUB_LOGOS].map((c, i) => (
              <div key={i} className="logo-chip">
                <img src={c.src} alt={c.name} loading="lazy" />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="logos-row">
          <div className="logos-track logos-track--right">
            {[...LEAGUE_LOGOS, ...LEAGUE_LOGOS, ...LEAGUE_LOGOS].map((l, i) => (
              <div key={i} className="logo-chip">
                <img src={l.src} alt={l.name} loading="lazy" />
                <span>{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COLLECTIONS ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">{t('home.collections.label')}</div>
            <h2 className="section-title">{t('home.collections.title1')} <span>{t('home.collections.title2')}</span></h2>
            <div className="gold-line" />
          </div>
          <div className="collections-grid">
            {translatedCollections.map((col) => (
              <Link to={`/shop?category=${col.id}`} key={col.id} className="collection-card">
                <div className="collection-img-wrap">
                  <img src={col.img} alt={col.title} className="collection-img" />
                  <div className="collection-img-overlay">
                    <div className="collection-overlay-content">
                      <div className="collection-title">{col.title}</div>
                      <div className="collection-overlay-sub">{col.sub}</div>
                    </div>
                  </div>
                </div>
                <div className="collection-body">
                  <span className="collection-count">{col.count}</span>
                  <div className="collection-arrow">→</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAN FAVOURITES ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header section-header-row">
            <div>
              <div className="section-label">{t('home.favorites.label')}</div>
              <h2 className="section-title">{t('home.favorites.title1')} <span>{t('home.favorites.title2')}</span></h2>
              <div className="gold-line" />
            </div>
            <Link to="/shop" className="btn btn-outline see-all-btn">{t('home.favorites.viewAll')}</Link>
          </div>
          <div className="products-grid">
            {loading ? Array.from({length:4}).map((_,i)=><CardSkeleton key={i}/>) : featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── WHY AKS WEAR ── */}
      <section className="section why-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">{t('home.why.label')}</div>
            <h2 className="section-title">{t('home.why.title1')} <span>{t('home.why.title2')}</span></h2>
            <div className="gold-line" />
          </div>
          <div className="why-grid">
            {translatedWhy.map((f) => (
              <div key={f.title} className="why-card">
                <div className="why-icon">{f.icon}</div>
                <h3 className="why-title">{f.title}</h3>
                <p className="why-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="section">
        <div className="container">
          <div className="section-header section-header-row">
            <div>
              <div className="section-label">{t('home.newArrivals.label')}</div>
              <h2 className="section-title">{t('home.newArrivals.title1')} <span>{t('home.newArrivals.title2')}</span></h2>
              <div className="gold-line" />
            </div>
            <Link to="/shop?badge=New" className="btn btn-outline see-all-btn">{t('home.favorites.viewAll')}</Link>
          </div>
          <div className="products-grid">
            {loading ? Array.from({length:4}).map((_,i)=><CardSkeleton key={i}/>) : newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-label">{t('home.testimonials.label')}</div>
            <h2 className="section-title">{t('home.testimonials.title1')} <span>{t('home.testimonials.title2')}</span></h2>
            <div className="gold-line" />
          </div>
          <div className="testimonials-grid">
            {translatedTestimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">{"★".repeat(t.stars)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.avatar}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-sub">{t.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHATSAPP FLOAT ── */}
      <a
        href="https://wa.me/1234567890?text=Hi!%20I%27m%20interested%20in%20a%20jersey."
        target="_blank"
        rel="noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="whatsapp-tooltip">Chat on WhatsApp</span>
      </a>
    </div>
  );
}
