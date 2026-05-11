import { useState, useEffect } from "react";
import { fetchProducts } from "../lib/productService";

// Map Supabase snake_case → camelCase to match existing component props
const normalize = (p) => ({
  ...p,
  originalPrice: p.original_price ?? p.originalPrice ?? null,
});

/**
 * Fetches all products from Supabase.
 * Falls back to the static products.js list if Supabase is unreachable.
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data.map(normalize));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Supabase product fetch failed:", err);
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived filter helpers (replicate static helpers)
  const clubs     = [...new Set(products.filter((p) => p.club).map((p) => p.club))];
  const countries = [...new Set(products.map((p) => p.country))];

  return { products, loading, error, clubs, countries };
}
