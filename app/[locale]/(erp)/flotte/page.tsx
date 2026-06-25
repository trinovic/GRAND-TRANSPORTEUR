'use client';

import { useState } from 'react';
import {
  Truck, Plus, Search, Filter, Eye, Edit, Wrench,
  CheckCircle, XCircle, AlertTriangle, ChevronRight,
  Fuel, Calendar, Hash, TrendingUp, TrendingDown,
  ArrowUpRight,
} from 'lucide-react';

const VEHICLES = [
  { id: '1', plate: 'TN-4821-AB', type: 'Camion-citerne',     brand: 'Mercedes', model: 'Actros 3341', year: 2021, km: 187_420, status: 'active',       driver: 'Ibrahima Diallo',  insurance: '2027-03-15', ct: '2026-09-10', margin: 38.2, revenue: 12_400_000 },
  { id: '2', plate: 'TN-3356-CD', type: 'Porte-conteneur',    brand: 'Volvo',    model: 'FH 460',     year: 2020, km: 241_100, status: 'active',       driver: 'Moussa Traoré',   insurance: '2024-11-20', ct: '2025-11-20', margin: 29.5, revenue: 9_800_000 },
  { id: '3', plate: 'TN-7701-EF', type: 'Semi-remorque',      brand: 'MAN',      model: 'TGX 26.480', year: 2019, km: 310_800, status: 'maintenance',  driver: 'N/A',             insurance: '2026-07-01', ct: '2026-07-01', margin: 22.1, revenue: 7_600_000 },
  { id: '4', plate: 'TN-1102-GH', type: 'Camion-citerne',     brand: 'Mercedes', model: 'Arocs 3332', year: 2022, km: 98_300,  status: 'active',       driver: 'Oumar Seck',      insurance: '2027-05-20', ct: '2027-01-15', margin: 41.8, revenue: 15_200_000 },
  { id: '5', plate: 'TN-8890-IJ', type: 'Camion plateau',     brand: 'Renault',  model: 'T 460',      year: 2018, km: 398_500, status: 'immobilized',  driver: 'N/A',             insurance: '2023-08-15', ct: '2024-08-15', margin: 15.3, revenue: 5_400_000 },
  { id: '6', plate: 'TN-2234-KL', type: 'Véhicule léger',     brand: 'Toyota',   model: 'Land Cruiser', year: 2023, km: 42_100, status: 'active',      driver: 'Cheikh Fall',     insurance: '2027-12-01', ct: '2027-06-01', margin: 35.0, revenue: 4_100_000 },
  { id: '7', plate: 'TN-5567-MN', type: 'Engin spécial',      brand: 'Caterpillar', model: 'CT660',  year: 2020, km: 156_200, status: 'active',      driver: 'Amadou Diop',     insurance: '2026-10-10', ct: '2026-10-10', margin: 27.4, revenue: 8_900_000 },
  { id: '8', plate: 'TN-9901-OP', type: 'Semi-remorque',      brand: 'DAF',      model: 'XF 480',     year: 2021, km: 203_700, status: 'active',      driver: 'Aliou Ba',        insurance: '2027-02-28', ct: '2026-11-20', margin: 33.1, revenue: 11_200_000 },
];

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  active:      { label: 'Actif',          badgeCls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  immobilized: { label: 'Immobilisé',     badgeCls: 'bg-rose-50 text-rose-700',  icon: XCircle },
  maintenance: { label: 'Maintenance',    badgeCls: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
};

const TYPE_COLORS: Record<string, string> = {
  'Camion-citerne':  'bg-blue-50 text-blue-700',
  'Porte-conteneur': 'bg-emerald-50 text-emerald-700',
  'Semi-remorque':   'bg-purple-50 text-purple-700',
  'Camion plateau':  'bg-amber-50 text-amber-700',
  'Véhicule léger':  'bg-cyan-50 text-cyan-700',
  'Engin spécial':   'bg-rose-50 text-rose-700',
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date();
}

function isExpiringSoon(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const days = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return days > 0 && days <= 30;
}

function DateBadge({ label, date }: { label: string; date: string }) {
  const expired = isExpired(date);
  const soon = isExpiringSoon(date);
  return (
    <div className={`flex flex-col ${
      expired ? 'text-red-600' : soon ? 'text-amber-600' : 'text-text-secondary'
    }`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-xs font-medium">{new Date(date).toLocaleDateString('fr-FR')}</span>
      {expired && <span className="text-[10px] font-bold">EXPIRÉ</span>}
      {soon    && <span className="text-[10px] font-bold">Bientôt</span>}
    </div>
  );
}

export default function FlottePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const stats = {
    total:       VEHICLES.length,
    active:      VEHICLES.filter(v => v.status === 'active').length,
    maintenance: VEHICLES.filter(v => v.status === 'maintenance').length,
    immobilized: VEHICLES.filter(v => v.status === 'immobilized').length,
  };

  const filtered = VEHICLES.filter(v => {
    const matchSearch = search === '' || v.plate.toLowerCase().includes(search.toLowerCase()) || v.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchType   = typeFilter   === 'all' || v.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const types = Array.from(new Set(VEHICLES.map(v => v.type)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Gestion de la flotte</h1>
          <p className="text-sm text-text-secondary mt-0.5">{stats.total} véhicules enregistrés</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Ajouter un véhicule
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total parc',     value: stats.total,       icon: Truck,         cls: 'text-brand-600 bg-brand-50' },
          { label: 'Actifs',         value: stats.active,      icon: CheckCircle,   cls: 'text-success bg-green-50 text-green-700' },
          { label: 'En maintenance', value: stats.maintenance, icon: Wrench,        cls: 'text-warning bg-amber-50 text-amber-700' },
          { label: 'Immobilisés',    value: stats.immobilized, icon: XCircle,       cls: 'text-danger bg-red-50 text-red-700' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="kpi-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-text-primary">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="section-card">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-9"
              placeholder="Rechercher par immatriculation ou marque..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="maintenance">En maintenance</option>
            <option value="immobilized">Immobilisés</option>
          </select>
          <select
            className="input w-auto"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">Tous les types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Immatriculation</th>
                <th>Type</th>
                <th>Véhicule</th>
                <th>Année / KM</th>
                <th>Chauffeur</th>
                <th>Assurance</th>
                <th>CT</th>
                <th>Marge</th>
                <th>CA / mois</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const S = STATUS_CONFIG[v.status] || { label: v.status, badgeCls: 'bg-gray-100 text-gray-700', icon: Truck };
                const SIcon = S.icon;
                return (
                  <tr key={v.id} className="cursor-pointer">
                    <td>
                      <span className="font-mono text-xs font-bold text-text-primary">{v.plate}</span>
                    </td>
                    <td>
                      <span className={`badge ${TYPE_COLORS[v.type] || 'bg-slate-100 text-slate-700'}`}>{v.type}</span>
                    </td>
                    <td>
                      <div className="font-medium text-text-primary">{v.brand}</div>
                      <div className="text-xs text-text-secondary">{v.model}</div>
                    </td>
                    <td>
                      <div className="text-sm font-medium">{v.year}</div>
                      <div className="text-xs text-text-secondary">{v.km.toLocaleString('fr-FR')} km</div>
                    </td>
                    <td className="text-xs text-text-secondary">{v.driver}</td>
                    <td><DateBadge label="Assur." date={v.insurance} /></td>
                    <td><DateBadge label="CT" date={v.ct} /></td>
                    <td>
                      <span className={`font-semibold ${v.margin >= 30 ? 'text-green-600' : v.margin >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                        {v.margin}%
                      </span>
                    </td>
                    <td className="font-medium tabular-nums text-text-primary">{fmt(v.revenue)} XOF</td>
                    <td>
                      <span className={`badge ${S.badgeCls}`}>
                        <SIcon className="w-3 h-3" />{S.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" title="Voir"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="btn-ghost p-1.5" title="Modifier"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="btn-ghost p-1.5" title="Maintenance"><Wrench className="w-3.5 h-3.5" /></button>
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
            <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun véhicule trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
