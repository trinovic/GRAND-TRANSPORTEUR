'use client';

import { useState } from 'react';
import {
  FolderOpen, Plus, Search, Filter, Eye, Download, FileText,
  FileCheck, Shield, Clock, ChevronRight, HardDrive, Trash2
} from 'lucide-react';

const DOCUMENTS = [
  { id: '1', name: 'Contrat_CDI_Ibrahima_Diallo.pdf', size: '1.2 MB', category: 'Contrats', date: '2026-06-20', owner: 'Mamadou Ndiaye' },
  { id: '2', name: 'Attestation_Assurance_TN-4821-AB.pdf', size: '4.8 MB', category: 'Assurances', date: '2026-06-18', owner: 'Cheikh Fall' },
  { id: '3', name: 'Carte_Grise_TN-3356-CD.pdf', size: '2.1 MB', category: 'Cartes grises', date: '2026-06-15', owner: 'Oumar Seck' },
  { id: '4', name: 'Facture_F2026-0847_SHELL.pdf', size: '345 KB', category: 'Factures', date: '2026-06-25', owner: 'Aminata Fall' },
  { id: '5', name: 'Bulletin_Paie_Juin_Oumar_Seck.pdf', size: '620 KB', category: 'Bulletins de paie', date: '2026-06-24', owner: 'Mamadou Ndiaye' },
];

const CATEGORIES = [
  { name: 'Tous', count: DOCUMENTS.length },
  { name: 'Contrats', count: 1 },
  { name: 'Assurances', count: 1 },
  { name: 'Cartes grises', count: 1 },
  { name: 'Factures', count: 1 },
  { name: 'Bulletins de paie', count: 1 },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Tous');

  const filtered = DOCUMENTS.filter(d => {
    const matchSearch = search === '' || d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Tous' || d.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-brand-700" /> Gestion documentaire
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">Coffre-fort numérique sécurisé pour les documents de la société</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> Importer un document
        </button>
      </div>

      {/* Categories & Storage Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 section-card p-4 flex flex-wrap gap-2 items-center bg-white">
          {CATEGORIES.map(c => (
            <button
              key={c.name}
              onClick={() => setCatFilter(c.name)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                catFilter === c.name
                  ? 'bg-brand-700 text-white border-brand-700'
                  : 'bg-white text-text-secondary border-surface-border hover:border-brand-200'
              }`}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>
        <div className="kpi-card flex items-center gap-4 bg-white">
          <div className="w-10 h-10 bg-brand-50 text-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Espace Utilisé</p>
            <p className="text-lg font-bold text-text-primary mt-0.5">8.9 MB / 10 GB</p>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="section-card">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-9"
              placeholder="Rechercher par nom de fichier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom du fichier</th>
                <th>Taille</th>
                <th>Catégorie</th>
                <th>Date d'ajout</th>
                <th>Dépositaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="cursor-pointer">
                  <td className="font-semibold text-text-primary text-sm flex items-center gap-2 py-4">
                    <FileText className="w-4 h-4 text-brand-700" />
                    <span>{d.name}</span>
                  </td>
                  <td className="text-xs text-text-secondary font-mono">{d.size}</td>
                  <td>
                    <span className="badge bg-brand-50 text-brand-700">
                      {d.category}
                    </span>
                  </td>
                  <td className="text-xs text-text-secondary">{new Date(d.date).toLocaleDateString('fr-FR')}</td>
                  <td className="text-xs font-medium text-text-primary">{d.owner}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost p-1.5" title="Consulter"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="btn-ghost p-1.5" title="Télécharger"><Download className="w-3.5 h-3.5" /></button>
                      <button className="btn-ghost p-1.5 text-danger hover:bg-danger-light" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
