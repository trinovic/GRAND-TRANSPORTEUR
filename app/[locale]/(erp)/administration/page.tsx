'use client';

import { useState } from 'react';
import {
  Settings, Plus, Search, Eye, Edit, Shield, Check, X,
  Lock, Key, Users, UserCheck, AlertTriangle
} from 'lucide-react';

const USERS_LIST = [
  { id: '1', name: 'Directeur Général', email: 'dg@demo.com', role: 'dg', active: true, mfa: true },
  { id: '2', name: 'Fatoumata Bah', email: 'f.bah@lgt.sn', role: 'daf', active: true, mfa: true },
  { id: '3', name: 'Aminata Fall', email: 'a.fall@lgt.sn', role: 'comptable', active: true, mfa: true },
  { id: '4', name: 'Moussa Traoré', email: 'm.traore@lgt.sn', role: 'chauffeur', active: true, mfa: false },
  { id: '5', name: 'Mamadou Ndiaye', email: 'm.ndiaye@lgt.sn', role: 'rh', active: true, mfa: true },
];

const ROLES_PERMISSIONS = [
  { role: 'pca', name: 'PCA', db: true, comp: true, fact: true, fleet: true, miss: true, hr: true, bi: true },
  { role: 'dg', name: 'Directeur Général', db: true, comp: true, fact: true, fleet: true, miss: true, hr: true, bi: true },
  { role: 'daf', name: 'DAF', db: true, comp: true, fact: true, fleet: false, miss: false, hr: false, bi: true },
  { role: 'comptable', name: 'Comptable', db: true, comp: true, fact: true, fleet: false, miss: false, hr: false, bi: false },
  { role: 'rh', name: 'RH', db: false, comp: false, fact: false, fleet: false, miss: false, hr: true, bi: false },
  { role: 'logistique', name: 'Logistique', db: true, comp: false, fact: false, fleet: true, miss: true, hr: false, bi: false },
  { role: 'chauffeur', name: 'Chauffeur', db: false, comp: false, fact: false, fleet: false, miss: true, hr: false, bi: false },
];

export default function AdminPage() {
  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [search, setSearch] = useState('');

  const filteredUsers = USERS_LIST.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-700" /> Administration RBAC
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">Contrôle des accès, rôles utilisateurs et double authentification (MFA)</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> Créer un utilisateur
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        <button
          onClick={() => setTab('users')}
          className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
            tab === 'users'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-surface-border'
          }`}
        >
          Utilisateurs ERP
        </button>
        <button
          onClick={() => setTab('roles')}
          className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
            tab === 'roles'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-surface-border'
          }`}
        >
          Matrice Rôles & Permissions
        </button>
      </div>

      {tab === 'users' ? (
        <div className="section-card">
          <div className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                className="input pl-9"
                placeholder="Rechercher un utilisateur..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom complet</th>
                  <th>E-mail</th>
                  <th>Rôle attribué</th>
                  <th>Statut accès</th>
                  <th>Double Auth (MFA)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="cursor-pointer">
                    <td className="font-semibold text-text-primary text-sm">{u.name}</td>
                    <td className="text-xs text-text-secondary font-mono">{u.email}</td>
                    <td>
                      <span className="badge bg-brand-50 text-brand-700 uppercase text-[10px] font-bold">
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.active ? (
                        <span className="badge bg-green-50 text-green-700">Actif</span>
                      ) : (
                        <span className="badge bg-red-50 text-red-700">Inactif</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {u.mfa ? (
                          <span className="badge bg-green-50 text-green-700 flex items-center gap-1"><Lock className="w-3 h-3" /> Activée</span>
                        ) : (
                          <span className="badge bg-amber-50 text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3 animate-pulse-soft" /> Non configurée</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" title="Modifier rôles"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="btn-ghost p-1.5 text-brand-700 hover:bg-brand-50" title="Réinitialiser clés securité"><Key className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="section-card">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fonction / Rôle</th>
                  <th className="text-center">Dashboard</th>
                  <th className="text-center">Comptabilité</th>
                  <th className="text-center">Facturation</th>
                  <th className="text-center">Flotte</th>
                  <th className="text-center">Missions</th>
                  <th className="text-center">RH / Paie</th>
                  <th className="text-center">BI / IA</th>
                </tr>
              </thead>
              <tbody>
                {ROLES_PERMISSIONS.map(rp => (
                  <tr key={rp.role}>
                    <td className="font-semibold text-text-primary text-sm">{rp.name} <span className="text-[10px] text-text-muted font-mono">({rp.role})</span></td>
                    <td className="text-center">{rp.db ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}</td>
                    <td className="text-center">{rp.comp ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}</td>
                    <td className="text-center">{rp.fact ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}</td>
                    <td className="text-center">{rp.fleet ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}</td>
                    <td className="text-center">{rp.miss ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}</td>
                    <td className="text-center">{rp.hr ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}</td>
                    <td className="text-center">{rp.bi ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
