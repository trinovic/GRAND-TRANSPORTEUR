'use client';

import { useState } from 'react';
import {
  Users, Plus, Search, Eye, Edit, Shield, Calendar, Phone, Award,
  CheckCircle, Clock, AlertTriangle, ArrowUpRight, DollarSign
} from 'lucide-react';

const DRIVERS = [
  { id: '1', name: 'Ibrahima Diallo', license: 'B-48192-DK', expiry: '2027-03-15', phone: '+221 77 123 45 67', contract: 'CDI', salary: 285_000, vehicle: 'TN-4821-AB', status: 'in_mission', score: 94 },
  { id: '2', name: 'Moussa Traoré',   license: 'C-22941-DK', expiry: '2024-11-20', phone: '+221 76 234 56 78', contract: 'CDI', salary: 260_000, vehicle: 'TN-3356-CD', status: 'resting',    score: 88 },
  { id: '3', name: 'Oumar Seck',      license: 'C-88192-DK', expiry: '2026-09-10', phone: '+221 70 345 67 89', contract: 'CDI', salary: 310_000, vehicle: 'TN-1102-GH', status: 'in_mission', score: 96 },
  { id: '4', name: 'Cheikh Fall',     license: 'B-11293-DK', expiry: '2027-12-01', phone: '+221 70 789 01 23', contract: 'CDD', salary: 185_000, vehicle: 'TN-2234-KL', status: 'resting',    score: 82 },
  { id: '5', name: 'Amadou Diop',     license: 'D-55610-DK', expiry: '2026-10-10', phone: '+221 78 890 12 34', contract: 'CDI', salary: 340_000, vehicle: 'TN-5567-MN', status: 'in_mission', score: 90 },
  { id: '6', name: 'Aliou Ba',        license: 'C-99012-DK', expiry: '2027-02-28', phone: '+221 77 901 23 45', contract: 'CDI', salary: 295_000, vehicle: 'TN-9901-OP', status: 'in_mission', score: 91 },
  { id: '7', name: 'Omar Sarr',       license: 'C-33812-DK', expiry: '2023-08-15', phone: '+221 76 012 34 56', contract: 'CDI', salary: 300_000, vehicle: 'N/A',        status: 'resting',    score: 85 },
];

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  in_mission: { label: 'En mission', badgeCls: 'bg-blue-50 text-blue-700',    icon: ArrowUpRight },
  resting:    { label: 'Au repos',    badgeCls: 'bg-green-50 text-green-700', icon: CheckCircle },
  suspended:  { label: 'Suspendu',   badgeCls: 'bg-red-50 text-red-700',      icon: AlertTriangle },
};

export default function ChauffeursPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = {
    total:       DRIVERS.length,
    inMission:   DRIVERS.filter(d => d.status === 'in_mission').length,
    resting:     DRIVERS.filter(d => d.status === 'resting').length,
    avgScore:    (DRIVERS.reduce((s, d) => s + d.score, 0) / DRIVERS.length).toFixed(0),
  };

  const filtered = DRIVERS.filter(d => {
    const matchSearch = search === '' ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.license.toLowerCase().includes(search.toLowerCase()) ||
      (d.vehicle && d.vehicle.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Chauffeurs</h1>
          <p className="text-sm text-text-secondary mt-0.5">Gestion des conducteurs et permis</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> Ajouter un chauffeur
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total chauffeurs',  value: stats.total,       icon: Users,      cls: 'bg-brand-50 text-brand-600' },
          { label: 'En mission',        value: stats.inMission,   icon: ArrowUpRight, cls: 'bg-blue-50 text-blue-700' },
          { label: 'Au repos',          value: stats.resting,     icon: CheckCircle, cls: 'bg-green-50 text-green-700' },
          { label: 'Score de conduite', value: `${stats.avgScore}%`, icon: Shield,     cls: 'bg-purple-50 text-purple-600' },
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
              placeholder="Rechercher par nom, permis, véhicule..."
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
            <option value="in_mission">En mission</option>
            <option value="resting">Au repos</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Chauffeur</th>
                <th>Permis / Validité</th>
                <th>Téléphone</th>
                <th>Contrat</th>
                <th className="text-right">Salaire Base</th>
                <th>Véhicule affecté</th>
                <th>Score sécurité</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const S = STATUS_CONFIG[d.status] || { label: d.status, badgeCls: 'bg-gray-100 text-gray-700', icon: Clock };
                const SIcon = S.icon;
                const isExpired = new Date(d.expiry) < new Date();
                return (
                  <tr key={d.id} className="cursor-pointer">
                    <td>
                      <div className="font-semibold text-text-primary text-sm">{d.name}</div>
                      <div className="text-[10px] text-text-muted">ID: CH-{d.id}</div>
                    </td>
                    <td>
                      <div className="font-mono text-xs text-text-primary">{d.license}</div>
                      <div className={`text-[10px] ${isExpired ? 'text-red-600 font-bold' : 'text-text-secondary'}`}>
                        Exp. {new Date(d.expiry).toLocaleDateString('fr-FR')} {isExpired && 'EXPIRÉ'}
                      </div>
                    </td>
                    <td className="text-xs text-text-secondary font-medium">{d.phone}</td>
                    <td>
                      <span className={`badge ${d.contract === 'CDI' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}`}>
                        {d.contract}
                      </span>
                    </td>
                    <td className="text-right font-medium text-xs tabular-nums">{d.salary.toLocaleString('fr-FR')} XOF</td>
                    <td>
                      <span className="font-mono text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-semibold">
                        {d.vehicle}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${d.score >= 90 ? 'text-green-600' : d.score >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                          {d.score}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${S.badgeCls}`}>
                        <SIcon className="w-3 h-3" />{S.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" title="Fiche détaillée"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="btn-ghost p-1.5" title="Modifier"><Edit className="w-3.5 h-3.5" /></button>
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
