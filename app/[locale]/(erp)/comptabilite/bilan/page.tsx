'use client';

import { useState } from 'react';
import { ArrowLeft, Download, RefreshCw, BarChart2 } from 'lucide-react';
import Link from 'next/link';

const ASSETS = [
  { category: 'Actif Immobilisé', items: [
    { code: '210000', name: 'Immobilisations corporelles (Véhicules)', value: 680_000_000 },
    { code: '240000', name: 'Matériel informatique et bureau', value: 22_000_000 },
  ], total: 702_000_000 },
  { category: 'Actif Circulant', items: [
    { code: '411000', name: 'Créances clients', value: 38_400_000 },
    { code: '445000', name: 'État - TVA déductible', value: 3_250_000 },
  ], total: 41_650_000 },
  { category: 'Trésorerie Actif', items: [
    { code: '512000', name: 'Banque CBAO', value: 184_200_000 },
  ], total: 184_200_000 }
];

const LIABILITIES = [
  { category: 'Capitaux Propres', items: [
    { code: '101000', name: 'Capital social', value: 500_000_000 },
    { code: '130000', name: 'Résultat net de l\'exercice', value: 265_000_000 },
  ], total: 765_000_000 },
  { category: 'Dettes & Passif Circulant', items: [
    { code: '401000', name: 'Dettes fournisseurs', value: 12_100_000 },
    { code: '443100', name: 'État - TVA collectée', value: 52_250_000 },
    { code: '420000', name: 'Personnel - Rémunérations dues', value: 98_500_000 },
  ], total: 162_850_000 }
];

export default function BilanPage() {
  const totalAssets = ASSETS.reduce((sum, cat) => sum + cat.total, 0);
  const totalLiabilities = LIABILITIES.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/fr/comptabilite" className="btn-secondary p-2 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Bilan Financier</h1>
            <p className="text-sm text-text-secondary mt-0.5">Bilan comptable annuel SYSCOHADA synthétisé</p>
          </div>
        </div>
        <button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> Exporter PDF</button>
      </div>

      {/* Grid Layout Actif vs Passif */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIF */}
        <div className="space-y-6">
          <div className="section-card">
            <div className="section-header bg-slate-50">
              <h2 className="text-sm font-bold text-text-primary">ACTIF (Emplois)</h2>
              <span className="text-xs font-semibold text-text-secondary">Exercice 2026</span>
            </div>
            <div className="p-4 space-y-6">
              {ASSETS.map(cat => (
                <div key={cat.category} className="space-y-2">
                  <h3 className="text-xs font-bold text-brand-700 uppercase tracking-wider">{cat.category}</h3>
                  <div className="border border-surface-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <tbody>
                        {cat.items.map(item => (
                          <tr key={item.code} className="border-b border-surface-border last:border-0 hover:bg-surface-bg">
                            <td className="px-4 py-2.5 font-mono text-text-muted">{item.code}</td>
                            <td className="px-4 py-2.5 font-medium text-text-primary">{item.name}</td>
                            <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{item.value.toLocaleString('fr-FR')} XOF</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50/50 font-bold border-t border-surface-border">
                          <td colSpan={2} className="px-4 py-2.5 text-text-primary">Sous-total {cat.category}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{cat.total.toLocaleString('fr-FR')} XOF</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-brand-700 text-white flex justify-between items-center rounded-b-xl">
              <span className="font-bold text-sm uppercase">TOTAL ACTIF GENERALE</span>
              <span className="font-extrabold text-lg tabular-nums">{totalAssets.toLocaleString('fr-FR')} XOF</span>
            </div>
          </div>
        </div>

        {/* PASSIF */}
        <div className="space-y-6">
          <div className="section-card">
            <div className="section-header bg-slate-50">
              <h2 className="text-sm font-bold text-text-primary">PASSIF (Ressources)</h2>
              <span className="text-xs font-semibold text-text-secondary">Exercice 2026</span>
            </div>
            <div className="p-4 space-y-6">
              {LIABILITIES.map(cat => (
                <div key={cat.category} className="space-y-2">
                  <h3 className="text-xs font-bold text-brand-700 uppercase tracking-wider">{cat.category}</h3>
                  <div className="border border-surface-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <tbody>
                        {cat.items.map(item => (
                          <tr key={item.code} className="border-b border-surface-border last:border-0 hover:bg-surface-bg">
                            <td className="px-4 py-2.5 font-mono text-text-muted">{item.code}</td>
                            <td className="px-4 py-2.5 font-medium text-text-primary">{item.name}</td>
                            <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{item.value.toLocaleString('fr-FR')} XOF</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50/50 font-bold border-t border-surface-border">
                          <td colSpan={2} className="px-4 py-2.5 text-text-primary">Sous-total {cat.category}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{cat.total.toLocaleString('fr-FR')} XOF</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-brand-800 text-white flex justify-between items-center rounded-b-xl">
              <span className="font-bold text-sm uppercase">TOTAL PASSIF GENERALE</span>
              <span className="font-extrabold text-lg tabular-nums">{totalLiabilities.toLocaleString('fr-FR')} XOF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
