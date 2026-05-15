import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import {
  fetchProducts as sbFetchProducts,
  fetchProductById as sbFetchProductById,
  createProduct as sbCreateProduct,
  updateProduct as sbUpdateProduct,
  deleteProduct as sbDeleteProduct,
} from "../lib/productService";
import {
  fetchOrders as sbFetchOrders,
  fetchOrderById as sbFetchOrderById,
  updateOrderStatus as sbUpdateOrderStatus,
  createOrder as sbCreateOrder,
  updateOrderDetails as sbUpdateOrderDetails,
  deleteOrder as sbDeleteOrder,
} from "../lib/orderService";
import {
  fetchSettings as sbFetchSettings,
  saveSettings as sbSaveSettings,
} from "../lib/settingsService";

const AdminContext = createContext(null);

const DEFAULT_SETTINGS = {
  store_name: "AKS Wear",
  contact_email: "akswear1@gmail.com",
  whatsapp: "0675777859",
  free_shipping_threshold: 0,
  shipping_cost: 0,
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // ── Load all admin data ──────────────────────────────────
  const loadData = useCallback(async () => {
    setProductsLoading(true);
    setOrdersLoading(true);
    setProductsError(null);
    setOrdersError(null);
    try {
      const [prods, ords, sett] = await Promise.all([
        sbFetchProducts(),
        sbFetchOrders(),
        sbFetchSettings(),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setOrders(Array.isArray(ords) ? ords : []);
      setSettings(sett || DEFAULT_SETTINGS);
    } catch (err) {
      console.error("Admin data load error:", err);
      // Split error to show in each section
      const errMsg = err?.message || "Failed to load data from Supabase";
      setProductsError(errMsg);
      setOrdersError(errMsg);
      setProducts([]);
      setOrders([]);
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session;
      setIsAuthenticated(authed);
      if (authed) {
        loadData();
      } else {
        // Clear data on sign out
        setProducts([]);
        setOrders([]);
        setProductsError(null);
        setOrdersError(null);
      }
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
    setProductsError(null);
    setOrdersError(null);
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
    return updated;
  }, []);

  const deleteProduct = useCallback(async (id) => {
    await sbDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Orders ───────────────────────────────────────────────
  const addOrder = useCallback(async (order) => {
    const clientId = `ORD-${Date.now().toString().slice(-6)}`;
    const orderData = {
      id: clientId,
      customer_name: order.customerName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      note: order.note,
      items: order.items || [],
      subtotal: parseFloat(order.subtotal) || parseFloat(order.total) || 0,
      shipping: parseFloat(order.shipping) || 0,
      total: parseFloat(order.total) || 0,
      status: "pending",
    };

    const created = await sbCreateOrder(orderData);
    setOrders((prev) => [created, ...prev]);

    // Decrement stock for ordered items
    try {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          try {
            const pId = item.productId || item.id;
            if (!pId) continue;
            
            const prod = await sbFetchProductById(pId);
            if (prod) {
              let newStock = Math.max(0, (prod.stock || 0) - item.quantity);
              let newSizes = [...(prod.sizes || [])];
              
              if (newSizes.some(s => typeof s === "string" && s.includes(':'))) {
                for (let i = 0; i < newSizes.length; i++) {
                  const s = newSizes[i];
                  if (typeof s === "string" && s.includes(':')) {
                    const parts = s.split(':');
                    if (parts[0] === item.size) {
                      const currentQty = parseInt(parts[1]) || 0;
                      const newQty = Math.max(0, currentQty - item.quantity);
                      newSizes[i] = `${parts[0]}:${newQty}`;
                      break;
                    }
                  }
                }
                // Recalculate total stock from sizes
                newStock = newSizes.reduce((sum, s) => {
                  const parts = s.split(':');
                  return sum + (parts.length > 1 ? (parseInt(parts[1]) || 0) : 0);
                }, 0);
              }

              const updatedProd = await sbUpdateProduct(prod.id, { stock: newStock, sizes: newSizes });
              setProducts((prev) => prev.map((p) => (p.id === prod.id ? updatedProd : p)));
            }
          } catch (e) {
            console.error("Failed to decrement stock for item:", item, e);
          }
        }
      }
    } catch (err) {
      console.error("Error updating stock after order:", err);
    }

    return created;
  }, []);

  const updateOrderStatus = useCallback(async (id, status) => {
    // Check if we are cancelling the order to restore stock
    try {
      const order = await sbFetchOrderById(id);
      if (order && order.status !== "cancelled" && status === "cancelled") {
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            try {
              const pId = item.productId || item.id;
              if (!pId) continue;
              
              const prod = await sbFetchProductById(pId);
              if (prod) {
                let newStock = (prod.stock || 0) + item.quantity;
                let newSizes = [...(prod.sizes || [])];
                
                if (newSizes.some(s => typeof s === "string" && s.includes(':'))) {
                  for (let i = 0; i < newSizes.length; i++) {
                    const s = newSizes[i];
                    if (typeof s === "string" && s.includes(':')) {
                      const parts = s.split(':');
                      if (parts[0] === item.size) {
                        const currentQty = parseInt(parts[1]) || 0;
                        const newQty = currentQty + item.quantity;
                        newSizes[i] = `${parts[0]}:${newQty}`;
                        break;
                      }
                    }
                  }
                  // Recalculate total stock from sizes
                  newStock = newSizes.reduce((sum, s) => {
                    const parts = s.split(':');
                    return sum + (parts.length > 1 ? (parseInt(parts[1]) || 0) : 0);
                  }, 0);
                }

                const updatedProd = await sbUpdateProduct(prod.id, { stock: newStock, sizes: newSizes });
                setProducts((prev) => prev.map((p) => (p.id === prod.id ? updatedProd : p)));
              }
            } catch (e) {
              console.error("Failed to increment stock for cancelled item:", item, e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error restoring stock on cancellation:", err);
    }

    await sbUpdateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  const updateOrderDetails = useCallback(async (id, updates) => {
    // Map camelCase → snake_case for the DB
    const dbUpdates = {};
    if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.note !== undefined) dbUpdates.note = updates.note;
    if (updates.total !== undefined) dbUpdates.total = updates.total;
    if (updates.items !== undefined) dbUpdates.items = updates.items;

    const updated = await sbUpdateOrderDetails(id, dbUpdates);

    // Merge into local state
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates, ...updated } : o))
    );
    return updated;
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
    totalRevenue: orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0),
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    recentOrders: orders.slice(0, 5),
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        login,
        logout,
        loginError,
        setLoginError,
        products,
        productsLoading,
        productsError,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        ordersLoading,
        ordersError,
        addOrder,
        updateOrderStatus,
        updateOrderDetails,
        deleteOrder,
        settings,
        updateSettings,
        stats,
        loadData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};
