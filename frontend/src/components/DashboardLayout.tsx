'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard,
  ShoppingCart,
  Send,
  FileText,
  RefreshCw,
  ArrowDownToLine,
  QrCode,
  Code2,
  Users,
  BarChart2,
  Wallet,
  CreditCard,
  LogOut,
  Menu,
  X,
  User,
  Eye,
  EyeOff,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Settings,
  Key
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    const storedHideBalances = localStorage.getItem('hideBalances') === 'true';
    
    setHideBalances(storedHideBalances);
    const storedSandbox = localStorage.getItem('isSandbox') === 'true';
    setIsSandbox(storedSandbox);
    
    if (!token || !storedUser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleHideBalances = () => {
    const newState = !hideBalances;
    setHideBalances(newState);
    localStorage.setItem('hideBalances', String(newState));
    // Trigger custom event so components re-read state
    window.dispatchEvent(new Event('balanceVisibilityChanged'));
  };

  const toggleSandboxMode = () => {
    const newState = !isSandbox;
    setIsSandbox(newState);
    localStorage.setItem('isSandbox', String(newState));
    // Trigger custom event so components re-read sandbox state
    window.dispatchEvent(new Event('sandboxModeChanged'));
  };

  // V3 Role-based access mapping
  const hasAccess = (itemHref: string) => {
    if (!user) return false;
    const role = user.role; // e.g. COMPTABLE, CAISSIER, DEVELOPER, ADMIN, SUPER_ADMIN, MERCHANT_OWNER
    
    // Caissier (Cashier): only create requests, payouts, no API/Analytics
    if (role === 'CAISSIER') {
      return [
        '/dashboard', 
        '/dashboard/payments', 
        '/dashboard/paylinks', 
        '/dashboard/bulk-payouts'
      ].includes(itemHref);
    }
    
    // Comptable (Accountant): view transactions, settlements, no API
    if (role === 'COMPTABLE') {
      return [
        '/dashboard', 
        '/dashboard/payments', 
        '/dashboard/settlements', 
        '/dashboard/analytics'
      ].includes(itemHref);
    }

    return true; // MERCHANT_OWNER, MERCHANT_ADMIN, DEVELOPER, SUPER_ADMIN have full navigation access
  };

  const navItems = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Gérer ma boutique', href: '/dashboard/boutique', icon: ShoppingCart },
    { name: 'Envoyer de l\'argent', href: '/dashboard/payouts/single', icon: Send },
    { name: 'Demander un paiement', href: '/dashboard/paylinks', icon: FileText },
    { name: 'Collecter des paiements', href: '/dashboard/autocollect', icon: RefreshCw },
    { name: 'Débourser des paiements', href: '/dashboard/bulk-payouts', icon: ArrowDownToLine },
    { name: 'InnovQR', href: '/dashboard/qr', icon: QrCode, badge: 'New' },
    { name: 'Intégrez notre API', href: '/dashboard/integrations', icon: Code2 },
    { name: 'Clés API', href: '/dashboard/api-keys', icon: Key },
    { name: 'Gestion des rôles', href: '/dashboard/team', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2, badge: 'New' },
    { name: 'Conformité KYC', href: '/dashboard/kyc', icon: ShieldCheck },
    { name: 'Recharger le compte', href: '/dashboard/topup', icon: Wallet, hasChevron: true },
    { name: 'Retirer l\'argent', href: '/dashboard/settlements', icon: CreditCard },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        Chargement de la session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      
      {/* Topbar Alert banner (Prompt 1) */}
      <div className="bg-[#ea580c] text-white text-xs font-semibold py-2 px-6 text-center select-none flex items-center justify-center space-x-2">
        <span>Veuillez confirmer votre email : <strong className="underline">{user.email}</strong></span>
        <button className="bg-white/20 hover:bg-white/30 text-white rounded px-2 py-0.5 ml-2 font-bold transition">
          Renvoyer le mail
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Sidebar fixed or collapsible (Prompt 1) */}
        <aside 
          className={`
            hidden lg:flex flex-col justify-between bg-[#0a1628] border-r border-[#152e5e] text-[#c8d3e8] p-4 transition-all duration-300 relative shrink-0
            ${isCollapsed ? 'w-20' : 'w-[240px]'}
          `}
        >
          {/* Collapse toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3.5 top-6 bg-[#0a1628] border border-[#152e5e] text-[#c8d3e8] hover:text-white rounded-full p-1 shadow-md hover:scale-105 transition"
          >
            {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
          </button>

          {/* Sidebar Header Brand (Prompt 1) */}
          <div className="flex items-center px-2 py-3 border-b border-white/5 overflow-hidden shrink-0">
            <div className="flex items-center space-x-3 shrink-0">
              <div className="h-9 w-9 bg-[#ea580c] rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                IP
              </div>
              {!isCollapsed && (
                <div className="flex flex-col select-none">
                  <span className="text-white font-extrabold text-lg tracking-tight leading-none">
                    Innov<span className="text-[#ea580c]">Pay</span>
                  </span>
                  {isSandbox && (
                    <span className="text-[9px] text-[#ea580c] font-black uppercase tracking-wider mt-1.5 animate-pulse">
                      Mode Sandbox
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Navigation section */}
          <div className="flex-1 overflow-y-auto min-h-0 my-4 pr-1 space-y-4 select-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {/* Merchant Account number (masked, Prompt 1) */}
            {!isCollapsed && (
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 mx-1 text-left space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">ID Marchand</span>
                <span className="font-mono text-xs text-slate-350 tracking-wider font-semibold">
                  # {user.merchantId ? `${user.merchantId.substring(0, 8)}...` : '0000-MCH'}
                </span>
              </div>
            )}

            {/* Navigation links */}
            <nav className="space-y-0.5">
              {navItems.filter(item => hasAccess(item.href)).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 group
                      ${isActive 
                        ? 'bg-[#1a3a72] text-white border-l-4 border-[#c94400]' 
                        : 'text-[#c8d3e8] hover:bg-[#152e5e] hover:text-white border-l-4 border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#ea580c]' : 'text-[#8fa3c8] group-hover:text-white'}`} />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center space-x-1">
                        {item.badge && (
                          <span className="bg-[#ea580c] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full select-none">
                            {item.badge}
                          </span>
                        )}
                        {item.hasChevron && <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section Bottom */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className={`flex items-center space-x-3 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="h-9 w-9 rounded-full bg-[#152e5e] text-white flex items-center justify-center font-bold font-sans">
                {user.name.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden text-left flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                  <span className="text-[10px] text-slate-500 capitalize font-medium">{user.role.toLowerCase().replace('_', ' ')}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition duration-150
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              {!isCollapsed && <span>Se déconnecter</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/60 backdrop-blur-sm">
            <div className="relative w-72 bg-[#0a1628] text-[#c8d3e8] p-5 flex flex-col justify-between shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center space-x-3 text-white font-extrabold text-lg">
                    <div className="h-8 w-8 bg-[#ea580c] rounded-xl flex items-center justify-center text-white font-black">
                      IP
                    </div>
                    <span>Innov<span className="text-[#ea580c]">Pay</span></span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                  {navItems.filter(item => hasAccess(item.href)).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition
                          ${isActive 
                            ? 'bg-[#1a3a72] text-white border-l-4 border-[#c94400]' 
                            : 'text-[#c8d3e8] hover:bg-[#152e5e] hover:text-white border-l-4 border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5 shrink-0 text-[#8fa3c8]" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-[#ea580c] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-[#152e5e] text-white flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white">{user.name}</h4>
                    <p className="text-[10px] text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Content Shell wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Main Topbar Header (Prompt 1) */}
          <header className="bg-white border-b border-[#e2e5ea] h-[56px] px-6 flex items-center justify-between shrink-0 select-none">
            
            {/* Mobile menu trigger */}
            <div className="flex items-center space-x-4 lg:hidden">
              <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-[#00103e] p-1">
                <Menu className="h-6 w-6" />
              </button>
              <span className="text-[#00103e] font-black text-lg">InnovPay</span>
            </div>

            {/* Sandbox / Production Toggle (Stripe-Style) */}
            <div className="hidden sm:flex items-center bg-slate-100 hover:bg-slate-200/80 border border-[#e2e5ea] rounded-xl p-1 transition duration-150">
              <button
                onClick={() => isSandbox && toggleSandboxMode()}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  !isSandbox 
                    ? 'bg-[#0a2463] text-white shadow-sm scale-105' 
                    : 'text-[#5c6470] hover:text-[#00103e]'
                }`}
              >
                Production
              </button>
              <button
                onClick={() => !isSandbox && toggleSandboxMode()}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  isSandbox 
                    ? 'bg-[#ea580c] text-white shadow-sm scale-105' 
                    : 'text-[#5c6470] hover:text-[#00103e]'
                }`}
              >
                Test (Sandbox)
              </button>
            </div>

            {/* Balances hide button toggle (Prompt 1 / V3) */}
            <div className="hidden sm:flex items-center space-x-3">
              <button 
                onClick={toggleHideBalances}
                className="flex items-center space-x-2 text-xs font-bold bg-[#f5f7fa] border border-[#e2e5ea] hover:bg-[#eaedf0] text-slate-600 rounded-lg px-3 py-1.5 transition"
                title={hideBalances ? "Afficher les montants" : "Masquer les montants"}
              >
                {hideBalances ? (
                  <>
                    <Eye className="h-4 w-4 text-[#ea580c]" />
                    <span>Afficher les détails</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Cacher les détails</span>
                  </>
                )}
              </button>
            </div>

            {/* Right side options: notifications + profile */}
            <div className="flex items-center space-x-4">
              
              {/* Settings shortcut button */}
              <Link 
                href="/dashboard/settings"
                className="p-2 text-slate-500 hover:text-[#00103e] hover:bg-slate-100 rounded-lg transition"
                title="Paramètres"
              >
                <Settings className="h-5 w-5" />
              </Link>

              {/* Notification icon Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                  className="relative p-2 text-slate-500 hover:text-[#00103e] hover:bg-slate-100 rounded-lg transition"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-[#ea580c] rounded-full ring-2 ring-white" />
                </button>

                {/* Notifications dropdown menu (Prompt 14) */}
                {showNotificationMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e2e5ea] rounded-xl shadow-lg z-50 overflow-hidden font-sans">
                    <div className="p-3 border-b border-[#e2e5ea] flex justify-between items-center bg-[#f5f7fa]">
                      <span className="text-xs font-bold text-[#00103e]">Notifications</span>
                      <button className="text-[10px] font-bold text-[#ea580c] hover:underline">Tout marquer lu</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-[#e2e5ea]">
                      <div className="p-3 text-xs text-left hover:bg-slate-50">
                        <p className="font-semibold text-slate-800">🎉 Paiement Reçu</p>
                        <p className="text-slate-500 mt-0.5">Votre compte a été crédité de 15 000 FCFA via Airtel Money.</p>
                        <span className="text-[9px] text-slate-400 block mt-1">Il y a 5 min</span>
                      </div>
                      <div className="p-3 text-xs text-left hover:bg-slate-50">
                        <p className="font-semibold text-slate-800">📁 Dossier KYC soumis</p>
                        <p className="text-slate-500 mt-0.5">Vos documents de conformité sont en cours de validation.</p>
                        <span className="text-[9px] text-slate-400 block mt-1">Il y a 2h</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar */}
              <div className="flex items-center space-x-3 pl-3 border-l border-[#e2e5ea]">
                <div className="h-8 w-8 rounded-full bg-[#0a2463] text-white flex items-center justify-center font-bold text-xs select-none">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left select-none">
                  <h4 className="text-xs font-bold text-slate-800 leading-3">{user.name}</h4>
                  <span className="text-[9px] text-slate-500 font-medium capitalize">{user.role.toLowerCase().replace('_', ' ')}</span>
                </div>
              </div>
            </div>

          </header>

          {/* Main scrollable body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>

        </div>

      </div>

    </div>
  );
}
