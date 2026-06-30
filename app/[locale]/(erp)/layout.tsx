'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, BookOpen, FileText, Truck, Users, MapPin,
  Wrench, Fuel, UserCog, Receipt, BarChart3, Bot,
  FolderOpen, Settings, LogOut, ChevronDown, ChevronRight,
  Bell, Globe, Menu, X, Building2, Check, User, Shield,
} from 'lucide-react';

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
  children?: { key: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard',  href: '/dashboard',          icon: LayoutDashboard },
  {
    key: 'accounting', href: '/comptabilite',         icon: BookOpen,
    children: [
      { key: 'Grand livre',   href: '/comptabilite/grand-livre' },
      { key: 'Balance',       href: '/comptabilite/balance' },
      { key: 'Bilan',         href: '/comptabilite/bilan' },
      { key: 'Déclarations',  href: '/comptabilite/declarations' },
    ],
  },
  { key: 'billing',      href: '/facturation',        icon: FileText },
  { key: 'fleet',        href: '/flotte',             icon: Truck },
  { key: 'drivers',      href: '/chauffeurs',         icon: Users },
  { key: 'missions',     href: '/missions',           icon: MapPin },
  { key: 'maintenance',  href: '/flotte/maintenance', icon: Wrench },
  { key: 'fuel',         href: '/flotte/carburant',   icon: Fuel },
  { key: 'hr',           href: '/rh',                 icon: UserCog },
  { key: 'payroll',      href: '/rh/paie',            icon: Receipt },
  { key: 'bi',           href: '/business-intelligence', icon: BarChart3 },
  { key: 'ai',           href: '/ia-assistant',       icon: Bot },
  { key: 'documents',    href: '/documents',          icon: FolderOpen },
  { key: 'admin',        href: '/administration',     icon: Settings },
];

const NOTIFICATIONS = [
  { id: '1', title: 'Maintenance due', desc: 'Véhicule TN-7701-EF — Vidange + filtres dans 3 jours', time: 'il y a 5 min', read: false },
  { id: '2', title: 'Facture en retard', desc: 'FAC-2026-0832 (SONACOS) dépasse l\'échéance depuis 3 jours', time: 'il y a 1h', read: false },
  { id: '3', title: 'Mission terminée', desc: 'Mission MIS-2026-7834 Dakar → Bamako livrée avec succès', time: 'il y a 3h', read: true },
];

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState('dg@demo.com');
  const [userName, setUserName] = useState('Directeur Général');
  const [userRole, setUserRole] = useState('dg');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currency, setCurrency] = useState('XOF');
  const [currencyToast, setCurrencyToast] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem('mock-user-email');
    const name = localStorage.getItem('mock-user-name');
    const role = localStorage.getItem('mock-user-role');
    if (email) setUserEmail(email);
    if (name) setUserName(name);
    if (role) setUserRole(role);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCurrencyChange = (val: string) => {
    setCurrency(val);
    setCurrencyToast(`Devise changée en ${val}`);
    setTimeout(() => setCurrencyToast(null), 2500);
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (href: string) => pathname.includes(href) && href !== '/dashboard'
    ? true
    : pathname === `/${locale}${href}`;

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const switchLocale = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const navLabel = (key: string) => {
    const map: Record<string, string> = {
      dashboard: t('dashboard'),
      accounting: t('accounting'),
      billing: t('billing'),
      fleet: t('fleet'),
      drivers: t('drivers'),
      missions: t('missions'),
      maintenance: t('maintenance'),
      fuel: t('fuel'),
      hr: t('hr'),
      payroll: t('payroll'),
      bi: t('bi'),
      ai: t('ai'),
      documents: t('documents'),
      admin: t('admin'),
    };
    return map[key] || key;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-border">
        <div className="w-9 h-9 bg-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Truck className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="font-bold text-text-primary text-sm truncate">Le Grand Transporteur</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">ERP Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const expanded = expandedItems.includes(item.key);

          return (
            <div key={item.key}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.key)}
                    className={`sidebar-link w-full ${active ? 'active' : ''}`}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0 sidebar-icon" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{navLabel(item.key)}</span>
                        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </>
                    )}
                  </button>
                  {expanded && sidebarOpen && (
                    <div className="ml-7 mt-0.5 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={`/${locale}${child.href}`}
                          className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            pathname.includes(child.href)
                              ? 'text-brand-700 bg-brand-50'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                          }`}
                        >
                          {child.key}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={`/${locale}${item.href}`}
                  className={`sidebar-link ${active ? 'active' : ''}`}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0 sidebar-icon" />
                  {sidebarOpen && <span>{navLabel(item.key)}</span>}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-surface-border space-y-1">
        {/* User info */}
        {sidebarOpen && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-700 text-xs font-bold uppercase">{userRole.slice(0, 2)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">{userName}</p>
              <p className="text-[10px] text-text-muted truncate">{userEmail}</p>
            </div>
          </div>
        )}
        <button onClick={switchLocale} className="sidebar-link w-full">
          <Globe className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span className="uppercase text-xs font-semibold tracking-wide">{locale === 'fr' ? 'EN' : 'FR'}</span>}
        </button>
        <Link href={`/${locale}/login`} className="sidebar-link w-full text-danger hover:text-danger hover:bg-danger-light">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span>{t('logout')}</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-bg">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-surface-border transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? 'w-60' : 'w-16'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white shadow-xl animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-surface-border px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileSidebarOpen(!mobileSidebarOpen);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="btn-ghost p-2"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            {/* Breadcrumb placeholder */}
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Building2 className="w-4 h-4" />
              <span>/</span>
              <span className="font-medium text-text-primary capitalize">
                {pathname.split('/').at(-1)?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency toast */}
            {currencyToast && (
              <div className="fixed top-4 right-4 z-[100] px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl shadow-lg flex items-center gap-2">
                <Check className="w-4 h-4" /> {currencyToast}
              </div>
            )}

            {/* Currency selector */}
            <select
              className="text-xs text-text-secondary bg-surface-bg border border-surface-border rounded-lg px-3 py-1.5 outline-none focus:border-brand-400"
              value={currency}
              onChange={e => handleCurrencyChange(e.target.value)}
            >
              <option value="XOF">XOF (FCFA)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>

            {/* Notifications */}
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative btn-ghost p-2"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-danger rounded-full text-[9px] font-bold text-white flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-surface-border shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
                    <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
                    <button onClick={markAllRead} className="text-xs text-brand-700 hover:underline">Tout marquer lu</button>
                  </div>
                  <div className="divide-y divide-surface-border max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 hover:bg-surface-bg transition-all cursor-pointer ${!n.read ? 'bg-brand-50/30' : ''}`}>
                        <div className="flex items-start gap-2">
                          {!n.read && <span className="w-2 h-2 rounded-full bg-brand-700 mt-1.5 flex-shrink-0" />}
                          {n.read && <span className="w-2 h-2 flex-shrink-0" />}
                          <div>
                            <p className="text-xs font-semibold text-text-primary">{n.title}</p>
                            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.desc}</p>
                            <p className="text-[10px] text-text-muted mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar + User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-brand-300 transition-all"
              >
                <span className="text-white text-xs font-bold uppercase">{userRole.slice(0, 2)}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-surface-border shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-surface-border">
                    <p className="text-sm font-semibold text-text-primary truncate">{userName}</p>
                    <p className="text-xs text-text-muted truncate">{userEmail}</p>
                    <span className="mt-1 inline-block badge bg-brand-50 text-brand-700 uppercase text-[10px] font-bold">{userRole}</span>
                  </div>
                  <div className="p-1">
                    <Link href={`/${locale}/administration`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-bg rounded-lg transition-all">
                      <User className="w-4 h-4" /> Mon profil
                    </Link>
                    <Link href={`/${locale}/administration`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-bg rounded-lg transition-all">
                      <Shield className="w-4 h-4" /> Sécurité &amp; MFA
                    </Link>
                    <div className="border-t border-surface-border my-1" />
                    <Link href={`/${locale}/login`} className="flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-lg transition-all">
                      <LogOut className="w-4 h-4" /> {t('logout')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
