import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import {
  fetchProducts as sbFetchProducts,
  createProduct as sbCreateProduct,
  updateProduct as sbUpdateProduct,
  deleteProduct as sbDeleteProduct,
} from "../lib/productService";
import {
  fetchOrders as sbFetchOrders,
  updateOrderStatus as sbUpdateOrderStatus,
  createOrder as sbCreateOrder,
  updateOrderDetails as sbUpdateOrderDetails,
  deleteOrder as sbDeleteOrder
} from "../lib/orderService";
import { fetchSettings as sbFetchSettings, saveSettings as sbSaveSettings } from "../lib/settingsService";

const AdminContext = createContext(null);

const DEFAULT_SETTINGS = {
  store_name: "AKS Wear",
  contact_email: "support@akswear.com",
  whatsapp: "+1234567890",
  free_shipping_threshold: 0,
  shipping_cost: 0,
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // ── Load all admin data ──────────────────────────────────
  const loadData = useCallback(async () => {
    setProductsLoading(true);
    setOrdersLoading(true);
    try {
      const [prods, ords, sett] = await Promise.all([
        sbFetchProducts(),
        sbFetchOrders(),
        sbFetchSettings(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setSettings(sett || DEFAULT_SETTINGS);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setProductsLoading(false);
      setOrdersLoading(false);
    }
  }, []);

  // ── Auth: check session on mount ─────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authed = !!session;
      setIsAuthenticated(authed);
      setAuthLoading(false);
      if (authed) loadData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session;
      setIsAuthenticated(authed);
      if (authed) loadData();
    });

    return () => subscription.unsubscribe();
  }, [loadData]);

  // ── Auth actions ─────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError("Incorrect email or password. Please try again.");
      return false;
    }
    return true;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setProducts([]);
    setOrders([]);
  }, []);

  // ── Products CRUD ────────────────────────────────────────
  const addProduct = useCallback(async (product) => {
    const created = await sbCreateProduct(product);
    setProducts((prev) => [...prev, created]);
    return created;
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    const updated = await sbUpdateProduct(id, updates);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const deleteProduct = useCallback(async (id) => {
    await sbDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Orders ───────────────────────────────────────────────
  const addOrder = useCallback(async (order) => {
    const id = `ORD-${Date.now().toString().slice(-4)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const orderData = {
      id,
      customer_name: order.customerName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      note: order.note,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: "pending"
    };
    try {
      const created = await sbCreateOrder(orderData);
      setOrders((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error("Failed to create order in Supabase:", err);
      // Fallback to local state if Supabase fails (e.g. if anonymous inserts are blocked or network error)
      const fallbackOrder = { ...orderData, created_at: new Date().toISOString() };
      setOrders((prev) => [fallbackOrder, ...prev]);
      return fallbackOrder;
    }
  }, []);

  const updateOrderStatus = useCallback(async (id, status) => {
    await sbUpdateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  const updateOrderDetails = useCallback(async (id, updates) => {
    // Map camelCase to snake_case for DB
    const dbUpdates = {};
    if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.note !== undefined) dbUpdates.note = updates.note;
    if (updates.total !== undefined) dbUpdates.total = updates.total;

    await sbUpdateOrderDetails(id, dbUpdates);

    // Update local state with the camelCase versions
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  }, []);

  const deleteOrder = useCallback(async (id) => {
    await sbDeleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  // ── Settings ─────────────────────────────────────────────
  const updateSettings = useCallback(async (updates) => {
    if (updates.newPassword) {
      const { error } = await supabase.auth.updateUser({ password: updates.newPassword });
      if (error) throw error;
    }
    const { newPassword, ...rest } = updates;
    if (Object.keys(rest).length > 0) {
      await sbSaveSettings(rest);
      setSettings((prev) => ({ ...prev, ...rest }));
    }
  }, []);

  // ── Stats ────────────────────────────────────────────────
  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((acc, o) => acc + (o.total || 0), 0),
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    recentOrders: orders.slice(0, 5),
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated, authLoading,
      login, logout, loginError, setLoginError,
      products, productsLoading,
      addProduct, updateProduct, deleteProduct,
      orders, ordersLoading,
      addOrder, updateOrderStatus, updateOrderDetails, deleteOrder,
      settings, updateSettings,
      stats, loadData,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};
