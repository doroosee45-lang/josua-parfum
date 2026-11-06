import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { boutiqueApi, getAdminToken } from '../services/api';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';

const BoutiqueContext = createContext(null);

export function BoutiqueProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [backendStatus, setBackendStatus] = useState({ connected: false, engine: '' });
  const [isHydrated, setIsHydrated] = useState(false);

  // Cart persisted in localStorage per visitor device
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('jp_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin auth state backed by JWT
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => Boolean(getAdminToken()));

  // Global luxury UI drawers/modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shareModalPayload, setShareModalPayload] = useState(null);
  const [directWaProduct, setDirectWaProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 3400 ? null : prev));
    }, 3500);
  }, []);

  const refreshAdminData = useCallback(async () => {
    const [adminProds, adminOrders, latestSettings] = await Promise.all([
      boutiqueApi.getAdminProducts(),
      boutiqueApi.getAdminOrders(),
      boutiqueApi.getSettings(),
    ]);
    setProducts(adminProds);
    setOrders(adminOrders);
    setSettings(latestSettings);
  }, []);

  // Hydrate from Express Backend on mount
  useEffect(() => {
    let mounted = true;

    async function hydrateFromBackend() {
      try {
        const [health, pubProducts, srvSettings] = await Promise.all([
          boutiqueApi.checkHealth().catch(() => null),
          boutiqueApi.getPublicProducts(),
          boutiqueApi.getSettings(),
        ]);

        if (!mounted) return;

        if (health) {
          setBackendStatus({ connected: true, engine: health.databaseEngine || 'api' });
        } else {
          setBackendStatus({ connected: true, engine: 'api' });
        }

        setProducts(pubProducts);
        setSettings(srvSettings);

        // If owner has a stored JWT, verify session and fetch full admin catalog + centralized orders
        if (getAdminToken()) {
          try {
            await boutiqueApi.verifyAdminSession();
            const [adminProds, adminOrders] = await Promise.all([
              boutiqueApi.getAdminProducts(),
              boutiqueApi.getAdminOrders(),
            ]);
            if (mounted) {
              setIsAdminAuthenticated(true);
              setProducts(adminProds);
              setOrders(adminOrders);
            }
          } catch {
            boutiqueApi.logoutAdmin();
            if (mounted) setIsAdminAuthenticated(false);
          }
        }
      } catch (err) {
        console.warn('Backend API indisponible momentanément:', err.message);
      } finally {
        if (mounted) setIsHydrated(true);
      }
    }

    hydrateFromBackend();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jp_cart_v1', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const publicProducts = useMemo(() => {
    return products.filter((p) => p.visible !== false);
  }, [products]);

  // Cart operations
  const addToCart = useCallback(
    (product, qty = 1, openDrawer = true) => {
      if (!product.available || Number(product.stock) <= 0) {
        showToast('Ce parfum est momentanément indisponible.', 'error');
        return;
      }
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        const maxStock = Number(product.stock) || 99;
        if (existing) {
          const nextQty = Math.min(maxStock, existing.quantity + qty);
          return prev.map((item) =>
            item.productId === product.id ? { ...item, quantity: nextQty } : item
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            quantity: Math.min(maxStock, qty),
          },
        ];
      });
      if (openDrawer) {
        setIsCartOpen(true);
      } else {
        showToast(`« ${product.name} » ajouté à votre sélection.`);
      }
    },
    [showToast]
  );

  const updateCartQuantity = useCallback(
    (productId, nextQty) => {
      if (nextQty <= 0) {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
        return;
      }
      const prod = products.find((p) => p.id === productId);
      const maxStock = prod ? Number(prod.stock) || 99 : 99;
      const clamped = Math.min(maxStock, nextQty);
      setCart((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, quantity: clamped } : item))
      );
    },
    [products]
  );

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const detailedCartItems = useMemo(() => {
    return cart
      .map((entry) => {
        const product = products.find((p) => p.id === entry.productId);
        if (!product || product.visible === false) return null;
        return {
          productId: product.id,
          name: product.name,
          subtitle: product.subtitle,
          category: product.category,
          volume: product.volume,
          price: Number(product.price) || 0,
          stock: Number(product.stock) || 0,
          available: product.available,
          photo: product.photos?.[0] || '/images/p1.jpg',
          quantity: entry.quantity,
          lineTotal: (Number(product.price) || 0) * entry.quantity,
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartCount = useMemo(
    () => detailedCartItems.reduce((acc, item) => acc + item.quantity, 0),
    [detailedCartItems]
  );

  const cartSubtotal = useMemo(
    () => detailedCartItems.reduce((acc, item) => acc + item.lineTotal, 0),
    [detailedCartItems]
  );

  const computeDeliveryFee = useCallback(
    (cityId, subtotalAmount) => {
      if (
        settings.freeDeliveryEnabled &&
        Number(settings.freeDeliveryThreshold) > 0 &&
        subtotalAmount >= Number(settings.freeDeliveryThreshold)
      ) {
        return 0;
      }
      const zone = settings.deliveryZones?.find((z) => z.id === cityId);
      return zone ? Number(zone.fee) || 0 : 7;
    },
    [settings]
  );

  // Create order via Backend REST API (POST /api/orders)
  const createOrder = useCallback(
    async ({
      customer,
      items,
      paymentMethod = 'Espèces à la livraison',
      channel = 'Boutique & WhatsApp',
    }) => {
      const createdOrder = await boutiqueApi.createOrder({
        customer,
        items,
        paymentMethod,
        channel,
      });

      // Refresh product stocks from backend
      if (isAdminAuthenticated) {
        await refreshAdminData();
      } else {
        const updatedPublic = await boutiqueApi.getPublicProducts();
        setProducts(updatedPublic);
        setOrders((prev) => [createdOrder, ...prev]);
      }

      return createdOrder;
    },
    [isAdminAuthenticated, refreshAdminData]
  );

  const fetchOrderByReference = useCallback(async (reference) => {
    return boutiqueApi.getOrderByReference(reference);
  }, []);

  // Admin: Upload photos to server (/api/upload)
  const uploadPhotosToServer = useCallback(async (files) => {
    return boutiqueApi.uploadPhotos(files);
  }, []);

  // Admin: Product CRUD via Backend API
  const addProduct = useCallback(
    async (productData) => {
      const created = await boutiqueApi.createProduct(productData);
      setProducts((prev) => [created, ...prev]);
      showToast(`« ${created.name} » publié en ligne avec succès.`);
      return created;
    },
    [showToast]
  );

  const updateProduct = useCallback(
    async (id, updates) => {
      const updated = await boutiqueApi.updateProduct(id, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Modifications enregistrées sur le serveur.');
      return updated;
    },
    [showToast]
  );

  const deleteProduct = useCallback(
    async (id) => {
      const target = products.find((p) => p.id === id);
      await boutiqueApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCart((prev) => prev.filter((item) => item.productId !== id));
      showToast(`« ${target?.name || 'Parfum'} » supprimé du catalogue.`);
    },
    [products, showToast]
  );

  const toggleProductVisibility = useCallback(
    async (id) => {
      const updated = await boutiqueApi.toggleProductVisibility(id);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast(
        updated.visible
          ? `« ${updated.name} » est désormais visible dans le catalogue.`
          : `« ${updated.name} » est masqué du catalogue public.`
      );
    },
    [showToast]
  );

  // Admin: Orders management via Backend API
  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      const updated = await boutiqueApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(`Statut mis à jour : ${newStatus}`);
    },
    [showToast]
  );

  const deleteOrder = useCallback(
    async (orderId) => {
      await boutiqueApi.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast('Commande supprimée.');
    },
    [showToast]
  );

  // Admin: Settings & Backup
  const updateSettings = useCallback(
    async (nextSettings) => {
      const saved = await boutiqueApi.updateSettings(nextSettings);
      setSettings(saved);
      showToast('Paramètres enregistrés sur le serveur.');
    },
    [showToast]
  );

  const downloadServerBackup = useCallback(async () => {
    return boutiqueApi.getFullBackup();
  }, []);

  // Admin: JWT Authentication
  const loginAdmin = useCallback(
    async (password) => {
      try {
        await boutiqueApi.loginAdmin(password);
        setIsAdminAuthenticated(true);
        await refreshAdminData();
        showToast('Bienvenue dans votre Espace Vendeur JOSHUA PARFUM.');
        return { ok: true };
      } catch (err) {
        return { ok: false, message: err.message || 'Mot de passe incorrect.' };
      }
    },
    [refreshAdminData, showToast]
  );

  const logoutAdmin = useCallback(async () => {
    boutiqueApi.logoutAdmin();
    setIsAdminAuthenticated(false);
    setOrders([]);
    try {
      const pub = await boutiqueApi.getPublicProducts();
      setProducts(pub);
    } catch {
      // ignore
    }
    showToast('Vous êtes déconnecté de l’Espace Vendeur.');
  }, [showToast]);

  const changeAdminPassword = useCallback(
    async (newPass) => {
      await boutiqueApi.updateAdminPassword(newPass);
      showToast('Mot de passe propriétaire mis à jour sur le serveur.');
    },
    [showToast]
  );

  const value = {
    isHydrated,
    backendStatus,
    products,
    publicProducts,
    orders,
    settings,
    cart,
    detailedCartItems,
    cartCount,
    cartSubtotal,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    computeDeliveryFee,
    createOrder,
    fetchOrderByReference,
    uploadPhotosToServer,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    updateOrderStatus,
    deleteOrder,
    updateSettings,
    downloadServerBackup,
    refreshAdminData,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
    isCartOpen,
    setIsCartOpen,
    isSearchOpen,
    setIsSearchOpen,
    shareModalPayload,
    setShareModalPayload,
    directWaProduct,
    setDirectWaProduct,
    toast,
    showToast,
  };

  return <BoutiqueContext.Provider value={value}>{children}</BoutiqueContext.Provider>;
}

export function useBoutique() {
  const ctx = useContext(BoutiqueContext);
  if (!ctx) throw new Error('useBoutique must be used inside BoutiqueProvider');
  return ctx;
}
