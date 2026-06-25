'use client';

import { useState } from 'react';
import {
  Wrench, Plus, Search, Filter, Eye, AlertTriangle, CheckCircle,
  Clock, DollarSign, Calendar, Truck, ArrowUpRight, BarChart2
} from 'lucide-react';

const MAINTENANCE_RECORDS = [
  { id: '1', vehicle: 'TN-7701-EF', type: 'Vidange', date: '2026-06-23', cost: 145_000, provider: 'Garage CFAO', desc: 'Vidange moteur complète + filtres huile/air/carburant', nextDue: '2026-12-23', status: 'completed' },
  { id: '2', vehicle: 'TN-8890-IJ', type: 'Freinage', date: '2026-06-20', cost: 380_000, provider: 'Garage CFAO', desc: 'Changement plaquettes et disques de freins train avant', nextDue: '2026-11-20', status: 'completed' },
  { id: '3', vehicle: 'TN-4821-AB', type: 'Pneumatiques', date: '2026-06-25', cost: 1_200_000, provider: 'Pneus Service', desc: 'Remplacement de 4 pneus arrière Michelin X Works', nextDue: '2027-06-25', status: 'in_progress' },
  { id: '4', vehicle: 'TN-3356-CD', type: 'Contrôle Technique', date: '2026-06-10', cost: 45_000, provider: 'ASUTSEN Dakar', desc: 'Visite technique périodique obligatoire', nextDue: '2027-06-10', status: 'completed' },
  { id: '5', vehicle: 'TN-1102-GH', type: 'Moteur', date: '2026-05-18', cost: 890_000, provider: 'Garage CFAO', desc: 'Changement kit de distribution et pompe à eau', nextDue: '2028-05-18', status: 'completed' },
  { id: '6', vehicle: 'TN-5567-MN', type: 'Climatisation', date: '2026-06-24', cost: 75_000, provider: 'Clim Plus', desc: 'Recharge gaz et nettoyage circuit clim cabine', nextDue: '2027-06-24', status: 'planned' },
];

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  completed:   { label: 'Terminé', badgeCls: 'bg-green-50 text-green-700', icon: CheckCircle },
  in_progress: { label: 'En cours', badgeCls: 'bg-blue-50 text-blue-700',    icon: Clock },
  planned:     { label: 'Planifié', badgeCls: 'bg-slate-100 text-slate-600',  icon: Calendar },
};

export default function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const stats = {
    totalCost:    MAINTENANCE_RECORDS.reduce((s, r) => s + r.cost, 0),
    inProgress:   MAINTENANCE_RECORDS.filter(r => r.status === 'in_progress').length,
    completed:    MAINTENANCE_RECORDS.filter(r => r.status === 'completed').length,
    planned:      MAINTENANCE_RECORDS.filter(r => r.status === 'planned').length,
  };

  const filtered = MAINTENANCE_RECORDS.filter(r => {
    const matchSearch = search === '' ||
      r.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const types = Array.from(new Set(MAINTENANCE_RECORDS.map(r => r.type)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Maintenance des Véhicules</h1>
          <p className="text-sm text-text-secondary mt-0.5">Suivi des entretiens et contrôles périodiques</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> Enregistrer un entretien
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Budget dépensé',  value: `${stats.totalCost.toLocaleString('fr-FR')} XOF`, icon: DollarSign, cls: 'bg-brand-50 text-brand-600' },
          { label: 'En atelier',       value: stats.inProgress,                              icon: Clock,      cls: 'bg-blue-50 text-blue-700' },
          { label: 'Révisions faites', value: stats.completed,                               icon: CheckCircle, cls: 'bg-green-50 text-green-700' },
          { label: 'Entretien prévu',  value: stats.planned,                                 icon: Calendar,   cls: 'bg-amber-50 text-amber-700' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="kpi-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Table section */}
      <div className="section-card">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-9"
              placeholder="Rechercher par véhicule, atelier, opération..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">Tous les types d'opération</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Opération</th>
                <th>Date d'effet</th>
                <th>Atelier / Prestataire</th>
                <th>Détails de l'intervention</th>
                <th className="text-right">Coût</th>
                <th>Échéance révision</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const S = STATUS_CONFIG[r.status] || { label: r.status, badgeCls: 'bg-gray-100 text-gray-700', icon: Clock };
                const SIcon = S.icon;
                return (
                  <tr key={r.id} className="cursor-pointer">
                    <td>
                      <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {r.vehicle}
                      </span>
                    </td>
                    <td><span className="font-medium text-sm text-text-primary">{r.type}</span></td>
                    <td className="text-xs text-text-secondary">{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                    <td className="text-xs text-text-primary font-medium">{r.provider}</td>
                    <td className="text-xs text-text-secondary max-w-[250px] truncate" title={r.desc}>{r.desc}</td>
                    <td className="text-right font-semibold tabular-nums text-text-primary text-xs">{r.cost.toLocaleString('fr-FR')} XOF</td>
                    <td className="text-xs text-text-secondary">{new Date(r.nextDue).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`badge ${S.badgeCls}`}>
                        <SIcon className="w-3 h-3" />{S.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" title="Consulter facture"><Eye className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
