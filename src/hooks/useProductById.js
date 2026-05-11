import { useState, useEffect } from "react";
import { fetchProductById } from "../lib/productService";

const normalize = (p) => ({
  ...p,
  originalPrice: p.original_price ?? p.originalPrice ?? null,
});

/**
 * Fetches a single product by integer ID from Supabase.
 */
export function useProductById(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetchProductById(id)
      .then((data) => {
        if (!cancelled) { setProduct(normalize(data)); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) { setError(err); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [id]);

  return { product, loading, error };
}
