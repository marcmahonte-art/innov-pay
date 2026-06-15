'use client';

import React, { useState, useEffect } from 'react';
import { Store, ShoppingBag, Save, Eye, Check, Plus, Trash2, HelpCircle, Info, Globe, CreditCard, RefreshCw, Smartphone, AlertCircle, Sparkles } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Product {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'archived';
}

export default function BoutiquePage() {
  // Boutique Settings State
  const [shopName, setShopName] = useState('Ma Super Boutique');
  const [shopDescription, setShopDescription] = useState('Boutique officielle de vente d\'articles premium.');
  const [currency, setCurrency] = useState('XAF');
  const [redirectUrl, setRedirectUrl] = useState('https://monsite.com/success');
  const [isShopActive, setIsShopActive] = useState(true);
  
  // Accepted payment methods
  const [acceptAirtel, setAcceptAirtel] = useState(true);
  const [acceptMoov, setAcceptMoov] = useState(true);
  const [acceptOrange, setAcceptOrange] = useState(true);
  const [acceptCard, setAcceptCard] = useState(true);

  // Products state (mock boutique products list)
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Abonnement Premium Mensuel', price: 15000, status: 'active' },
    { id: '2', name: 'Livre Numérique - Guide de l\'E-commerce', price: 5000, status: 'active' },
    { id: '3', name: 'Pack Formation FinTech', price: 45000, status: 'active' }
  ]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    const savedShopName = localStorage.getItem('boutique_shopName');
    const savedShopDesc = localStorage.getItem('boutique_shopDesc');
    const savedCurrency = localStorage.getItem('boutique_currency');
    const savedRedirectUrl = localStorage.getItem('boutique_redirectUrl');
    const savedIsActive = localStorage.getItem('boutique_isActive');
    
    if (savedShopName) setShopName(savedShopName);
    if (savedShopDesc) setShopDescription(savedShopDesc);
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedRedirectUrl) setRedirectUrl(savedRedirectUrl);
    if (savedIsActive !== null) setIsShopActive(savedIsActive === 'true');

    const savedAirtel = localStorage.getItem('boutique_acceptAirtel');
    const savedMoov = localStorage.getItem('boutique_acceptMoov');
    const savedOrange = localStorage.getItem('boutique_acceptOrange');
    const savedCard = localStorage.getItem('boutique_acceptCard');

    if (savedAirtel !== null) setAcceptAirtel(savedAirtel === 'true');
    if (savedMoov !== null) setAcceptMoov(savedMoov === 'true');
    if (savedOrange !== null) setAcceptOrange(savedOrange === 'true');
    if (savedCard !== null) setAcceptCard(savedCard === 'true');

    const savedProducts = localStorage.getItem('boutique_products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate save duration
    setTimeout(() => {
      localStorage.setItem('boutique_shopName', shopName);
      localStorage.setItem('boutique_shopDesc', shopDescription);
      localStorage.setItem('boutique_currency', currency);
      localStorage.setItem('boutique_redirectUrl', redirectUrl);
      localStorage.setItem('boutique_isActive', String(isShopActive));
      
      localStorage.setItem('boutique_acceptAirtel', String(acceptAirtel));
      localStorage.setItem('boutique_acceptMoov', String(acceptMoov));
      localStorage.setItem('boutique_acceptOrange', String(acceptOrange));
      localStorage.setItem('boutique_acceptCard', String(acceptCard));

      localStorage.setItem('boutique_products', JSON.stringify(products));

      setIsSaving(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }, 800);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newProductPrice);
    if (!newProductName || isNaN(priceNum) || priceNum <= 0) {
      alert('Veuillez remplir correctement les champs du produit.');
      return;
    }
    const newProd: Product = {
      id: Date.now().toString(),
      name: newProductName,
      price: priceNum,
      status: 'active'
    };
    const updated = [...products, newProd];
    setProducts(updated);
    localStorage.setItem('boutique_products', JSON.stringify(updated));
    setNewProductName('');
    setNewProductPrice('');
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('boutique_products', JSON.stringify(updated));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#00103e] tracking-tight">Gérer ma boutique</h2>
            <p className="text-[#5c6470] text-sm">Personnalisez votre boutique en ligne et configurez votre page de checkout de paiement.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isShopActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-bold text-[#00103e]">
              Statut : {isShopActive ? 'Boutique active' : 'Boutique inactive'}
            </span>
          </div>
        </div>

        {/* Main layout grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left panel: configurations */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* Form */}
            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-[#e2e5ea] p-6 shadow-card space-y-6">
              <div className="flex justify-between items-center border-b border-[#e2e5ea] pb-4">
                <h3 className="text-sm font-bold text-[#00103e] flex items-center gap-2">
                  <Store className="h-4.5 w-4.5 text-[#ea580c]" />
                  Configurations de la boutique
                </h3>
                {showSaveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 animate-fade-in">
                    <Check className="h-3.5 w-3.5" /> Enregistré !
                  </span>
                )}
              </div>

              {/* General shop properties */}
              <div className="space-y-4">
                
                {/* Shop Active toggle switch */}
                <div className="flex items-center justify-between p-4 bg-[#f5f7fa] rounded-xl border border-[#e2e5ea]">
                  <div>
                    <label className="text-xs font-bold text-[#00103e] block">État de la boutique</label>
                    <span className="text-[10px] text-[#5c6470]">Activez pour permettre aux clients d'accéder au checkout.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsShopActive(!isShopActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isShopActive ? 'bg-[#0a2463]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isShopActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#5c6470] uppercase">Nom commercial</label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Ex: Mon Commerce Sarl"
                      className="w-full px-4 py-2.5 bg-white border border-[#e2e5ea] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0a2463] transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#5c6470] uppercase">Devise d'affichage</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#e2e5ea] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0a2463] transition text-[#3c3f4a]"
                    >
                      <option value="XAF">FCFA (XAF)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar ($)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5c6470] uppercase">Description publique</label>
                  <textarea
                    value={shopDescription}
                    onChange={(e) => setShopDescription(e.target.value)}
                    rows={2}
                    placeholder="Présentez votre activité en quelques mots..."
                    className="w-full px-4 py-2.5 bg-white border border-[#e2e5ea] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0a2463] transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5c6470] uppercase">URL de retour après paiement</label>
                  <input
                    type="url"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="https://monsite.com/checkout/success"
                    className="w-full px-4 py-2.5 bg-white border border-[#e2e5ea] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0a2463] transition font-mono"
                  />
                </div>

              </div>

              {/* Payment Methods configuration */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#00103e] uppercase tracking-wider">Modes de paiement autorisés</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Airtel Money Toggle */}
                  <div className="flex items-center justify-between p-3 border border-[#e2e5ea] rounded-xl hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-[#ea580c] flex items-center justify-center shrink-0">
                        <Smartphone className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#00103e] block">Airtel Money</span>
                        <span className="text-[9px] text-[#8b919d]">Mobile Money Tchad</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={acceptAirtel}
                      onChange={(e) => setAcceptAirtel(e.target.checked)}
                      className="rounded border-[#e2e5ea] text-[#0a2463] focus:ring-[#0a2463] h-4.5 w-4.5 cursor-pointer"
                    />
                  </div>

                  {/* Moov Money Toggle */}
                  <div className="flex items-center justify-between p-3 border border-[#e2e5ea] rounded-xl hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0a2463] flex items-center justify-center shrink-0">
                        <Smartphone className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#00103e] block">Moov Africa</span>
                        <span className="text-[9px] text-[#8b919d]">Mobile Money Tchad/CEMAC</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={acceptMoov}
                      onChange={(e) => setAcceptMoov(e.target.checked)}
                      className="rounded border-[#e2e5ea] text-[#0a2463] focus:ring-[#0a2463] h-4.5 w-4.5 cursor-pointer"
                    />
                  </div>

                  {/* Orange Money Toggle */}
                  <div className="flex items-center justify-between p-3 border border-[#e2e5ea] rounded-xl hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-[#ea580c] flex items-center justify-center shrink-0">
                        <Smartphone className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#00103e] block">Orange Money</span>
                        <span className="text-[9px] text-[#8b919d]">Mobile Money Zone CEMAC</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={acceptOrange}
                      onChange={(e) => setAcceptOrange(e.target.checked)}
                      className="rounded border-[#e2e5ea] text-[#0a2463] focus:ring-[#0a2463] h-4.5 w-4.5 cursor-pointer"
                    />
                  </div>

                  {/* Card Toggle */}
                  <div className="flex items-center justify-between p-3 border border-[#e2e5ea] rounded-xl hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <CreditCard className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#00103e] block">Carte Bancaire</span>
                        <span className="text-[9px] text-[#8b919d]">Visa / Mastercard</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={acceptCard}
                      onChange={(e) => setAcceptCard(e.target.checked)}
                      className="rounded border-[#e2e5ea] text-[#0a2463] focus:ring-[#0a2463] h-4.5 w-4.5 cursor-pointer"
                    />
                  </div>

                </div>
              </div>

              {/* Save Settings Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#0a2463] hover:bg-[#1a3a72] text-white py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer la configuration de la boutique
              </button>

            </form>

            {/* Product list section */}
            <div className="bg-white rounded-2xl border border-[#e2e5ea] p-6 shadow-card space-y-6">
              <h3 className="text-sm font-bold text-[#00103e] flex items-center gap-2 border-b border-[#e2e5ea] pb-4">
                <ShoppingBag className="h-4.5 w-4.5 text-[#ea580c]" />
                Catalogue de produits rapides
              </h3>

              {/* Add Product Form */}
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#f5f7fa] p-4 rounded-xl border border-[#e2e5ea]">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold text-[#5c6470] uppercase">Nom de l'article / service</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Ex: T-Shirt Premium Innov Pay"
                    className="w-full px-3 py-2 bg-white border border-[#e2e5ea] rounded-lg text-xs focus:outline-none focus:border-[#0a2463]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#5c6470] uppercase">Prix ({currency})</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="5000"
                      className="w-full px-3 py-2 bg-white border border-[#e2e5ea] rounded-lg text-xs focus:outline-none focus:border-[#0a2463]"
                    />
                    <button
                      type="submit"
                      className="bg-[#ea580c] hover:bg-[#c94400] text-white px-3 py-2 rounded-lg font-bold text-xs shrink-0 transition"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </form>

              {/* Catalog Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs text-[#3c3f4a]">
                  <thead className="bg-[#f5f7fa] font-bold text-[#5c6470] uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Produit</th>
                      <th className="px-4 py-2.5 text-right">Prix</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e5ea]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-semibold text-[#00103e]">{p.name}</td>
                        <td className="px-4 py-3 text-right font-bold text-[#00103e]">{formatCurrency(p.price)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-full border border-emerald-100">
                            Actif
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-rose-600 hover:text-rose-700 font-semibold text-xs flex items-center justify-end ml-auto gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-[#8b919d] italic">Aucun produit dans votre catalogue de boutique.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

          {/* Right panel: Live Checkout Preview */}
          <div className="xl:col-span-5 space-y-6">
            
            <div className="sticky top-6">
              
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4.5 w-4.5 text-[#0a2463]" />
                <span className="text-xs font-bold text-[#0a2463] uppercase tracking-wider">Aperçu Live du Checkout Client</span>
                <span className="text-[9px] bg-[#ea580c]/10 text-[#ea580c] px-2 py-0.5 rounded-full font-bold">Interactif</span>
              </div>

              {/* Checkout Mock UI Wrapper */}
              <div className="bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-800">
                <div className="bg-[#f8fafc] rounded-2xl overflow-hidden min-h-[460px] flex flex-col justify-between text-slate-800 font-sans shadow-inner">
                  
                  {/* Top Bar of Checkout */}
                  <div className="bg-[#0a2463] text-white px-5 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-white text-[#0a2463] rounded-lg flex items-center justify-center font-bold text-xs shadow">
                        {shopName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">{shopName || 'Boutique Sans Nom'}</h4>
                        <span className="text-[8px] text-slate-350 block">Paiement sécurisé par Innov Pay</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-300 block font-bold uppercase tracking-widest">Facture</span>
                      <span className="text-xs font-bold">#INV-92840</span>
                    </div>
                  </div>

                  {/* Active/Inactive warning */}
                  {!isShopActive && (
                    <div className="bg-rose-50 border-b border-rose-200 p-3 text-center flex items-center justify-center gap-2 text-[10px] text-rose-800 font-semibold">
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                      Cette boutique est actuellement fermée ou en maintenance.
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 flex-1 space-y-5">
                    
                    {/* Invoice detail card */}
                    <div className="bg-white border border-[#e2e5ea] rounded-xl p-3.5 space-y-2.5 shadow-sm">
                      <span className="text-[9px] font-bold text-[#8b919d] uppercase block">Résumé de la commande</span>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">Article de Test (Exemple)</span>
                        <span className="font-bold text-[#0a2463]">{formatCurrency(15000)}</span>
                      </div>
                      {shopDescription && (
                        <p className="text-[10px] text-[#5c6470] line-clamp-1 border-t border-slate-100 pt-1.5">{shopDescription}</p>
                      )}
                    </div>

                    {/* Method Selector */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-[#8b919d] uppercase block">Sélectionnez un mode de paiement</span>
                      
                      <div className="space-y-2">
                        
                        {acceptAirtel && (
                          <div className="flex items-center justify-between p-2.5 bg-white border border-[#0a2463] rounded-xl shadow-sm cursor-pointer hover:bg-slate-50/50">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-orange-50 text-[#ea580c] flex items-center justify-center text-xs">
                                🇹🇩
                              </div>
                              <span className="text-xs font-bold text-slate-800">Airtel Money Tchad</span>
                            </div>
                            <div className="h-4 w-4 rounded-full border border-[#0a2463] flex items-center justify-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-[#0a2463]" />
                            </div>
                          </div>
                        )}

                        {acceptMoov && (
                          <div className="flex items-center justify-between p-2.5 bg-white border border-[#e2e5ea] rounded-xl cursor-pointer hover:bg-slate-50/50">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0a2463] flex items-center justify-center text-xs">
                                🇹🇩
                              </div>
                              <span className="text-xs font-semibold text-slate-800">Moov Africa</span>
                            </div>
                            <div className="h-4 w-4 rounded-full border border-slate-300" />
                          </div>
                        )}

                        {acceptOrange && (
                          <div className="flex items-center justify-between p-2.5 bg-white border border-[#e2e5ea] rounded-xl cursor-pointer hover:bg-slate-50/50">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-orange-50 text-[#ea580c] flex items-center justify-center text-xs">
                                🇨🇲
                              </div>
                              <span className="text-xs font-semibold text-slate-800">Orange Money</span>
                            </div>
                            <div className="h-4 w-4 rounded-full border border-slate-300" />
                          </div>
                        )}

                        {acceptCard && (
                          <div className="flex items-center justify-between p-2.5 bg-white border border-[#e2e5ea] rounded-xl cursor-pointer hover:bg-slate-50/50">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-semibold text-slate-800">Carte de crédit (Visa, Mastercard)</span>
                            </div>
                            <div className="h-4 w-4 rounded-full border border-slate-300" />
                          </div>
                        )}

                        {!acceptAirtel && !acceptMoov && !acceptOrange && !acceptCard && (
                          <p className="text-[10px] text-rose-600 italic">Aucune méthode de paiement activée pour le moment.</p>
                        )}

                      </div>
                    </div>

                    {/* Pay Button */}
                    <button
                      type="button"
                      disabled={!isShopActive}
                      className="w-full bg-[#ea580c] hover:bg-[#c94400] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Payer {formatCurrency(15000)}
                    </button>

                  </div>

                  {/* Footer Security Badge */}
                  <div className="bg-[#f1f5f9] border-t border-slate-200 px-5 py-3 text-center flex items-center justify-center gap-1 text-[9px] text-slate-550">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    Paiement crypté SSL & Certifié PCI-DSS
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
