'use client';

import { useState } from 'react';
import { Search, Download, ArrowLeft, BarChart2 } from 'lucide-react';
import Link from 'next/link';

const BALANCE_ACCOUNTS = [
  { code: '101000', name: 'Capital social', debitMvt: 0, creditMvt: 500_000_000, debitSolde: 0, creditSolde: 500_000_000 },
  { code: '401000', name: 'Fournisseurs', debitMvt: 65_800_000, creditMvt: 77_900_000, debitSolde: 0, creditSolde: 12_100_000 },
  { code: '411000', name: 'Clients', debitMvt: 284_600_000, creditMvt: 246_200_000, debitSolde: 38_400_000, creditSolde: 0 },
  { code: '443100', name: 'TVA collectée', debitMvt: 18_400_000, creditMvt: 70_650_000, debitSolde: 0, creditSolde: 52_250_000 },
  { code: '512000', name: 'Banque CBAO', debitMvt: 412_300_000, creditMvt: 228_100_000, debitSolde: 184_200_000, creditSolde: 0 },
  { code: '601000', name: 'Achats carburant', debitMvt: 128_400_000, creditMvt: 0, debitSolde: 128_400_000, creditSolde: 0 },
  { code: '615000', name: 'Maintenance véhicules', debitMvt: 42_600_000, creditMvt: 0, debitSolde: 42_600_000, creditSolde: 0 },
  { code: '706000', name: 'Prestations de services', debitMvt: 0, creditMvt: 392_500_000, debitSolde: 0, creditSolde: 392_500_000 },
];

export default function BalancePage() {
  const [search, setSearch] = useState('');

  const filtered = BALANCE_ACCOUNTS.filter(acc =>
    acc.code.includes(search) ||
    acc.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalDebits = BALANCE_ACCOUNTS.reduce((sum, item) => sum + item.debitMvt, 0);
  const totalCredits = BALANCE_ACCOUNTS.reduce((sum, item) => sum + item.creditMvt, 0);
  const totalDebitSoldes = BALANCE_ACCOUNTS.reduce((sum, item) => sum + item.debitSolde, 0);
  const totalCreditSoldes = BALANCE_ACCOUNTS.reduce((sum, item) => sum + item.creditSolde, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/fr/comptabilite" className="btn-secondary p-2 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Balance Générale</h1>
            <p className="text-sm text-text-secondary mt-0.5">Vérification de la balance des comptes (SYSCOHADA)</p>
          </div>
        </div>
        <button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> Exporter Excel</button>
      </div>

      {/* Filter */}
      <div className="section-card p-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input pl-9"
            placeholder="Rechercher par code ou libellé..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Balance Table */}
      <div className="section-card">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th rowSpan={2} className="align-middle">Numéro de compte</th>
                <th rowSpan={2} className="align-middle">Intitulé du compte</th>
                <th colSpan={2} className="text-center border-b border-surface-border">Mouvements de la période</th>
                <th colSpan={2} className="text-center border-b border-surface-border">Soldes de fin</th>
              </tr>
              <tr>
                <th className="text-right">Débit</th>
                <th className="text-right">Crédit</th>
                <th className="text-right">Débiteur</th>
                <th className="text-right">Créditeur</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(acc => (
                <tr key={acc.code} className="hover:bg-surface-hover">
                  <td className="font-mono text-xs font-bold text-text-primary">{acc.code}</td>
                  <td className="text-sm text-text-primary">{acc.name}</td>
                  <td className="text-right tabular-nums text-xs text-text-secondary">{acc.debitMvt > 0 ? acc.debitMvt.toLocaleString('fr-FR') : '—'}</td>
                  <td className="text-right tabular-nums text-xs text-text-secondary">{acc.creditMvt > 0 ? acc.creditMvt.toLocaleString('fr-FR') : '—'}</td>
                  <td className="text-right tabular-nums text-xs font-semibold text-green-600">{acc.debitSolde > 0 ? acc.debitSolde.toLocaleString('fr-FR') : '—'}</td>
                  <td className="text-right tabular-nums text-xs font-semibold text-brand-700">{acc.creditSolde > 0 ? acc.creditSolde.toLocaleString('fr-FR') : '—'}</td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="font-bold bg-surface-bg border-t-2 border-surface-border">
                <td colSpan={2} className="text-left py-4">TOTAUX GENERAUX</td>
                <td className="text-right tabular-nums text-xs">{totalDebits.toLocaleString('fr-FR')} XOF</td>
                <td className="text-right tabular-nums text-xs">{totalCredits.toLocaleString('fr-FR')} XOF</td>
                <td className="text-right tabular-nums text-xs text-green-600">{totalDebitSoldes.toLocaleString('fr-FR')} XOF</td>
                <td className="text-right tabular-nums text-xs text-brand-700">{totalCreditSoldes.toLocaleString('fr-FR')} XOF</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
