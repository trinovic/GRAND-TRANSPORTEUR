'use client';

import { useState } from 'react';
import {
  BookOpen, ChevronRight, TrendingUp, TrendingDown,
  DollarSign, FileText, BarChart2, Download, Filter,
  Plus, Search, CheckCircle, Clock, AlertCircle,
  X, Save, Loader2, Check
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

const JOURNAL_ENTRIES = [
  { id: '1', date: '2026-06-25', ref: 'VTE-00847', account: '411000', acctName: 'Clients - SHELL Sénégal',   label: 'Fact. N°F2026-0847',  debit: 3_290_800, credit: 0,         journal: 'Ventes',   auto: true },
  { id: '2', date: '2026-06-25', ref: 'VTE-00847', account: '706000', acctName: 'Prestations de services',  label: 'Fact. N°F2026-0847',  debit: 0,         credit: 2_800_000, journal: 'Ventes',   auto: true },
  { id: '3', date: '2026-06-25', ref: 'VTE-00847', account: '443100', acctName: 'TVA collectée',            label: 'TVA 18% - F2026-0847', debit: 0,         credit: 490_800,   journal: 'Ventes',   auto: true },
  { id: '4', date: '2026-06-24', ref: 'ACH-00312', account: '601000', acctName: 'Achats carburant',         label: 'Carburant - TOTAL',    debit: 1_240_000, credit: 0,         journal: 'Achats',   auto: false },
  { id: '5', date: '2026-06-24', ref: 'ACH-00312', account: '445600', acctName: 'TVA déductible',          label: 'TVA - TOTAL carburant', debit: 223_200,  credit: 0,         journal: 'Achats',   auto: false },
  { id: '6', date: '2026-06-24', ref: 'ACH-00312', account: '401000', acctName: 'Fournisseurs - TOTAL',    label: 'Carburant - TOTAL',    debit: 0,         credit: 1_463_200, journal: 'Achats',   auto: false },
  { id: '7', date: '2026-06-23', ref: 'BNQ-00156', account: '512000', acctName: 'Banque CBAO',             label: 'Règlement SONACOS',    debit: 2_418_000, credit: 0,         journal: 'Banque',   auto: false },
  { id: '8', date: '2026-06-23', ref: 'BNQ-00156', account: '411000', acctName: 'Clients - SONACOS',       label: 'Règlement SONACOS',    debit: 0,         credit: 2_418_000, journal: 'Banque',   auto: false },
];

const ACCOUNT_BALANCES = [
  { code: '101', name: 'Capital social',          debit: 0,           credit: 500_000_000, solde: -500_000_000, type: 'Passif' },
  { code: '411', name: 'Clients',                 debit: 284_600_000, credit: 246_200_000, solde: 38_400_000,   type: 'Actif' },
  { code: '401', name: 'Fournisseurs',            debit: 65_800_000,  credit: 77_900_000,  solde: -12_100_000,  type: 'Passif' },
  { code: '512', name: 'Banque',                  debit: 412_300_000, credit: 228_100_000, solde: 184_200_000,  type: 'Actif' },
  { code: '601', name: 'Achats carburant',        debit: 128_400_000, credit: 0,           solde: 128_400_000,  type: 'Charge' },
  { code: '615', name: 'Maintenance véhicules',   debit: 42_600_000,  credit: 0,           solde: 42_600_000,   type: 'Charge' },
  { code: '631', name: 'Charges de personnel',    debit: 98_200_000,  credit: 0,           solde: 98_200_000,   type: 'Charge' },
  { code: '706', name: 'Prestations de services', debit: 0,           credit: 392_500_000, solde: -392_500_000, type: 'Produit' },
  { code: '443', name: 'TVA collectée',           debit: 18_400_000,  credit: 70_650_000,  solde: -52_250_000,  type: 'Passif' },
];

const bilanActif = [
  { label: 'Immobilisations', value: 680_000_000 },
  { label: 'Clients', value: 38_400_000 },
  { label: 'Trésorerie', value: 184_200_000 },
  { label: 'Autres actifs', value: 22_000_000 },
];
const bilanPassif = [
  { label: 'Capital', value: 500_000_000 },
  { label: 'Résultat', value: 265_000_000 },
  { label: 'Fournisseurs', value: 12_100_000 },
  { label: 'TVA à payer', value: 52_250_000 },
  { label: 'Autres', value: 95_250_000 },
];

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.abs(n));
}

const JOURNAL_COLORS: Record<string, string> = {
  Ventes: 'bg-blue-50 text-blue-700',
  Achats: 'bg-amber-50 text-amber-700',
  Banque: 'bg-emerald-50 text-emerald-700',
  Caisse: 'bg-purple-50 text-purple-700',
};

const exportCSV = (entries: typeof JOURNAL_ENTRIES) => {
  const header = ['Date', 'Ref', 'Compte', 'Intitule', 'Libelle', 'Debit', 'Credit', 'Journal'].join(';');
  const rows = entries.map(e => [
    e.date, e.ref, e.account, e.acctName, e.label, e.debit, e.credit, e.journal
  ].join(';'));
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'journal_ecritures.csv'; a.click();
  URL.revokeObjectURL(url);
};

export default function ComptabilitePage() {
  const [activeTab, setActiveTab] = useState<'journal' | 'balance' | 'bilan'>('journal');
  const [journalFilter, setJournalFilter] = useState('all');
  const [showEcritureModal, setShowEcritureModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState(JOURNAL_ENTRIES);
  const [ecritureForm, setEcritureForm] = useState({
    date: new Date().toISOString().split('T')[0],
    account: '', acctName: '', label: '',
    debit: 0, credit: 0, journal: 'Ventes'
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSaveEcriture = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const newEntry = {
        id: String(Date.now()),
        ref: `MAN-${Math.floor(1000 + Math.random() * 9000)}`,
        ...ecritureForm,
        auto: false
      };
      setJournalEntries(prev => [newEntry, ...prev]);
      setIsSaving(false);
      setShowEcritureModal(false);
      showToast('Ecriture comptable enregistrée avec succès.');
    }, 600);
  };

  const filteredEntries = journalEntries.filter(e =>
    journalFilter === 'all' || e.journal === journalFilter
  );

  const totalDebit  = filteredEntries.reduce((s, e) => s + e.debit,  0);
  const totalCredit = filteredEntries.reduce((s, e) => s + e.credit, 0);

  const TABS = [
    { key: 'journal', label: 'Journal des écritures', icon: FileText },
    { key: 'balance', label: 'Balance générale',       icon: BarChart2 },
    { key: 'bilan',   label: 'Bilan',                  icon: BookOpen },
  ];

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2 bg-green-600">
          <Check className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Comptabilité</h1>
          <p className="text-sm text-text-secondary mt-0.5">Exercice 2026 · Plan comptable SYSCOHADA</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(filteredEntries)} className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> Exporter CSV</button>
          <button onClick={() => setShowEcritureModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5" /> Nouvelle écriture</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total produits', value: '392,5M XOF', icon: TrendingUp,   cls: 'text-success bg-success-light', border: 'border-l-success' },
          { label: 'Total charges',  value: '269,2M XOF', icon: TrendingDown, cls: 'text-warning bg-warning-light', border: 'border-l-warning' },
          { label: 'Résultat net',   value: '123,3M XOF', icon: DollarSign,   cls: 'text-brand-600 bg-brand-50',    border: 'border-l-brand-600' },
          { label: 'TVA à payer',    value: '52,3M XOF',  icon: AlertCircle,  cls: 'text-danger bg-danger-light',   border: 'border-l-danger' },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={`kpi-card border-l-4 ${k.border}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{k.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.cls}`}><Icon className="w-4 h-4" /></div>
              </div>
              <p className="text-xl font-bold text-text-primary">{k.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-bg border border-surface-border rounded-lg p-1 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}>
              <Icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Journal */}
      {activeTab === 'journal' && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="text-sm font-semibold text-text-primary">Journal des écritures</h2>
            <div className="flex gap-2">
              {['all', 'Ventes', 'Achats', 'Banque'].map(j => (
                <button key={j} onClick={() => setJournalFilter(j)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    journalFilter === j ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-text-secondary border-surface-border'
                  }`}>
                  {j === 'all' ? 'Tous' : j}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th><th>Réf.</th><th>Compte</th><th>Intitulé</th>
                  <th>Libellé</th><th>Débit</th><th>Crédit</th><th>Journal</th><th>Auto</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(e => (
                  <tr key={e.id} className="cursor-pointer">
                    <td className="text-xs text-text-secondary">{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                    <td><span className="font-mono text-xs text-brand-700">{e.ref}</span></td>
                    <td><span className="font-mono text-xs font-semibold">{e.account}</span></td>
                    <td className="text-xs max-w-[160px] truncate">{e.acctName}</td>
                    <td className="text-xs text-text-secondary">{e.label}</td>
                    <td className={`text-right tabular-nums font-medium text-sm ${e.debit > 0 ? 'text-brand-700' : 'text-text-muted'}`}>
                      {e.debit > 0 ? fmt(e.debit) : ''}
                    </td>
                    <td className={`text-right tabular-nums font-medium text-sm ${e.credit > 0 ? 'text-success' : 'text-text-muted'}`}>
                      {e.credit > 0 ? fmt(e.credit) : ''}
                    </td>
                    <td><span className={`badge ${JOURNAL_COLORS[e.journal] || 'badge-gray'}`}>{e.journal}</span></td>
                    <td>
                      {e.auto
                        ? <span className="badge badge-info"><CheckCircle className="w-3 h-3" />Auto</span>
                        : <span className="badge badge-gray">Manuel</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-bg font-bold">
                  <td colSpan={5} className="px-4 py-3 text-sm font-semibold">Totaux</td>
                  <td className="px-4 py-3 text-right tabular-nums text-brand-700">{fmt(totalDebit)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-success">{fmt(totalCredit)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Balance */}
      {activeTab === 'balance' && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="text-sm font-semibold text-text-primary">Balance générale — Juin 2026</h2>
            <button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> PDF</button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Compte</th><th>Intitulé</th><th>Type</th>
                  <th className="text-right">Mouv. Débit</th>
                  <th className="text-right">Mouv. Crédit</th>
                  <th className="text-right">Solde Débiteur</th>
                  <th className="text-right">Solde Créditeur</th>
                </tr>
              </thead>
              <tbody>
                {ACCOUNT_BALANCES.map(a => (
                  <tr key={a.code}>
                    <td><span className="font-mono font-semibold text-brand-700">{a.code}</span></td>
                    <td className="font-medium">{a.name}</td>
                    <td><span className={`badge ${
                      a.type === 'Actif' ? 'badge-info' : a.type === 'Passif' ? 'badge-gray' :
                      a.type === 'Charge' ? 'badge-warning' : 'badge-success'
                    }`}>{a.type}</span></td>
                    <td className="text-right tabular-nums text-sm">{fmt(a.debit)}</td>
                    <td className="text-right tabular-nums text-sm">{fmt(a.credit)}</td>
                    <td className="text-right tabular-nums font-semibold text-brand-700">{a.solde > 0 ? fmt(a.solde) : ''}</td>
                    <td className="text-right tabular-nums font-semibold text-success">{a.solde < 0 ? fmt(a.solde) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bilan */}
      {activeTab === 'bilan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { title: 'ACTIF', items: bilanActif,  color: '#2563EB', total: bilanActif.reduce((s,i) => s+i.value, 0) },
            { title: 'PASSIF', items: bilanPassif, color: '#10B981', total: bilanPassif.reduce((s,i) => s+i.value, 0) },
          ].map(side => (
            <div key={side.title} className="section-card">
              <div className="section-header">
                <h2 className="text-sm font-bold text-text-primary">BILAN — {side.title}</h2>
                <span className="text-sm font-bold text-text-primary">{fmt(side.total)} XOF</span>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={side.items} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `${(v/1_000_000).toFixed(0)}M`} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={130} />
                    <Tooltip formatter={(v: number) => [`${fmt(v)} XOF`]} contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="value" fill={side.color} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4 border-t border-surface-border pt-4">
                  {side.items.map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="font-semibold tabular-nums text-text-primary">{fmt(item.value)} XOF</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm font-bold border-t border-surface-border pt-2 mt-2">
                    <span className="text-text-primary">TOTAL {side.title}</span>
                    <span className="text-text-primary">{fmt(side.total)} XOF</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Nouvelle écriture modal */}
      {showEcritureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-700" /> Saisir une écriture comptable
              </h3>
              <button onClick={() => setShowEcritureModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEcriture} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input type="date" required className="input" value={ecritureForm.date}
                    onChange={e => setEcritureForm({ ...ecritureForm, date: e.target.value })} />
                </div>
                <div>
                  <label className="label">Journal *</label>
                  <select required className="input" value={ecritureForm.journal}
                    onChange={e => setEcritureForm({ ...ecritureForm, journal: e.target.value })}>
                    <option>Ventes</option>
                    <option>Achats</option>
                    <option>Banque</option>
                    <option>Caisse</option>
                  </select>
                </div>
                <div>
                  <label className="label">N° de compte *</label>
                  <input type="text" required placeholder="411000" className="input font-mono"
                    value={ecritureForm.account}
                    onChange={e => setEcritureForm({ ...ecritureForm, account: e.target.value })} />
                </div>
                <div>
                  <label className="label">Intitulé du compte *</label>
                  <input type="text" required placeholder="Clients - SONACOS" className="input"
                    value={ecritureForm.acctName}
                    onChange={e => setEcritureForm({ ...ecritureForm, acctName: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label">Libellé de l'écriture *</label>
                  <input type="text" required placeholder="Facture N°FAC-2026-..." className="input"
                    value={ecritureForm.label}
                    onChange={e => setEcritureForm({ ...ecritureForm, label: e.target.value })} />
                </div>
                <div>
                  <label className="label">Débit (XOF)</label>
                  <input type="number" min={0} className="input font-semibold"
                    value={ecritureForm.debit}
                    onChange={e => setEcritureForm({ ...ecritureForm, debit: Number(e.target.value), credit: 0 })} />
                </div>
                <div>
                  <label className="label">Crédit (XOF)</label>
                  <input type="number" min={0} className="input font-semibold"
                    value={ecritureForm.credit}
                    onChange={e => setEcritureForm({ ...ecritureForm, credit: Number(e.target.value), debit: 0 })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button type="button" onClick={() => setShowEcritureModal(false)} className="btn-ghost" disabled={isSaving}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</span>
                    : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Valider l'écriture</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
