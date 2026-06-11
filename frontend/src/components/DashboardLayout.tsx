'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, 
  Home, 
  Key, 
  Activity, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Coins, 
  FileText, 
  Menu, 
  X,
  User,
  Link2,
  Send
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
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

  const navItems = [
    { name: 'Vue d\'ensemble', href: '/dashboard', icon: Home },
    { name: 'Transactions', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Liens de paiement', href: '/dashboard/paylinks', icon: Link2 },
    { name: 'Paiement de masse', href: '/dashboard/bulk-payouts', icon: Send },
    { name: 'Clés API', href: '/dashboard/api-keys', icon: Key },
    { name: 'Webhooks', href: '/dashboard/webhooks', icon: Activity },
    { name: 'Réglements', href: '/dashboard/settlements', icon: Coins },
    { name: 'Conformité KYC', href: '/dashboard/kyc', icon: ShieldCheck },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        Chargement de la session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center space-x-2 text-white font-bold text-lg">
          <CreditCard className="h-6 w-6 text-indigo-500" />
          <span>Innov Pay</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="text-slate-400 hover:text-white p-1"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Container */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between p-6 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-white font-extrabold text-xl">
                <CreditCard className="h-8 w-8 text-indigo-500 animate-pulse" />
                <span className="bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">Innov Pay</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition duration-200
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-800">
            <div className="flex items-center space-x-3 px-2">
              <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold">
                <User className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition duration-200"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
