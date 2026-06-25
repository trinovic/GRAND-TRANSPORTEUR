'use client';

import { useState } from 'react';
import { ArrowLeft, Download, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const TAX_DECLARATIONS = [
  { id: '1', name: 'Déclaration mensuelle de TVA (Juin 2026)', amount: 49_000_000, type: 'TVA', dueDate: '2026-07-15', status: 'pending' },
  { id: '2', name: 'Déclaration mensuelle de TVA (Mai 2026)', amount: 52_250_000, type: 'TVA', dueDate: '2026-06-15', status: 'completed' },
  { id: '3', name: 'Impôts sur les Sociétés (Acompte Q2 2026)', amount: 15_400_000, type: 'IS', dueDate: '2026-06-15', status: 'completed' },
  { id: '4', name: 'Contributions Sociales CNSS (T1 2026)', amount: 12_800_000, type: 'CNSS', dueDate: '2026-04-30', status: 'completed' },
  { id: '5', name: 'Taxe sur les Véhicules à Moteur (TVM 2026)', amount: 3_200_000, type: 'TVM', dueDate: '2026-03-31', status: 'completed' }
];

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  pending:   { label: 'À déclarer', badgeCls: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
  completed: { label: 'Déclaré & Payé', badgeCls: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 }
};

export default function DeclarationsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/fr/comptabilite" className="btn-secondary p-2 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Déclarations Fiscales & Sociales</h1>
            <p className="text-sm text-text-secondary mt-0.5">Suivi réglementaire des taxes et cotisations sociales</p>
          </div>
        </div>
      </div>

      {/* Declarations list */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><FileText className="w-4 h-4 text-brand-700" /> Déclarations de l'exercice 2026</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Intitulé de la déclaration</th>
                <th>Impôt / Taxe</th>
                <th className="text-right">Montant exigible</th>
                <th>Date d'échéance</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {TAX_DECLARATIONS.map(dec => {
                const S = STATUS_CONFIG[dec.status] || { label: dec.status, badgeCls: 'bg-slate-100 text-slate-700', icon: AlertCircle };
                const SIcon = S.icon;
                return (
                  <tr key={dec.id} className="hover:bg-surface-hover">
                    <td className="font-semibold text-text-primary text-sm py-4">{dec.name}</td>
                    <td>
                      <span className="badge bg-brand-50 text-brand-700 uppercase font-bold text-[10px]">
                        {dec.type}
                      </span>
                    </td>
                    <td className="text-right font-bold tabular-nums text-xs">{dec.amount.toLocaleString('fr-FR')} XOF</td>
                    <td className="text-xs text-text-secondary">{new Date(dec.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`badge border ${S.badgeCls}`}>
                        <SIcon className="w-3.5 h-3.5" />{S.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-secondary text-xs px-2.5 py-1" title="Télécharger justificatif"><Download className="w-3.5 h-3.5" /></button>
                        {dec.status === 'pending' && (
                          <button className="btn-primary text-xs px-2.5 py-1">Payer</button>
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
