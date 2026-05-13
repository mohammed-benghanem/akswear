import { supabase } from "./supabase";

// Normalize DB row → app-friendly object
const normalizeProduct = (p) => {
  if (!p) return p;
  return {
    ...p,
    // Map snake_case DB columns to camelCase used by the UI
    originalPrice: p.original_price ?? p.originalPrice ?? null,
  };
};

export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id");
  if (error) throw error;
  return data.map(normalizeProduct);
};

export const fetchProductById = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(id))
    .single();
  if (error) throw error;
  return normalizeProduct(data);
};

export const createProduct = async (product) => {
  // Strip camelCase keys that conflict with DB schema, map to snake_case
  const { originalPrice, ...rest } = product;
  const dbProduct = { ...rest, original_price: originalPrice ?? null };
  // Remove undefined values that can cause issues
  Object.keys(dbProduct).forEach(k => dbProduct[k] === undefined && delete dbProduct[k]);

  const { data, error } = await supabase
    .from("products")
    .insert([dbProduct])
    .select()
    .single();
  if (error) throw error;
  return normalizeProduct(data);
};

export const updateProduct = async (id, updates) => {
  const { originalPrice, ...rest } = updates;
  const dbUpdates = { ...rest, original_price: originalPrice ?? null };
  // Remove undefined values
  Object.keys(dbUpdates).forEach(k => dbUpdates[k] === undefined && delete dbUpdates[k]);

  const { data, error } = await supabase
    .from("products")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return normalizeProduct(data);
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};

export const uploadImage = async (file) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
};
