'use client';

import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, Users, Truck,
  AlertTriangle, CheckCircle, Clock, XCircle, ArrowUpRight,
  ArrowDownRight, Activity, BarChart2, MapPin, Fuel, Wrench,
  RefreshCw, Filter, Download,
} from 'lucide-react';

// ─── Demo Data ────────────────────────────────────────────────────────────────
const revenueData = [
  { month: 'Jan', revenue: 42500000, expenses: 28000000 },
  { month: 'Fév', revenue: 38000000, expenses: 25500000 },
  { month: 'Mar', revenue: 55000000, expenses: 32000000 },
  { month: 'Avr', revenue: 61000000, expenses: 38000000 },
  { month: 'Mai', revenue: 58000000, expenses: 35000000 },
  { month: 'Jun', revenue: 67500000, expenses: 41000000 },
];

const vehiclePerf = [
  { name: 'TN-4821-AB', margin: 38.2, revenue: 12400000 },
  { name: 'TN-3356-CD', margin: 29.5, revenue: 9800000 },
  { name: 'TN-7701-EF', margin: 22.1, revenue: 7600000 },
  { name: 'TN-1102-GH', margin: 41.8, revenue: 15200000 },
  { name: 'TN-8890-IJ', margin: 15.3, revenue: 5400000 },
];

const activityBreakdown = [
  { name: 'Transport hydrocarbures', value: 42, color: '#1D4ED8' },
  { name: 'Transport conteneurs', value: 28, color: '#10B981' },
  { name: 'Transport vrac', value: 18, color: '#F59E0B' },
  { name: 'Logistique spéciale', value: 12, color: '#8B5CF6' },
];

const missionTrend = [
  { day: 'Lun', missions: 14 }, { day: 'Mar', missions: 18 },
  { day: 'Mer', missions: 22 }, { day: 'Jeu', missions: 19 },
  { day: 'Ven', missions: 25 }, { day: 'Sam', missions: 16 },
  { day: 'Dim', missions: 8  },
];

const alerts = [
  { id: '1', type: 'danger' as const,  icon: Wrench,   title: 'Contrôle technique expiré',    desc: 'TN-8890-IJ — Expiré depuis 3 jours',       time: 'Il y a 3j' },
  { id: '2', type: 'danger' as const,  icon: AlertTriangle, title: 'Assurance expirée',       desc: 'TN-3356-CD — Renouvellement requis',        time: 'Il y a 1j' },
  { id: '3', type: 'warning' as const, icon: Fuel,     title: 'Surconsommation détectée',     desc: 'Chauffeur Mamadou D. — +23% vs moyenne',   time: 'Aujourd\'hui' },
  { id: '4', type: 'warning' as const, icon: DollarSign, title: 'Facture en retard',          desc: 'SONACOS — 4 500 000 XOF — 12j de retard',  time: 'Il y a 12j' },
  { id: '5', type: 'warning' as const, icon: Clock,    title: 'Permis expiration imminente',  desc: 'Omar S. — Expire dans 14 jours',            time: 'Dans 14j' },
];

const recentMissions = [
  { ref: 'MIS-2026-0847', client: 'SHELL Sénégal',    route: 'Dakar → Thiès',         driver: 'Ibrahima Diallo', status: 'in_progress', revenue: 2800000 },
  { ref: 'MIS-2026-0846', client: 'SONACOS',          route: 'Kaolack → Dakar',       driver: 'Moussa Traoré',   status: 'completed',   revenue: 1950000 },
  { ref: 'MIS-2026-0845', client: 'TOTAL Énergies',   route: 'Dakar → Saint-Louis',   driver: 'Oumar Seck',      status: 'completed',   revenue: 3400000 },
  { ref: 'MIS-2026-0844', client: 'Bolloré Logistics', route: 'Dakar Port → Bamako', driver: 'Amadou Diop',     status: 'planned',     revenue: 8200000 },
  { ref: 'MIS-2026-0843', client: 'SENELEC',          route: 'Dakar → Ziguinchor',    driver: 'Cheikh Fall',     status: 'in_progress', revenue: 4100000 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function fmtXOF(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  in_progress: { label: 'En cours',    cls: 'badge-info' },
  completed:   { label: 'Terminée',    cls: 'badge-success' },
  planned:     { label: 'Planifiée',   cls: 'badge-gray' },
  cancelled:   { label: 'Annulée',     cls: 'badge-danger' },
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  variant: 'success' | 'danger' | 'warning' | 'info';
}

function KPICard({ title, value, change, changeLabel, icon: Icon, variant }: KPICardProps) {
  const positive = change >= 0;
  const variantBorder = {
    success: 'border-l-success',
    danger:  'border-l-danger',
    warning: 'border-l-warning',
    info:    'border-l-brand-600',
  }[variant];

  return (
    <div className={`kpi-card border-l-4 ${variantBorder} animate-fade-in`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          variant === 'success' ? 'bg-success/10 text-success' :
          variant === 'danger'  ? 'bg-danger/10 text-danger' :
          variant === 'warning' ? 'bg-warning/10 text-warning' :
                                  'bg-brand-50 text-brand-600'
        }`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary mb-2 tabular-nums">{value}</p>
      <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-success' : 'text-danger'}`}>
        {positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        <span>{positive ? '+' : ''}{change}%</span>
        <span className="text-text-muted font-normal ml-0.5">{changeLabel}</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');
  const [currency, setCurrency] = useState('XOF');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Tableau de bord exécutif</h1>
          <p className="text-sm text-text-secondary mt-0.5">Indicateurs en temps réel — mis à jour à 14:11</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-surface-bg border border-surface-border rounded-lg p-0.5">
            {(['day', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  period === p ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {{ day: 'Jour', month: 'Mois', year: 'Année' }[p]}
              </button>
            ))}
          </div>
          <button className="btn-secondary text-xs gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Actualiser
          </button>
          <button className="btn-secondary text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPI Grid — Row 1: Financial */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KPICard title="Chiffre d'affaires du mois"  value="67,5M XOF"  change={+12.4} changeLabel="vs mois dernier" icon={TrendingUp}   variant="success" />
        <KPICard title="Dépenses du mois"             value="41,0M XOF"  change={+5.2}  changeLabel="vs mois dernier" icon={TrendingDown} variant="warning" />
        <KPICard title="Résultat net"                 value="26,5M XOF"  change={+18.7} changeLabel="vs mois dernier" icon={BarChart2}    variant="success" />
        <KPICard title="Trésorerie disponible"        value="184,2M XOF" change={+3.1}  changeLabel="vs hier"         icon={Wallet}       variant="info" />
      </div>

      {/* KPI Grid — Row 2: Operational */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KPICard title="Créances clients"             value="38,4M XOF"  change={-8.2}  changeLabel="vs mois dernier" icon={DollarSign}   variant="warning" />
        <KPICard title="Dettes fournisseurs"          value="12,1M XOF"  change={+2.0}  changeLabel="vs mois dernier" icon={Activity}      variant="info" />
        <KPICard title="Missions en cours"            value="23"          change={+15.0} changeLabel="vs hier"         icon={MapPin}        variant="success" />
        <KPICard title="Véhicules actifs"             value="41 / 48"     change={-4.2}  changeLabel="vs semaine dern." icon={Truck}        variant="warning" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue vs Expenses Chart */}
        <div className="lg:col-span-2 section-card">
          <div className="section-header">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Revenus vs Dépenses</h2>
              <p className="text-xs text-text-secondary mt-0.5">6 derniers mois</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand-600 inline-block" />Revenus</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-warning inline-block" />Dépenses</span>
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${fmt(v)}`} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number) => [fmtXOF(value)]}
                  contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' }}
                />
                <Area type="monotone" dataKey="revenue"  stroke="#2563EB" strokeWidth={2} fill="url(#colorRevenue)"  name="Revenus" />
                <Area type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={2} fill="url(#colorExpenses)" name="Dépenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="text-sm font-semibold text-text-primary">Répartition des activités</h2>
          </div>
          <div className="p-4 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={activityBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {activityBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2 mt-2">
              {activityBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold text-text-primary ml-2">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Vehicle performance + Mission trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Vehicle Performance */}
        <div className="lg:col-span-2 section-card">
          <div className="section-header">
            <h2 className="text-sm font-semibold text-text-primary">Rentabilité par véhicule</h2>
            <button className="btn-ghost text-xs">Voir tout →</button>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vehiclePerf} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" domain={[0, 50]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v) => [`${v}%`, 'Marge']} contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="margin" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mission Trend */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="text-sm font-semibold text-text-primary">Missions / semaine</h2>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={missionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="missions" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Missions + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Missions */}
        <div className="lg:col-span-2 section-card">
          <div className="section-header">
            <h2 className="text-sm font-semibold text-text-primary">Missions récentes</h2>
            <button className="btn-secondary text-xs">Voir toutes les missions</button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Trajet</th>
                  <th>Chauffeur</th>
                  <th>Revenu</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentMissions.map((m) => (
                  <tr key={m.ref} className="cursor-pointer">
                    <td><span className="font-mono text-xs font-medium text-brand-700">{m.ref}</span></td>
                    <td className="font-medium text-text-primary">{m.client}</td>
                    <td className="text-text-secondary text-xs">{m.route}</td>
                    <td className="text-text-secondary text-xs">{m.driver}</td>
                    <td className="font-semibold tabular-nums">{fmt(m.revenue)} XOF</td>
                    <td><span className={`badge ${STATUS_MAP[m.status].cls}`}>{STATUS_MAP[m.status].label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="text-sm font-semibold text-text-primary">Alertes critiques</h2>
            <span className="badge badge-danger">{alerts.filter(a => a.type === 'danger').length} urgentes</span>
          </div>
          <div className="divide-y divide-surface-border">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div key={alert.id} className={`flex gap-3 p-4 hover:bg-surface-hover cursor-pointer transition-colors`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.type === 'danger'  ? 'bg-danger-light text-danger' :
                    alert.type === 'warning' ? 'bg-warning-light text-warning' :
                                               'bg-info-light text-info'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-primary truncate">{alert.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{alert.desc}</p>
                    <p className="text-[10px] text-text-muted mt-1">{alert.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-surface-border">
            <button className="btn-ghost w-full justify-center text-xs">Voir toutes les alertes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
