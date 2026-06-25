'use client';

import { useState } from 'react';
import {
  MapPin, Plus, Search, Filter, Eye, Edit, Trash2,
  TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle,
  XCircle, AlertTriangle, Truck, Users, ChevronDown,
  ArrowRight, Calendar, Navigation,
} from 'lucide-react';

const MISSIONS = [
  { id: '1', ref: 'MIS-2026-0847', client: 'SHELL Sénégal',     departure: 'Dakar, Port',        arrival: 'Thiès, Dépôt SHELL',    driver: 'Ibrahima Diallo',  vehicle: 'TN-4821-AB', dep_at: '2026-06-25T07:00', arr_at: null,               distance: 72,   revenue: 2_800_000, cost: 1_540_000, margin: 45.0, status: 'in_progress' },
  { id: '2', ref: 'MIS-2026-0846', client: 'SONACOS',           departure: 'Kaolack, Usine',     arrival: 'Dakar, Port',           driver: 'Moussa Traoré',   vehicle: 'TN-3356-CD', dep_at: '2026-06-24T06:00', arr_at: '2026-06-24T13:30',  distance: 196,  revenue: 1_950_000, cost: 1_170_000, margin: 40.0, status: 'completed' },
  { id: '3', ref: 'MIS-2026-0845', client: 'TOTAL Énergies',    departure: 'Dakar, Dépôt',       arrival: 'Saint-Louis, Station',  driver: 'Oumar Seck',      vehicle: 'TN-1102-GH', dep_at: '2026-06-24T05:30', arr_at: '2026-06-24T14:00',  distance: 268,  revenue: 3_400_000, cost: 1_972_000, margin: 42.0, status: 'completed' },
  { id: '4', ref: 'MIS-2026-0844', client: 'Bolloré Logistics', departure: 'Dakar Port, Terminal',arrival: 'Bamako, Entrepôt',      driver: 'Amadou Diop',     vehicle: 'TN-9901-OP', dep_at: '2026-06-26T04:00', arr_at: null,               distance: 1248, revenue: 8_200_000, cost: 5_330_000, margin: 35.0, status: 'planned' },
  { id: '5', ref: 'MIS-2026-0843', client: 'SENELEC',           departure: 'Dakar, Centrale',    arrival: 'Ziguinchor, Site',      driver: 'Cheikh Fall',     vehicle: 'TN-2234-KL', dep_at: '2026-06-25T08:00', arr_at: null,               distance: 492,  revenue: 4_100_000, cost: 2_542_000, margin: 38.0, status: 'in_progress' },
  { id: '6', ref: 'MIS-2026-0842', client: 'ICS (Industries chimiques)', departure: 'Thiès',  arrival: 'Dakar, Port',           driver: 'Aliou Ba',        vehicle: 'TN-8890-IJ', dep_at: '2026-06-23T07:00', arr_at: null,               distance: 72,   revenue: 1_200_000, cost: 900_000,  margin: 25.0, status: 'cancelled' },
  { id: '7', ref: 'MIS-2026-0841', client: 'EIFFAGE Sénégal',  departure: 'Dakar',              arrival: 'Touba, Chantier',       driver: 'Omar Sarr',       vehicle: 'TN-5567-MN', dep_at: '2026-06-23T06:00', arr_at: '2026-06-23T15:00',  distance: 194,  revenue: 3_600_000, cost: 2_160_000, margin: 40.0, status: 'completed' },
];

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  in_progress: { label: 'En cours',   badgeCls: 'bg-blue-50 text-blue-700',    icon: Navigation },
  completed:   { label: 'Terminée',   badgeCls: 'bg-green-50 text-green-700', icon: CheckCircle },
  planned:     { label: 'Planifiée',  badgeCls: 'bg-slate-100 text-slate-700',    icon: Clock },
  cancelled:   { label: 'Annulée',    badgeCls: 'bg-red-50 text-red-700',  icon: XCircle },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconCls: string;
}

function StatCard({ label, value, icon: Icon, iconCls }: StatCardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconCls}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  );
}

export default function MissionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = {
    total:       MISSIONS.length,
    in_progress: MISSIONS.filter(m => m.status === 'in_progress').length,
    completed:   MISSIONS.filter(m => m.status === 'completed').length,
    totalRevenue: MISSIONS.filter(m => m.status !== 'cancelled').reduce((s, m) => s + m.revenue, 0),
    avgMargin:   (
      MISSIONS.filter(m => m.status !== 'cancelled').reduce((s, m) => s + m.margin, 0) /
      MISSIONS.filter(m => m.status !== 'cancelled').length
    ).toFixed(1),
  };

  const filtered = MISSIONS.filter(m => {
    const matchSearch = search === '' ||
      m.ref.toLowerCase().includes(search.toLowerCase()) ||
      m.client.toLowerCase().includes(search.toLowerCase()) ||
      m.driver.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Missions de transport</h1>
          <p className="text-sm text-text-secondary mt-0.5">{stats.total} missions ce mois</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> Nouvelle mission
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total missions"   value={stats.total}       icon={MapPin}      iconCls="bg-brand-50 text-brand-600" />
        <StatCard label="En cours"         value={stats.in_progress} icon={Navigation}  iconCls="bg-blue-50 text-blue-700" />
        <StatCard label="Terminées"        value={stats.completed}   icon={CheckCircle} iconCls="bg-green-50 text-green-700" />
        <StatCard label="CA total"         value={`${fmt(stats.totalRevenue)} XOF`} icon={DollarSign} iconCls="bg-green-50 text-green-700" />
        <StatCard label="Marge moyenne"    value={`${stats.avgMargin}%`} icon={TrendingUp} iconCls="bg-brand-50 text-brand-600" />
      </div>

      {/* Filters + Table */}
      <div className="section-card">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-9"
              placeholder="Rechercher par réf., client, chauffeur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'in_progress', 'completed', 'planned', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  statusFilter === s
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'bg-white text-text-secondary border-surface-border hover:border-brand-200'
                }`}
              >
                {{ all: 'Toutes', in_progress: 'En cours', completed: 'Terminées', planned: 'Planifiées', cancelled: 'Annulées' }[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Trajet</th>
                <th>Chauffeur / Véhicule</th>
                <th>Départ</th>
                <th>Arrivée</th>
                <th>Distance</th>
                <th>Revenu</th>
                <th>Coût</th>
                <th>Marge</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const S = STATUS_CONFIG[m.status] || { label: m.status, badgeCls: 'bg-gray-100 text-gray-700', icon: MapPin };
                const SIcon = S.icon;
                return (
                  <tr key={m.id} className="cursor-pointer">
                    <td>
                      <span className="font-mono text-xs font-bold text-text-primary">{m.ref}</span>
                    </td>
                    <td className="font-medium text-text-primary text-sm">{m.client}</td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-text-primary font-medium">
                        <span>{m.departure}</span>
                        <ArrowRight className="w-3 h-3 text-text-muted" />
                        <span>{m.arrival}</span>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-xs text-text-primary">{m.driver}</div>
                      <div className="text-[10px] font-mono text-text-muted">{m.vehicle}</div>
                    </td>
                    <td className="text-xs text-text-secondary">{fmtDate(m.dep_at)}</td>
                    <td className="text-xs text-text-secondary">{fmtDate(m.arr_at)}</td>
                    <td className="text-xs font-medium">{m.distance.toLocaleString('fr-FR')} km</td>
                    <td className="font-semibold tabular-nums text-text-primary text-sm">{m.revenue.toLocaleString('fr-FR')} XOF</td>
                    <td className="text-xs text-text-secondary tabular-nums">{m.cost.toLocaleString('fr-FR')} XOF</td>
                    <td>
                      <span className={`font-bold ${
                        m.margin >= 40 ? 'text-green-600' :
                        m.margin >= 25 ? 'text-amber-600' : 'text-red-600'
                      }`}>{m.margin.toFixed(0)}%</span>
                    </td>
                    <td>
                      <span className={`badge ${S.badgeCls}`}>
                        <SIcon className="w-3 h-3" />{S.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" title="Voir"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="btn-ghost p-1.5" title="Modifier"><Edit className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-text-muted">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune mission trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
