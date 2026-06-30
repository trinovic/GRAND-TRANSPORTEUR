'use client';

import { useState } from 'react';
import {
  Settings, Plus, Search, Edit, Shield, Check, X,
  Lock, Key, Users, UserCheck, AlertTriangle, Loader2,
  Eye, EyeOff, Save, UserPlus
} from 'lucide-react';

const USERS_LIST_INITIAL = [
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

const ROLE_OPTIONS = ['dg', 'daf', 'comptable', 'rh', 'logistique', 'chauffeur', 'pca'];

const ROLE_LABELS: Record<string, string> = {
  pca: 'PCA', dg: 'Directeur Général', daf: 'DAF',
  comptable: 'Comptable', rh: 'RH',
  logistique: 'Logistique', chauffeur: 'Chauffeur',
};

const initialUserForm = { name: '', email: '', role: 'comptable', active: true, mfa: false };

export default function AdminPage() {
  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(USERS_LIST_INITIAL);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState(initialUserForm);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(initialUserForm);
    setPassword('');
    setShowModal(true);
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, active: u.active, mfa: u.mfa });
    setPassword('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (editingUser) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        showToast(`Utilisateur "${formData.name}" mis à jour.`);
      } else {
        const newUser = { id: String(Date.now()), ...formData };
        setUsers(prev => [...prev, newUser]);
        showToast(`Compte "${formData.name}" créé avec succès.`);
      }
      setIsSaving(false);
      closeModal();
    }, 600);
  };

  const handleResetKey = (u: any) => {
    showToast(`Lien de réinitialisation envoyé à ${u.email}`, 'info');
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-brand-700'}`}>
          <Check className="w-4 h-4" /> {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-700" /> Administration RBAC
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">Contrôle des accès, rôles utilisateurs et double authentification (MFA)</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <UserPlus className="w-4 h-4" /> Créer un utilisateur
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
          Utilisateurs ERP <span className="ml-1.5 px-2 py-0.5 text-xs bg-surface-bg text-text-secondary rounded-full">{users.length}</span>
        </button>
        <button
          onClick={() => setTab('roles')}
          className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
            tab === 'roles'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-surface-border'
          }`}
        >
          Matrice Rôles &amp; Permissions
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
                  <tr key={u.id} className="hover:bg-surface-hover/30 transition-all">
                    <td className="font-semibold text-text-primary text-sm">{u.name}</td>
                    <td className="text-xs text-text-secondary font-mono">{u.email}</td>
                    <td>
                      <span className="badge bg-brand-50 text-brand-700 uppercase text-[10px] font-bold">
                        {ROLE_LABELS[u.role] || u.role}
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
                        <button onClick={() => openEditModal(u)} className="btn-ghost p-1.5" title="Modifier l'utilisateur">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleResetKey(u)} className="btn-ghost p-1.5 text-brand-700 hover:bg-brand-50" title="Envoyer lien réinitialisation">
                          <Key className="w-3.5 h-3.5" />
                        </button>
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

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-700" />
                {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
              </h3>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Nom complet *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Mamadou Traoré"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Adresse e-mail *</label>
                  <input
                    type="email"
                    required
                    className="input"
                    placeholder="m.traore@lgt.sn"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Rôle *</label>
                  <select
                    required
                    className="input"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                    ))}
                  </select>
                </div>
                {!editingUser && (
                  <div>
                    <label className="label">Mot de passe provisoire *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!editingUser}
                        className="input pr-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-brand-600 border-surface-border"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span className="text-sm text-text-primary font-medium">Compte actif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-brand-600 border-surface-border"
                    checked={formData.mfa}
                    onChange={e => setFormData({ ...formData, mfa: e.target.checked })}
                  />
                  <span className="text-sm text-text-primary font-medium">Activer MFA</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button type="button" onClick={closeModal} className="btn-ghost" disabled={isSaving}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Save className="w-4 h-4" /> {editingUser ? 'Mettre à jour' : 'Créer le compte'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
