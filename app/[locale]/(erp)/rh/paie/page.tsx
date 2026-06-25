'use client';

import { useState } from 'react';
import {
  Receipt, Plus, Search, Eye, Download, Send, CheckCircle,
  AlertCircle, DollarSign, Wallet, FileText, Settings, ArrowUpRight
} from 'lucide-react';

const PAYROLL_RECORDS = [
  { id: '1', employee: 'Ibrahima Diallo', dept: 'Exploitation', base: 285_000, bonuses: 45_000, deductions: 10_000, net: 320_000, status: 'paid' },
  { id: '2', employee: 'Moussa Traoré',   dept: 'Exploitation', base: 260_000, bonuses: 30_000, deductions: 0,      net: 290_000, status: 'validated' },
  { id: '3', employee: 'Oumar Seck',      dept: 'Exploitation', base: 310_000, bonuses: 55_000, deductions: 20_000, net: 345_000, status: 'paid' },
  { id: '4', employee: 'Aminata Fall',    dept: 'Comptabilité', base: 520_000, bonuses: 0,      deductions: 0,      net: 520_000, status: 'validated' },
  { id: '5', employee: 'Mamadou Ndiaye',  dept: 'RH',           base: 750_000, bonuses: 0,      deductions: 50_000, net: 700_000, status: 'draft' },
  { id: '6', employee: 'Fatoumata Bah',   dept: 'Finance',      base: 1_200_000, bonuses: 0,    deductions: 0,      net: 1_200_000, status: 'draft' },
  { id: '7', employee: 'Cheikh Fall',     dept: 'Exploitation', base: 185_000, bonuses: 15_000, deductions: 0,      net: 200_000, status: 'validated' },
  { id: '8', employee: 'Amadou Diop',     dept: 'Exploitation', base: 340_000, bonuses: 60_000, deductions: 0,      net: 400_000, status: 'paid' },
];

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  draft:     { label: 'Brouillon', badgeCls: 'bg-slate-100 text-slate-700',   icon: AlertCircle },
  validated: { label: 'Validé',    badgeCls: 'bg-blue-50 text-blue-700',      icon: CheckCircle },
  paid:      { label: 'Payé',      badgeCls: 'bg-green-50 text-green-700',    icon: CheckCircle },
};

export default function PaiePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = {
    totalGross:    PAYROLL_RECORDS.reduce((s, r) => s + r.base + r.bonuses, 0),
    totalNet:      PAYROLL_RECORDS.reduce((s, r) => s + r.net, 0),
    totalPaid:     PAYROLL_RECORDS.filter(r => r.status === 'paid').reduce((s, r) => s + r.net, 0),
    totalDraft:    PAYROLL_RECORDS.filter(r => r.status === 'draft').reduce((s, r) => s + r.net, 0),
  };

  const filtered = PAYROLL_RECORDS.filter(r => {
    const matchSearch = search === '' ||
      r.employee.toLowerCase().includes(search.toLowerCase()) ||
      r.dept.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Gestion de la Paie</h1>
          <p className="text-sm text-text-secondary mt-0.5">Calcul des salaires, cotisations et virements</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs"><Settings className="w-3.5 h-3.5" /> Paramètres</button>
          <button className="btn-primary text-xs"><Plus className="w-3.5 h-3.5" /> Calculer la Paie (Juin)</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Masse Salariale Brut', value: `${stats.totalGross.toLocaleString('fr-FR')} XOF`, icon: DollarSign, cls: 'bg-brand-50 text-brand-600' },
          { label: 'Net à payer total',   value: `${stats.totalNet.toLocaleString('fr-FR')} XOF`,   icon: Wallet,     cls: 'bg-blue-50 text-blue-700' },
          { label: 'Total payé',           value: `${stats.totalPaid.toLocaleString('fr-FR')} XOF`,  icon: CheckCircle, cls: 'bg-green-50 text-green-700' },
          { label: 'En cours de validation', value: `${stats.totalDraft.toLocaleString('fr-FR')} XOF`, icon: AlertCircle, cls: 'bg-amber-50 text-amber-700' },
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
              placeholder="Rechercher par employé ou département..."
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
            <option value="draft">Brouillon</option>
            <option value="validated">Validé</option>
            <option value="paid">Payé</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Département</th>
                <th className="text-right">Salaire Base</th>
                <th className="text-right">Primes / Heures Sup.</th>
                <th className="text-right">Retenues / Avances</th>
                <th className="text-right">Net à payer</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const S = STATUS_CONFIG[r.status] || { label: r.status, badgeCls: 'bg-gray-100 text-gray-700', icon: AlertCircle };
                const SIcon = S.icon;
                return (
                  <tr key={r.id} className="cursor-pointer">
                    <td><span className="font-semibold text-sm text-text-primary">{r.employee}</span></td>
                    <td className="text-xs text-text-secondary">{r.dept}</td>
                    <td className="text-right tabular-nums text-text-secondary text-xs">{r.base.toLocaleString('fr-FR')} XOF</td>
                    <td className="text-right tabular-nums text-green-600 text-xs">+{r.bonuses.toLocaleString('fr-FR')} XOF</td>
                    <td className="text-right tabular-nums text-red-600 text-xs">-{r.deductions.toLocaleString('fr-FR')} XOF</td>
                    <td className="text-right font-bold tabular-nums text-text-primary text-sm">{r.net.toLocaleString('fr-FR')} XOF</td>
                    <td>
                      <span className={`badge ${S.badgeCls}`}>
                        <SIcon className="w-3 h-3" />{S.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" title="Consulter Bulletin"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="btn-ghost p-1.5" title="Télécharger PDF"><Download className="w-3.5 h-3.5" /></button>
                        {r.status === 'validated' && (
                          <button className="btn-ghost p-1.5 text-green-600 hover:bg-green-50" title="Virement"><Send className="w-3.5 h-3.5" /></button>
                        )}
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
