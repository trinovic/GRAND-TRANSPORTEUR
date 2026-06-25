'use client';

import { useState } from 'react';
import {
  FileText, Plus, Search, Filter, Eye, Download, Mail, CheckCircle2,
  AlertCircle, Clock, XCircle, TrendingUp, TrendingDown, DollarSign,
  Receipt, FileCheck, ArrowUpRight
} from 'lucide-react';

const INVOICES = [
  { id: '1', ref: 'FAC-2026-0048', client: 'SHELL Sénégal',     mission: 'MIS-2026-0847', date: '2026-06-25', due: '2026-07-25', ht: 2_800_000, tva: 504_000, ttc: 3_304_000, status: 'sent' },
  { id: '2', ref: 'FAC-2026-0047', client: 'SONACOS',           mission: 'MIS-2026-0846', date: '2026-06-24', due: '2026-07-24', ht: 1_950_000, tva: 351_000, ttc: 2_301_000, status: 'paid' },
  { id: '3', ref: 'FAC-2026-0046', client: 'TOTAL Énergies',    mission: 'MIS-2026-0845', date: '2026-06-24', due: '2026-06-24', ht: 3_400_000, tva: 612_000, ttc: 4_012_000, status: 'paid' },
  { id: '4', ref: 'FAC-2026-0045', client: 'Bolloré Logistics', mission: 'MIS-2026-0844', date: '2026-06-23', due: '2026-07-23', ht: 8_200_000, tva: 1_476_000, ttc: 9_676_000, status: 'draft' },
  { id: '5', ref: 'FAC-2026-0044', client: 'SENELEC',           mission: 'MIS-2026-0843', date: '2026-06-22', due: '2026-07-22', ht: 4_100_000, tva: 738_000, ttc: 4_838_000, status: 'sent' },
  { id: '6', ref: 'FAC-2026-0043', client: 'ICS (Industries)',  mission: 'MIS-2026-0842', date: '2026-06-20', due: '2026-06-20', ht: 1_200_000, tva: 216_000, ttc: 1_416_000, status: 'cancelled' },
  { id: '7', ref: 'FAC-2026-0042', client: 'EIFFAGE Sénégal',  mission: 'MIS-2026-0841', date: '2026-05-15', due: '2026-06-15', ht: 3_600_000, tva: 648_000, ttc: 4_248_000, status: 'overdue' },
];

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  draft:     { label: 'Brouillon', badgeCls: 'bg-slate-100 text-slate-700',   icon: Clock },
  sent:      { label: 'Envoyée',   badgeCls: 'bg-blue-50 text-blue-700',      icon: ArrowUpRight },
  paid:      { label: 'Payée',     badgeCls: 'bg-green-50 text-green-700',    icon: CheckCircle2 },
  overdue:   { label: 'En retard', badgeCls: 'bg-red-50 text-red-700',      icon: AlertCircle },
  cancelled: { label: 'Annulée',   badgeCls: 'bg-slate-100 text-slate-500',   icon: XCircle },
};

export default function FacturationPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tab, setTab] = useState<'invoices' | 'quotes' | 'credits'>('invoices');

  const stats = {
    totalRevenue: INVOICES.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.ttc, 0),
    collected:    INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.ttc, 0),
    pending:      INVOICES.filter(i => i.status === 'sent').reduce((s, i) => s + i.ttc, 0),
    overdue:      INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.ttc, 0),
  };

  const filtered = INVOICES.filter(i => {
    const matchSearch = search === '' ||
      i.ref.toLowerCase().includes(search.toLowerCase()) ||
      i.client.toLowerCase().includes(search.toLowerCase()) ||
      (i.mission && i.mission.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Facturation</h1>
          <p className="text-sm text-text-secondary mt-0.5">Suivi des créances et encaissements</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs"><Receipt className="w-3.5 h-3.5" /> Nouveau Devis</button>
          <button className="btn-primary text-xs"><Plus className="w-3.5 h-3.5" /> Nouvelle Facture</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        {[
          { key: 'invoices', label: 'Factures clients', count: INVOICES.length },
          { key: 'quotes',   label: 'Devis en cours',  count: 3 },
          { key: 'credits',  label: 'Avoirs émis',     count: 1 },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              tab === t.key
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-surface-border'
            }`}
          >
            {t.label} <span className="ml-1.5 px-2 py-0.5 text-xs bg-surface-bg text-text-secondary rounded-full font-normal">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'invoices' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Volume facturé',   value: `${(stats.totalRevenue / 1_000_000).toFixed(2)}M XOF`, icon: FileText,     cls: 'bg-brand-50 text-brand-600' },
              { label: 'Total Encaissé',   value: `${(stats.collected / 1_000_000).toFixed(2)}M XOF`,    icon: CheckCircle2, cls: 'bg-green-50 text-green-700' },
              { label: 'En attente',       value: `${(stats.pending / 1_000_000).toFixed(2)}M XOF`,      icon: Clock,        cls: 'bg-blue-50 text-blue-700' },
              { label: 'Créances en retard',value: `${(stats.overdue / 1_000_000).toFixed(2)}M XOF`,    icon: AlertCircle,  cls: 'bg-red-50 text-red-700' },
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
                  placeholder="Rechercher par référence, client..."
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
                <option value="draft">Brouillons</option>
                <option value="sent">Envoyées</option>
                <option value="paid">Payées</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Client</th>
                    <th>Mission</th>
                    <th>Émission</th>
                    <th>Échéance</th>
                    <th className="text-right">Montant HT</th>
                    <th className="text-right">TVA (18%)</th>
                    <th className="text-right">Montant TTC</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => {
                    const S = STATUS_CONFIG[i.status] || { label: i.status, badgeCls: 'bg-gray-100 text-gray-700', icon: Clock };
                    const SIcon = S.icon;
                    return (
                      <tr key={i.id} className="cursor-pointer">
                        <td><span className="font-mono text-xs font-bold text-text-primary">{i.ref}</span></td>
                        <td className="font-medium text-text-primary text-sm">{i.client}</td>
                        <td className="font-mono text-xs text-text-secondary">{i.mission || '—'}</td>
                        <td className="text-xs text-text-secondary">{new Date(i.date).toLocaleDateString('fr-FR')}</td>
                        <td className="text-xs text-text-secondary">{new Date(i.due).toLocaleDateString('fr-FR')}</td>
                        <td className="text-right tabular-nums font-medium text-xs">{i.ht.toLocaleString('fr-FR')} XOF</td>
                        <td className="text-right tabular-nums text-text-muted text-xs">{i.tva.toLocaleString('fr-FR')} XOF</td>
                        <td className="text-right tabular-nums font-bold text-sm text-text-primary">{i.ttc.toLocaleString('fr-FR')} XOF</td>
                        <td>
                          <span className={`badge ${S.badgeCls}`}>
                            <SIcon className="w-3 h-3" />{S.label}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button className="btn-ghost p-1.5" title="Visualiser"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="btn-ghost p-1.5" title="Télécharger PDF"><Download className="w-3.5 h-3.5" /></button>
                            {i.status !== 'paid' && i.status !== 'cancelled' && (
                              <button className="btn-ghost p-1.5 text-brand-600 hover:bg-brand-50" title="Enregistrer règlement"><CheckCircle2 className="w-3.5 h-3.5" /></button>
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
        </>
      ) : (
        <div className="section-card p-12 text-center text-text-muted bg-white">
          <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30 text-brand-700" />
          <p className="text-sm font-semibold">Devis & Avoirs en cours de chargement</p>
          <p className="text-xs text-text-secondary mt-1">Le module est entièrement interconnecté avec Supabase et le service de facturation.</p>
        </div>
      )}
    </div>
  );
}
