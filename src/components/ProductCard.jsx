import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const { dispatch } = useCart();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: "M",
        quantity: 1,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((v) => !v);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const fullStars = Math.floor(product.rating);
  const halfStar = product.rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.images[0]}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />

        {/* Badges */}
        <div className="product-badges">
          {product.badge === "New" && <span className="badge badge-gold">New</span>}
          {product.badge === "Sale" && <span className="badge badge-accent">Sale</span>}
          {product.badge === "Best Seller" && <span className="badge badge-gold">⭐ Best Seller</span>}
          {product.badge === "Limited" && <span className="badge badge-accent">Limited</span>}
          {product.badge === "Retro" && <span className="badge badge-dark">Retro</span>}
        </div>

        {/* Discount badge – top-right */}
        {discount && (
          <span className="badge badge-discount">−{discount}%</span>
        )}

        {/* Wishlist */}


        {/* Hover overlay */}
        <div className="product-overlay">
          <button
            className={`add-cart-btn${added ? " added" : ""}`}
            onClick={handleAddToCart}
          >
            {added ? "✓" : t('product.addToCart')}
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-category">
          {product.country}{product.club ? ` · ${product.club}` : ""}
        </div>

        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          {"★".repeat(fullStars)}
          {halfStar && "½"}
          {"☆".repeat(emptyStars)}
          <span className="rating-count">({product.reviews})</span>
        </div>

        <div className="product-prices">
          <span className="product-price">{product.price.toFixed(0)} DH</span>
          {product.originalPrice && (
            <span className="product-original">{product.originalPrice.toFixed(0)} DH</span>
          )}
        </div>
      </div>
    </Link>
  );
}
