import { supabase } from "./supabase";

export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id");
  if (error) throw error;
  return data;
};

export const fetchProductById = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(id))
    .single();
  if (error) throw error;
  return data;
};

export const createProduct = async (product) => {
  const { originalPrice, ...rest } = product;
  const dbProduct = { ...rest, original_price: originalPrice ?? null };
  const { data, error } = await supabase
    .from("products")
    .insert([dbProduct])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProduct = async (id, updates) => {
  const dbUpdates = { ...updates };
  if (dbUpdates.originalPrice !== undefined) {
    dbUpdates.original_price = dbUpdates.originalPrice;
    delete dbUpdates.originalPrice;
  }
  
  const { data, error } = await supabase
    .from("products")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};

export const uploadImage = async (file) => {
  const fileExt = file.name.split('.').pop();
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
