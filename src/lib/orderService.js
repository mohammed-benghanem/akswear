import { supabase } from "./supabase";

// Normalize DB row (snake_case) → app-friendly (camelCase)
const normalizeOrder = (o) => {
  if (!o) return o;
  return {
    ...o,
    customerName: o.customer_name ?? o.customerName ?? "",
    createdAt: o.created_at ?? o.createdAt ?? new Date().toISOString(),
    // Ensure items is always an array
    items: Array.isArray(o.items) ? o.items : [],
    total: typeof o.total === "number" ? o.total : parseFloat(o.total) || 0,
    status: o.status || "pending",
  };
};

export const fetchOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(normalizeOrder);
};

export const fetchOrderById = async (id) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return normalizeOrder(data);
};

export const createOrder = async (order) => {
  const { data, error } = await supabase
    .from("orders")
    .insert([order])
    .select()
    .single();
  if (error) throw error;
  return normalizeOrder(data);
};

export const updateOrderStatus = async (id, status) => {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
};

export const updateOrderDetails = async (id, updates) => {
  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return normalizeOrder(data);
};

export const deleteOrder = async (id) => {
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);
  if (error) throw error;
};
