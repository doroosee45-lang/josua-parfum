import React, { useMemo, useRef, useState } from 'react';
import {
  Lock,
  LogOut,
  Package,
  ShoppingBag,
  Settings,
  Plus,
  ImagePlus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calendar,
  Share2,
  Save,
  X,
  ArrowUpLeft,
  Download,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import JoshuaLogo from '../components/JoshuaLogo';
import { useBoutique } from '../context/BoutiqueContext';
import { ORDER_STATUSES } from '../data/initialData';
import { buildAdminToClientWhatsAppUrl, formatPriceDT } from '../utils/whatsapp';

const STATUS_BADGE_STYLES = {
  Nouvelle: 'bg-[#F7EFE9] text-[#7A4444] border-[#DEC4BC]',
  Confirmée: 'bg-[#EAF4EE] text-[#285A39] border-[#BCDACA]',
  'En préparation': 'bg-[#F3EFEA] text-[#2B201D] border-[#D4C2B7]',
  'En livraison': 'bg-[#1E1614] text-[#FADCD6] border-[#1E1614]',
  Livrée: 'bg-[#E3F2E8] text-[#215232] border-[#ABD1BC]',
  Annulée: 'bg-[#FBEBEB] text-[#8E3B3B] border-[#E0BABA]',
};

const EMPTY_FORM = {
  name: '',
  subtitle: 'Eau de Parfum',
  category: 'Femme',
  volume: '100 ml',
  price: '',
  stock: '10',
  available: true,
  visible: true,
  isNew: true,
  notes: '',
  description: '',
  photoEntries: [],
};

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
const MAX_PHOTO_MB = 12;

export default function AdminPage() {
  const {
    isAdminAuthenticated,
    backendStatus,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
    products,
    orders,
    settings,
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
    setShareModalPayload,
    showToast,
  } = useBoutique();

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [refreshing, setRefreshing] = useState(false);

  const [statusFilter, setStatusFilter] = useState('Toutes');
  const [dateFilter, setDateFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_FORM);
  const [photoError, setPhotoError] = useState('');
  const [formError, setFormError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const fileInputRef = useRef(null);

  const [inlinePrices, setInlinePrices] = useState({});

  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneFee, setNewZoneFee] = useState('7');
  const [newZoneDelay, setNewZoneDelay] = useState('24h à 48h');
  const [newAdminPass, setNewAdminPass] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    const result = await loginAdmin(passwordInput);
    setLoggingIn(false);

    if (!result.ok) {
      setLoginError(result.message || 'Mot de passe incorrect.');
    } else {
      setPasswordInput('');
      setLoginError('');
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshAdminData();
    setRefreshing(false);
    showToast('Données synchronisées avec le serveur.');
  };

  const stats = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Annulée');
    const revenue = validOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const newCount = orders.filter((o) => o.status === 'Nouvelle').length;
    const lowStockCount = products.filter((p) => Number(p.stock) <= 3).length;
    return {
      totalOrders: orders.length,
      newCount,
      revenue,
      totalProducts: products.length,
      lowStockCount,
    };
  }, [orders, products]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== 'Toutes') {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (dateFilter) {
      list = list.filter((o) => (o.createdAt || '').slice(0, 10) === dateFilter);
    }
    const q = orderSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          (o.reference || '').toLowerCase().includes(q) ||
          (o.customer?.fullName || '').toLowerCase().includes(q) ||
          (o.customer?.phone || '').toLowerCase().includes(q) ||
          (o.customer?.cityName || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, dateFilter, orderSearch]);

  const openAddProduct = () => {
    setEditingProductId(null);
    setProductForm(EMPTY_FORM);
    setPhotoError('');
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name || '',
      subtitle: prod.subtitle || 'Eau de Parfum',
      category: prod.category || 'Femme',
      volume: prod.volume || '100 ml',
      price: String(prod.price ?? ''),
      stock: String(prod.stock ?? '0'),
      available: prod.available !== false,
      visible: prod.visible !== false,
      isNew: Boolean(prod.isNew),
      notes: prod.notes || '',
      description: prod.description || '',
      photoEntries: (prod.photos || []).map((url) => ({ url, file: null })),
    });
    setPhotoError('');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleChoosePhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPhotoError('');

    const validEntries = [];
    for (const file of files) {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const isImageMime = file.type.startsWith('image/');
      if (!isImageMime && !ALLOWED_EXTS.includes(ext)) {
        setPhotoError(
          `Format non supporté pour « ${file.name} ». Utilisez JPG, PNG, WEBP ou HEIC (iPhone).`
        );
        continue;
      }

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_PHOTO_MB) {
        setPhotoError(
          `La photo « ${file.name} » dépasse ${MAX_PHOTO_MB} Mo (${sizeMB.toFixed(1)} Mo).`
        );
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      validEntries.push({ url: previewUrl, file });
    }

    if (validEntries.length > 0) {
      setProductForm((prev) => ({
        ...prev,
        photoEntries: [...prev.photoEntries, ...validEntries].slice(0, 6),
      }));
    }

    e.target.value = '';
  };

  const removePhotoFromForm = (index) => {
    setProductForm((prev) => {
      const target = prev.photoEntries[index];
      if (target?.file && target.url?.startsWith('blob:')) {
        URL.revokeObjectURL(target.url);
      }
      return {
        ...prev,
        photoEntries: prev.photoEntries.filter((_, i) => i !== index),
      };
    });
  };

  const setPrimaryPhoto = (index) => {
    setProductForm((prev) => {
      const arr = [...prev.photoEntries];
      const [chosen] = arr.splice(index, 1);
      arr.unshift(chosen);
      return { ...prev, photoEntries: arr };
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      setFormError('Veuillez renseigner le nom du parfum.');
      return;
    }
    const numericPrice = Number(productForm.price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setFormError('Veuillez saisir un prix valide en Dinars Tunisiens (DT).');
      return;
    }
    if (productForm.photoEntries.length === 0) {
      setFormError('Veuillez importer au moins une photo du parfum avant d’enregistrer.');
      return;
    }

    setFormError('');
    setSavingProduct(true);

    try {
      const newFiles = productForm.photoEntries
        .filter((entry) => entry.file instanceof File)
        .map((entry) => entry.file);

      let uploadedServerUrls = [];
      if (newFiles.length > 0) {
        uploadedServerUrls = await uploadPhotosToServer(newFiles);
      }

      const fileIndexMap = new Map();
      let nextIdx = 0;
      productForm.photoEntries.forEach((entry, idx) => {
        if (entry.file instanceof File) {
          fileIndexMap.set(idx, nextIdx);
          nextIdx += 1;
        }
      });

      const finalPhotos = productForm.photoEntries.map((entry, idx) => {
        if (entry.file instanceof File) {
          const url = uploadedServerUrls[fileIndexMap.get(idx)];
          if (entry.url?.startsWith('blob:')) {
            URL.revokeObjectURL(entry.url);
          }
          return url;
        }
        return entry.url;
      });

      const payload = {
        name: productForm.name.trim(),
        subtitle: productForm.subtitle.trim() || 'Eau de Parfum',
        category: productForm.category,
        volume: productForm.volume.trim() || '100 ml',
        price: numericPrice,
        stock: Math.max(0, Number(productForm.stock) || 0),
        available: productForm.available,
        visible: productForm.visible,
        isNew: productForm.isNew,
        notes: productForm.notes.trim(),
        description: productForm.description.trim(),
        photos: finalPhotos,
      };

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
      } else {
        await addProduct(payload);
      }

      setIsFormOpen(false);
      setEditingProductId(null);
      setProductForm(EMPTY_FORM);
    } catch (err) {
      setFormError(err.message || 'Erreur lors de l’enregistrement sur le serveur.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleQuickPriceSave = async (prod) => {
    const val = inlinePrices[prod.id];
    if (val === undefined) return;
    const num = Number(val);
    if (Number.isNaN(num) || num <= 0) {
      showToast('Veuillez saisir un prix valide supérieur à 0 DT.', 'error');
      return;
    }
    await updateProduct(prod.id, { price: num });
    setInlinePrices((prev) => {
      const copy = { ...prev };
      delete copy[prod.id];
      return copy;
    });
  };

  const handleExportBackup = async () => {
    try {
      const backup = await downloadServerBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `joshua-parfum-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Sauvegarde complète téléchargée depuis le serveur.');
    } catch {
      showToast('Impossible de récupérer la sauvegarde serveur.', 'error');
    }
  };

  // 1. PROTECTED LOGIN SCREEN — PASSWORD NEVER DISPLAYED IN FORM
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen text-[#1A1210] pt-[92px] flex items-center justify-center px-4 py-16 animate-page-enter">
        <div className="w-full max-w-md surface-ivory-card p-8 sm:p-11">
          <div className="text-center mb-8">
            <JoshuaLogo size="md" subtitle="ESPACE VENDEUR" tone="dark" />
            <h1 className="font-serif text-3xl font-medium text-[#1A1210] mt-5">
              Administration Privée
            </h1>
            <p className="text-xs font-normal text-[#2F2421] mt-2.5 leading-[1.8]">
              Accès sécurisé réservé au propriétaire de {settings.boutiqueName}.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" autoComplete="on">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-[#FDF4F3] border border-[#D9B1AD] text-[#7A4444] text-xs font-semibold">
                {loginError}
              </div>
            )}

            <div>
              <label htmlFor="vendor-password" className="label-atelier">
                Mot de passe propriétaire *
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-[#7A4444] absolute left-3.5 top-1/2 -translate-y-1/2"
                  strokeWidth={1.8}
                />
                <input
                  id="vendor-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Saisissez votre mot de passe confidentiel"
                  className="input-atelier !pl-10 !pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#5C4B47] hover:text-[#1A1210] transition-colors"
                  aria-label={
                    showPassword ? 'Masquer le mot de passe' : 'Afficher la saisie'
                  }
                  title={showPassword ? 'Masquer' : 'Vérifier la saisie'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="btn-atelier-dark w-full disabled:opacity-50"
            >
              {loggingIn ? 'Connexion au serveur...' : 'Accéder à l’Espace Vendeur'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#EAE0D8] flex items-center justify-center gap-2 text-[11px] font-medium text-[#3B2E2B]">
            <ShieldCheck className="w-4 h-4 text-[#285A39] shrink-0" strokeWidth={1.8} />
            <span>Session protégée et chiffrée côté serveur</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED VENDOR DASHBOARD — 100% OPAQUE HIGH-CONTRAST SURFACES
  return (
    <div className="min-h-screen text-[#1A1210] pt-[74px] sm:pt-[82px] pb-24 animate-page-enter">
      {/* Opaque Silk Linen Top Vendor Header */}
      <div className="bg-[#FAF5EF] text-[#1A1210] py-10 px-4 sm:px-8 border-b border-[#E2D2C7]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#7A4444] font-bold">
                ESPACE VENDEUR · PROPRIÉTAIRE
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border border-[#D4C2B7] text-[10px] uppercase tracking-[0.16em] font-semibold text-[#2F2421]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendStatus.connected ? 'bg-[#285A39]' : 'bg-amber-600'
                  }`}
                />
                API {backendStatus.engine === 'mongodb' ? 'MongoDB' : 'Serveur Centralisé'}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#1A1210] mt-1.5">
              Maison{' '}
              <em className="italic font-normal text-[#7A4444]">{settings.boutiqueName}</em>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#D4C2B7] text-[#1A1210] text-[10.5px] uppercase tracking-[0.18em] font-semibold flex items-center gap-2 hover:border-[#7A4444] hover:text-[#7A4444] transition-all"
              title="Actualiser depuis le serveur"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                strokeWidth={1.8}
              />
              Actualiser
            </button>

            <button
              type="button"
              onClick={() =>
                setShareModalPayload({
                  url: window.location.origin,
                  title: `${settings.boutiqueName} — ${settings.slogan}`,
                })
              }
              className="px-4 py-2.5 rounded-xl bg-white border border-[#D4C2B7] text-[#1A1210] text-[10.5px] uppercase tracking-[0.18em] font-semibold flex items-center gap-2 hover:border-[#7A4444] hover:text-[#7A4444] transition-all"
            >
              <Share2 className="w-3.5 h-3.5" strokeWidth={1.8} />
              Partager
            </button>

            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#D4C2B7] text-[#1A1210] text-[10.5px] uppercase tracking-[0.18em] font-semibold flex items-center gap-2 hover:border-[#7A4444] hover:text-[#7A4444] transition-all"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.8} />
              Sauvegarde
            </button>

            <button
              type="button"
              onClick={logoutAdmin}
              className="px-4 py-2.5 rounded-xl bg-[#1E1614] text-white text-[10.5px] uppercase tracking-[0.18em] font-semibold flex items-center gap-2 hover:bg-[#7A4444] transition-all"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Rounded Luminous KPI Strip */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="rounded-2xl bg-white border border-[#E2D2C7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A4444] font-bold">
              Nouvelles commandes
            </p>
            <p className="font-serif text-3xl font-bold text-[#1A1210] mt-1.5">{stats.newCount}</p>
          </div>

          <div className="rounded-2xl bg-white border border-[#E2D2C7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#2F2421] font-bold">
              Commandes totales
            </p>
            <p className="font-serif text-3xl font-bold text-[#1A1210] mt-1.5">
              {stats.totalOrders}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-[#E2D2C7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A4444] font-bold">
              Chiffre d’affaires
            </p>
            <p className="font-serif text-3xl font-bold text-[#7A4444] mt-1.5">
              {formatPriceDT(stats.revenue)}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-[#E2D2C7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#2F2421] font-bold">
              Catalogue actif
            </p>
            <p className="font-serif text-3xl font-bold text-[#1A1210] mt-1.5">
              {stats.totalProducts}
              {stats.lowStockCount > 0 && (
                <span className="text-xs font-sans font-semibold text-[#7A4444] ml-2">
                  ({stats.lowStockCount} stock bas)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-[#E2D2C7] sticky top-[74px] sm:top-[82px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-5 text-[11px] uppercase tracking-[0.2em] font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'orders'
                ? 'border-[#7A4444] text-[#1A1210]'
                : 'border-transparent text-[#4A3B38] hover:text-[#1A1210]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.8} />
            Commandes ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`py-4 px-5 text-[11px] uppercase tracking-[0.2em] font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'products'
                ? 'border-[#7A4444] text-[#1A1210]'
                : 'border-transparent text-[#4A3B38] hover:text-[#1A1210]'
            }`}
          >
            <Package className="w-4 h-4" strokeWidth={1.8} />
            Parfums, Photos & Prix ({products.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setSettingsDraft(settings);
              setActiveTab('settings');
            }}
            className={`py-4 px-5 text-[11px] uppercase tracking-[0.2em] font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'border-[#7A4444] text-[#1A1210]'
                : 'border-transparent text-[#4A3B38] hover:text-[#1A1210]'
            }`}
          >
            <Settings className="w-4 h-4" strokeWidth={1.8} />
            Livraison Jendouba & Paramètres
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-9">
        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-[#E2D2C7] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md">
              <div className="flex flex-wrap items-center gap-2">
                {['Toutes', ...ORDER_STATUSES].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-4 py-1.5 rounded-full text-[10.5px] uppercase tracking-[0.18em] font-semibold border transition-all ${
                      statusFilter === st
                        ? 'bg-[#1E1614] text-white border-[#1E1614]'
                        : 'bg-[#FAF6F2] text-[#2B201D] border-[#D8C6BB] hover:border-[#7A4444]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-[#7A4444] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Réf, client, téléphone..."
                    className="w-full rounded-full border border-[#CFAFA3] bg-[#FAF6F2] pl-9 pr-4 py-2 text-xs font-normal text-[#1A1210] placeholder:text-[#6E5D58] focus:bg-white focus:outline-none focus:border-[#7A4444]"
                  />
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#CFAFA3] bg-[#FAF6F2] px-3.5 py-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7A4444]" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent text-xs font-medium text-[#1A1210] focus:outline-none"
                  />
                  {dateFilter && (
                    <button
                      type="button"
                      onClick={() => setDateFilter('')}
                      className="text-xs font-bold text-[#7A4444] hover:text-black ml-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl bg-white border border-[#E2D2C7] p-14 text-center shadow-md">
                <p className="font-serif text-3xl font-medium text-[#1A1210]">
                  Aucune commande trouvée
                </p>
                <p className="text-xs font-normal text-[#2F2421] mt-2">
                  Modifiez vos filtres de statut ou de date pour consulter l’historique complet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const dateFormatted = new Date(order.createdAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={order.id}
                      className="rounded-3xl bg-white border border-[#E2D2C7] p-5 sm:p-7 shadow-md space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE0D8]">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="px-3 py-1 rounded-full bg-[#F7EFE9] border border-[#DEC4BC] text-[#7A4444] text-xs font-mono font-bold">
                              {order.reference}
                            </span>
                            <span
                              className={`px-3.5 py-1 rounded-full text-[10.5px] uppercase tracking-[0.16em] font-bold border ${
                                STATUS_BADGE_STYLES[order.status] || 'bg-[#F6EFE9] text-[#1A1210]'
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="text-xs font-medium text-[#3B2E2B]">
                              {dateFormatted}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#7A4444] mt-1.5">
                            {order.paymentMethod} · {order.channel || 'Boutique'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-[#2F2421]">
                            Statut
                          </label>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="rounded-xl border border-[#CFAFA3] bg-[#FAF6F2] px-3.5 py-2 text-xs font-bold text-[#1A1210] focus:border-[#7A4444] focus:outline-none"
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Supprimer la commande ${order.reference} ?`)) {
                                deleteOrder(order.id);
                              }
                            }}
                            className="p-2 rounded-full text-[#5C4B47] hover:text-[#7A4444] hover:bg-[#F7EFE9] transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5 rounded-2xl bg-[#FAF5F0] p-5 border border-[#E2D2C7] space-y-2 text-xs">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A4444] font-bold">
                            Client & Livraison
                          </p>
                          <p className="font-serif text-xl font-medium text-[#1A1210]">
                            {order.customer?.fullName}
                          </p>
                          <p className="font-normal text-[#1A1210]">
                            <strong className="font-bold">Tél :</strong> {order.customer?.phone}
                          </p>
                          <p className="font-normal text-[#1A1210]">
                            <strong className="font-bold">Commune :</strong>{' '}
                            {order.customer?.cityName}
                            {order.customer?.neighborhood
                              ? ` (${order.customer.neighborhood})`
                              : ''}
                          </p>
                          <p className="font-normal text-[#1A1210]">
                            <strong className="font-bold">Adresse :</strong>{' '}
                            {order.customer?.address}
                          </p>
                          {order.customer?.instructions && (
                            <p className="text-[#7A4444] font-medium italic">
                              « {order.customer.instructions} »
                            </p>
                          )}

                          <div className="pt-3 flex flex-wrap gap-2">
                            <a
                              href={buildAdminToClientWhatsAppUrl(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2.5 px-3 rounded-xl bg-[#1E1614] text-white text-[10px] uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#7A4444] transition-colors"
                            >
                              <MessageCircle
                                className="w-3.5 h-3.5 text-[#FADCD6]"
                                strokeWidth={1.7}
                              />
                              WhatsApp Client
                            </a>
                            <a
                              href={`tel:${(order.customer?.phone || '').replace(/\s+/g, '')}`}
                              className="py-2.5 px-3.5 rounded-xl border border-[#CFAFA3] bg-white text-[#1A1210] text-[10px] uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#F7EFE9] transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" strokeWidth={1.8} />
                              Appeler
                            </a>
                          </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col justify-between">
                          <div className="space-y-3">
                            {order.items.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between gap-3 py-2 border-b border-[#EAE0D8] last:border-b-0 text-xs"
                              >
                                <div className="flex items-center gap-3.5">
                                  <img
                                    src={item.photo || '/images/p1.jpg'}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-xl object-cover bg-[#F3ECE6] photo-atelier-harmonized"
                                  />
                                  <div>
                                    <p className="font-serif text-lg font-medium text-[#1A1210]">
                                      {item.name}
                                    </p>
                                    <p className="text-[11.5px] font-normal text-[#2F2421]">
                                      {item.category} · Qté :{' '}
                                      <strong className="font-bold">{item.quantity}</strong> ×{' '}
                                      {formatPriceDT(item.price)}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-serif text-lg font-bold text-[#1A1210]">
                                  {formatPriceDT(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#E2D2C7] flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-xs font-medium text-[#2F2421]">
                              Sous-total : {formatPriceDT(order.subtotal)} · Livraison :{' '}
                              {formatPriceDT(order.deliveryFee)}
                            </span>
                            <span className="font-serif text-2xl font-bold text-[#1A1210]">
                              Total : {formatPriceDT(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATALOGUE, PHOTOS & OWNER PRICING */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white border border-[#E2D2C7] p-6 shadow-md">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1210]">
                  Catalogue & Contrôle Exclusif des Tarifs
                </h2>
                <p className="text-xs font-normal text-[#2F2421] mt-1">
                  Importez vos visuels depuis votre iPhone/smartphone (stockage serveur en ligne
                  `/uploads`), fixez vos prix en Dinars Tunisiens et pilotez vos stocks.
                </p>
              </div>
              <button type="button" onClick={openAddProduct} className="btn-atelier-dark shrink-0">
                <Plus className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.8} />
                <span>Ajouter un parfum</span>
              </button>
            </div>

            {isFormOpen && (
              <form
                onSubmit={handleSaveProduct}
                className="rounded-3xl bg-white border border-[#CFAFA3] p-6 sm:p-9 shadow-xl space-y-6 animate-modal-up"
              >
                <div className="flex items-center justify-between pb-4 border-b border-[#EAE0D8]">
                  <div>
                    <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#7A4444] font-bold">
                      {editingProductId ? 'ÉDITION DE CRÉATION' : 'NOUVELLE CRÉATION'}
                    </span>
                    <h3 className="font-serif text-3xl font-medium text-[#1A1210] mt-0.5">
                      {editingProductId ? 'Modifier la fiche produit' : 'Ajouter un parfum'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 rounded-full text-[#2B201D] hover:bg-[#F5EDE7]"
                  >
                    <X className="w-5 h-5" strokeWidth={1.8} />
                  </button>
                </div>

                {formError && (
                  <div className="p-4 rounded-xl bg-[#FDF4F3] border border-[#D9B1AD] text-[#7A4444] text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Native iPhone / Smartphone Photo Picker */}
                <div className="p-5 rounded-2xl bg-[#FAF5F0] border border-[#E2D2C7] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-[#1A1210]">
                        Photographies du flacon *
                      </label>
                      <p className="text-xs font-normal text-[#2F2421] mt-1">
                        Sur iPhone ou Android, appuyez sur « Choisir une photo » pour ouvrir votre
                        Photothèque, l’Appareil photo ou Fichiers. La photo est stockée en ligne sur
                        le serveur dès l’enregistrement.
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleChoosePhotos}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-atelier-dark shrink-0"
                    >
                      <ImagePlus className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.8} />
                      <span>Choisir une photo</span>
                    </button>
                  </div>

                  {photoError && (
                    <div className="p-3 rounded-xl bg-white border border-[#D9B1AD] text-[#7A4444] text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{photoError}</span>
                    </div>
                  )}

                  {productForm.photoEntries.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium text-[#2F2421] mb-2.5">
                        Aperçu avant enregistrement ({productForm.photoEntries.length} image
                        {productForm.photoEntries.length > 1 ? 's' : ''}) :
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {productForm.photoEntries.map((entry, idx) => (
                          <div
                            key={idx}
                            className="relative group aspect-square rounded-2xl bg-white border border-[#CFAFA3] overflow-hidden shadow-sm"
                          >
                            <img
                              src={entry.url}
                              alt={`Aperçu ${idx + 1}`}
                              className="w-full h-full object-cover photo-atelier-harmonized"
                            />
                            {idx === 0 ? (
                              <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white text-[#1A1210] text-[9px] font-bold uppercase tracking-wider shadow">
                                Principale
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPrimaryPhoto(idx)}
                                className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-white text-[#1A1210] text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1 shadow"
                              >
                                <ArrowUpLeft className="w-2.5 h-2.5" />
                                Principale
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removePhotoFromForm(idx)}
                              className="absolute top-2 right-2 p-1 bg-[#1E1614] text-white rounded-full shadow"
                              title="Retirer cette photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#C7AFA4] bg-white p-6 text-center text-xs font-normal text-[#2F2421]">
                      Aucune image sélectionnée. Appuyez sur{' '}
                      <strong className="font-bold">« Choisir une photo »</strong> pour afficher
                      l’aperçu avant d’enregistrer.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label-atelier">Nom du parfum *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Ex: Oud Royal Intense"
                      className="input-atelier"
                    />
                  </div>

                  <div>
                    <label className="label-atelier">Catégorie *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="input-atelier"
                    >
                      <option value="Femme">Femme</option>
                      <option value="Homme">Homme</option>
                      <option value="Mixte">Mixte</option>
                    </select>
                  </div>

                  <div>
                    <label className="label-atelier !text-[#7A4444]">Prix de vente (DT) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="Prix en DT"
                      className="input-atelier !border-[#7A4444] font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label-atelier">Famille / Sous-titre</label>
                    <input
                      type="text"
                      value={productForm.subtitle}
                      onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                      placeholder="Ex: Eau de Parfum · Floral"
                      className="input-atelier"
                    />
                  </div>

                  <div>
                    <label className="label-atelier">Contenance</label>
                    <input
                      type="text"
                      value={productForm.volume}
                      onChange={(e) => setProductForm({ ...productForm, volume: e.target.value })}
                      placeholder="Ex: 100 ml"
                      className="input-atelier"
                    />
                  </div>

                  <div>
                    <label className="label-atelier">Stock disponible *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="input-atelier"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-atelier">Notes olfactives</label>
                  <input
                    type="text"
                    value={productForm.notes}
                    onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
                    placeholder="Ex: Bergamote · Rose de Damas · Oud & Vanille"
                    className="input-atelier"
                  />
                </div>

                <div>
                  <label className="label-atelier">Description éditoriale</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    placeholder="Décrivez le sillage, la tenue et l’inspiration du parfum..."
                    className="input-atelier"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-medium text-[#1A1210]">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.available}
                      onChange={(e) =>
                        setProductForm({ ...productForm, available: e.target.checked })
                      }
                      className="accent-[#7A4444]"
                    />
                    <span>Disponible à la vente</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.visible}
                      onChange={(e) =>
                        setProductForm({ ...productForm, visible: e.target.checked })
                      }
                      className="accent-[#7A4444]"
                    />
                    <span>Visible dans le catalogue public</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isNew}
                      onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                      className="accent-[#7A4444]"
                    />
                    <span>Mention « Nouveau »</span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#EAE0D8]">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="btn-atelier-outline-dark"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="btn-atelier-dark disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.8} />
                    <span>
                      {savingProduct ? 'Envoi des photos & sauvegarde...' : 'Enregistrer le parfum'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {products.map((prod) => {
                const draftPrice = inlinePrices[prod.id];
                return (
                  <div
                    key={prod.id}
                    className={`rounded-3xl bg-white border p-4 sm:p-5 flex gap-4 shadow-md transition-all ${
                      prod.visible === false
                        ? 'border-dashed border-[#B59E96] bg-[#FAF6F2]'
                        : 'border-[#E2D2C7]'
                    }`}
                  >
                    <img
                      src={prod.photos?.[0] || '/images/p1.jpg'}
                      alt={prod.name}
                      className="w-24 h-24 rounded-2xl object-cover bg-[#F3ECE6] shrink-0 photo-atelier-harmonized"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-[#7A4444] font-bold">
                              {prod.category} · {prod.volume}
                            </span>
                            <h4 className="font-serif text-xl font-medium text-[#1A1210] leading-tight">
                              {prod.name}
                            </h4>
                          </div>
                          {prod.visible === false && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#EFE5DC] text-[#2B201D] text-[9.5px] font-bold uppercase tracking-wider">
                              Masqué
                            </span>
                          )}
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <label className="text-xs font-medium text-[#2F2421]">
                            Prix (DT) :
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            value={draftPrice !== undefined ? draftPrice : prod.price}
                            onChange={(e) =>
                              setInlinePrices({ ...inlinePrices, [prod.id]: e.target.value })
                            }
                            className="w-24 rounded-lg border border-[#CFAFA3] bg-[#FAF6F2] px-2.5 py-1 text-xs font-bold text-[#1A1210] focus:border-[#7A4444] focus:outline-none"
                          />
                          {draftPrice !== undefined && Number(draftPrice) !== Number(prod.price) && (
                            <button
                              type="button"
                              onClick={() => handleQuickPriceSave(prod)}
                              className="px-3 py-1 rounded-lg bg-[#1E1614] text-white text-[10px] font-semibold uppercase tracking-wider"
                            >
                              Valider
                            </button>
                          )}
                          <span className="text-xs font-medium text-[#2F2421] ml-auto">
                            Stock :{' '}
                            <strong className="font-bold text-[#1A1210]">{prod.stock}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-[#EAE0D8] flex items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => openEditProduct(prod)}
                          className="inline-flex items-center gap-1 text-[#1A1210] hover:text-[#7A4444] font-semibold transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleProductVisibility(prod.id)}
                          className="inline-flex items-center gap-1 text-[#3B2E2B] hover:text-[#1A1210] font-medium transition-colors"
                        >
                          {prod.visible === false ? (
                            <>
                              <Eye className="w-3.5 h-3.5" strokeWidth={1.8} />
                              Afficher
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" strokeWidth={1.8} />
                              Masquer
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Supprimer définitivement « ${prod.name} » ?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[#7A4444] hover:text-[#1A1210] font-semibold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS & JENDOUBA DELIVERY */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 rounded-3xl bg-white border border-[#E2D2C7] p-6 sm:p-9 shadow-md space-y-6">
              <h2 className="font-serif text-3xl font-medium text-[#1A1210] pb-3 border-b border-[#EAE0D8]">
                WhatsApp, Livraison & Modalités
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-atelier">Numéro WhatsApp des commandes</label>
                  <input
                    type="text"
                    value={settingsDraft.whatsappNumber}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, whatsappNumber: e.target.value })
                    }
                    className="input-atelier"
                  />
                </div>

                <div>
                  <label className="label-atelier">Slogan de la Maison</label>
                  <input
                    type="text"
                    value={settingsDraft.slogan}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, slogan: e.target.value })}
                    className="input-atelier"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center rounded-2xl bg-[#FAF5F0] p-4 border border-[#E2D2C7]">
                <label className="inline-flex items-center gap-2.5 text-xs font-medium text-[#1A1210] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsDraft.freeDeliveryEnabled}
                    onChange={(e) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        freeDeliveryEnabled: e.target.checked,
                      })
                    }
                    className="accent-[#7A4444]"
                  />
                  <span>Offrir la livraison au-delà d’un montant défini</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#2F2421]">Seuil (DT) :</span>
                  <input
                    type="number"
                    min="0"
                    value={settingsDraft.freeDeliveryThreshold}
                    onChange={(e) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        freeDeliveryThreshold: Number(e.target.value),
                      })
                    }
                    className="w-28 rounded-xl border border-[#CFAFA3] bg-white px-3 py-1.5 text-xs font-bold text-[#1A1210]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[11px] uppercase tracking-[0.22em] text-[#7A4444] font-bold">
                  Communes desservies & Frais de livraison (DT)
                </h3>

                <div className="divide-y divide-[#EAE0D8] rounded-2xl border border-[#E2D2C7] bg-[#FAF6F2] overflow-hidden">
                  {(settingsDraft.deliveryZones || []).map((zone, idx) => (
                    <div
                      key={zone.id}
                      className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <span className="font-semibold text-[#1A1210] min-w-[160px]">{zone.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#2F2421]">Tarif (DT) :</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={zone.fee}
                          onChange={(e) => {
                            const updated = [...settingsDraft.deliveryZones];
                            updated[idx] = { ...zone, fee: Number(e.target.value) };
                            setSettingsDraft({ ...settingsDraft, deliveryZones: updated });
                          }}
                          className="w-20 rounded-lg border border-[#CFAFA3] bg-white px-2.5 py-1 text-xs font-bold text-[#1A1210]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = settingsDraft.deliveryZones.filter(
                              (z) => z.id !== zone.id
                            );
                            setSettingsDraft({ ...settingsDraft, deliveryZones: updated });
                          }}
                          className="p-1 text-[#5C4B47] hover:text-[#7A4444]"
                          title="Supprimer cette zone"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <input
                    type="text"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="Nouvelle commune..."
                    className="flex-1 min-w-[160px] input-atelier !py-2"
                  />
                  <input
                    type="number"
                    min="0"
                    value={newZoneFee}
                    onChange={(e) => setNewZoneFee(e.target.value)}
                    placeholder="DT"
                    className="w-20 input-atelier !py-2"
                  />
                  <input
                    type="text"
                    value={newZoneDelay}
                    onChange={(e) => setNewZoneDelay(e.target.value)}
                    placeholder="Délai"
                    className="w-36 input-atelier !py-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newZoneName.trim()) return;
                      const id = newZoneName
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-');
                      setSettingsDraft({
                        ...settingsDraft,
                        deliveryZones: [
                          ...(settingsDraft.deliveryZones || []),
                          {
                            id: `${id}-${Date.now()}`,
                            name: newZoneName.trim(),
                            fee: Number(newZoneFee) || 0,
                            delay: newZoneDelay.trim() || '24h à 48h',
                          },
                        ],
                      });
                      setNewZoneName('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1E1614] text-white text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                  >
                    + Ajouter
                  </button>
                </div>
              </div>

              <div>
                <label className="label-atelier">
                  Conditions de paiement & de livraison affichées aux clients
                </label>
                <textarea
                  rows={3}
                  value={settingsDraft.paymentConditions}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, paymentConditions: e.target.value })
                  }
                  className="input-atelier"
                />
              </div>

              <label className="inline-flex items-center gap-2.5 text-xs font-medium text-[#1A1210] cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settingsDraft.enableBankTransfer)}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, enableBankTransfer: e.target.checked })
                  }
                  className="accent-[#7A4444]"
                />
                <span>
                  Proposer également l’option « Virement bancaire » en complément du règlement en
                  espèces
                </span>
              </label>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => updateSettings(settingsDraft)}
                  className="btn-atelier-dark"
                >
                  <Save className="w-4 h-4 text-[#FADCD6]" strokeWidth={1.8} />
                  <span>Enregistrer les paramètres</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl bg-white border border-[#E2D2C7] p-7 shadow-md space-y-4">
                <h3 className="font-serif text-2xl font-medium text-[#1A1210]">
                  Sécurité Propriétaire
                </h3>
                <p className="text-xs font-normal text-[#2F2421] leading-relaxed">
                  Personnalisez le mot de passe d’accès administrateur (chiffré sur le serveur avec
                  bcrypt).
                </p>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="Nouveau mot de passe..."
                  className="input-atelier"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newAdminPass.trim().length < 4) {
                      showToast('Choisissez au moins 4 caractères.', 'error');
                      return;
                    }
                    changeAdminPassword(newAdminPass.trim());
                    setNewAdminPass('');
                  }}
                  className="btn-atelier-dark w-full"
                >
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
