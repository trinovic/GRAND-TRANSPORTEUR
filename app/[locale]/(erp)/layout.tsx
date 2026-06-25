'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, BookOpen, FileText, Truck, Users, MapPin,
  Wrench, Fuel, UserCog, Receipt, BarChart3, Bot,
  FolderOpen, Settings, LogOut, ChevronDown, ChevronRight,
  Bell, Globe, Menu, X, Building2,
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

  useEffect(() => {
    const email = localStorage.getItem('mock-user-email');
    const name = localStorage.getItem('mock-user-name');
    const role = localStorage.getItem('mock-user-role');
    if (email) setUserEmail(email);
    if (name) setUserName(name);
    if (role) setUserRole(role);
  }, []);

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
            {/* Currency selector */}
            <select className="text-xs text-text-secondary bg-surface-bg border border-surface-border rounded-lg px-3 py-1.5 outline-none focus:border-brand-400">
              <option value="XOF">XOF (FCFA)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>

            {/* Notifications */}
            <button className="relative btn-ghost p-2">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center cursor-pointer">
              <span className="text-white text-xs font-bold">DG</span>
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
