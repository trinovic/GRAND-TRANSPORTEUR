'use client';

import { useState } from 'react';
import { BookOpen, Search, Download, Filter, ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

const GL_ACCOUNTS = [
  {
    code: '411000',
    name: 'Clients - SHELL Sénégal',
    entries: [
      { date: '2026-06-25', ref: 'VTE-00847', label: 'Facture N°F2026-0847', debit: 3_290_800, credit: 0 },
      { date: '2026-06-23', ref: 'BNQ-00156', label: 'Règlement SONACOS', debit: 0, credit: 2_418_000 }
    ],
    solde: 872_800,
    type: 'Débiteur'
  },
  {
    code: '706000',
    name: 'Prestations de services',
    entries: [
      { date: '2026-06-25', ref: 'VTE-00847', label: 'Facture N°F2026-0847', debit: 0, credit: 2_800_000 }
    ],
    solde: 2_800_000,
    type: 'Créditeur'
  },
  {
    code: '601000',
    name: 'Achats carburant',
    entries: [
      { date: '2026-06-24', ref: 'ACH-00312', label: 'Achat Carburant TOTAL', debit: 1_240_000, credit: 0 }
    ],
    solde: 1_240_000,
    type: 'Débiteur'
  }
];

export default function GrandLivrePage() {
  const [search, setSearch] = useState('');

  const filtered = GL_ACCOUNTS.filter(acc =>
    acc.code.includes(search) ||
    acc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/fr/comptabilite" className="btn-secondary p-2 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Grand Livre comptable</h1>
            <p className="text-sm text-text-secondary mt-0.5">Détail des écritures comptables par compte (SYSCOHADA)</p>
          </div>
        </div>
        <button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> Exporter PDF</button>
      </div>

      {/* Filter */}
      <div className="section-card p-4 flex gap-3 items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input pl-9"
            placeholder="Rechercher par code ou libellé de compte..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-6">
        {filtered.map(acc => (
          <div key={acc.code} className="section-card bg-white">
            <div className="px-6 py-4 bg-surface-bg border-b border-surface-border flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-brand-700 mr-2 bg-brand-50 px-2 py-0.5 rounded">{acc.code}</span>
                <span className="font-semibold text-text-primary">{acc.name}</span>
              </div>
              <div className="text-sm">
                <span className="text-text-secondary mr-2">Solde :</span>
                <span className={`font-bold ${acc.type === 'Débiteur' ? 'text-green-600' : 'text-brand-700'}`}>
                  {acc.solde.toLocaleString('fr-FR')} XOF ({acc.type})
                </span>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-32">Date</th>
                  <th className="w-36">Référence</th>
                  <th>Libellé écriture</th>
                  <th className="text-right w-44">Débit</th>
                  <th className="text-right w-44">Crédit</th>
                </tr>
              </thead>
              <tbody>
                {acc.entries.map((e, idx) => (
                  <tr key={idx}>
                    <td className="text-xs text-text-secondary">{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                    <td className="font-mono text-xs font-semibold text-text-secondary">{e.ref}</td>
                    <td className="text-sm">{e.label}</td>
                    <td className="text-right tabular-nums text-text-primary text-xs">{e.debit > 0 ? `${e.debit.toLocaleString('fr-FR')} XOF` : '—'}</td>
                    <td className="text-right tabular-nums text-text-primary text-xs">{e.credit > 0 ? `${e.credit.toLocaleString('fr-FR')} XOF` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
