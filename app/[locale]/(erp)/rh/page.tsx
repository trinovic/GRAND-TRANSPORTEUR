'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users, Plus, Search, Eye, Edit, Trash2, UserCheck, UserX,
  Phone, Mail, Calendar, DollarSign, FileText,
  Building2, Award, Clock, X, Loader2
} from 'lucide-react';

const DEPT_COLORS: Record<string, string> = {
  'Exploitation':   'bg-blue-50 text-blue-700',
  'Comptabilité':   'bg-emerald-50 text-emerald-700',
  'RH':             'bg-purple-50 text-purple-700',
  'Finance':        'bg-amber-50 text-amber-700',
  'Administration': 'bg-cyan-50 text-cyan-700',
  'Maintenance':    'bg-rose-50 text-rose-700',
};

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
];

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n);
}

function yearsOfService(hire: string) {
  if (!hire) return '—';
  const years = Math.floor((Date.now() - new Date(hire).getTime()) / (1000 * 60 * 60 * 24 * 365));
  return `${years} an${years > 1 ? 's' : ''}`;
}

const getAvatarInitials = (name: string) => {
  return name ? name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() : '??';
};

const initialFormState = {
  full_name: '',
  email: '',
  phone: '',
  department: 'Exploitation',
  position: '',
  hire_date: new Date().toISOString().split('T')[0],
  contract_type: 'cdi',
  base_salary: 200_000,
  bank_account: '',
  is_active: true
};

export default function RHPage() {
  const supabaseHr = createClient({ db: { schema: 'hr' } });

  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [tab, setTab] = useState<'list' | 'org'>('list');

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseHr
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setFormData({
      full_name: emp.full_name,
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department,
      position: emp.position,
      hire_date: emp.hire_date,
      contract_type: emp.contract_type || 'cdi',
      base_salary: Number(emp.base_salary),
      bank_account: emp.bank_account || '',
      is_active: emp.is_active
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        department: formData.department,
        position: formData.position,
        hire_date: formData.hire_date,
        contract_type: formData.contract_type,
        base_salary: Number(formData.base_salary),
        bank_account: formData.bank_account || null,
        is_active: formData.is_active
      };

      if (editingEmployee) {
        const { error } = await supabaseHr
          .from('employees')
          .update(payload)
          .eq('id', editingEmployee.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseHr
          .from('employees')
          .insert([payload]);
        if (error) throw error;
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error saving employee:', err);
      alert('Erreur lors de l\'enregistrement de l\'employé.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;
    try {
      const { error } = await supabaseHr
        .from('employees')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  const depts = Array.from(new Set(employees.map(e => e.department)));
  
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.is_active).length,
    cdi: employees.filter(e => e.contract_type === 'cdi').length,
    masseSalariale: employees.filter(e => e.is_active).reduce((s, e) => s + Number(e.base_salary), 0),
  };

  const filtered = employees.filter(e => {
    const matchSearch = search === '' || 
      e.full_name.toLowerCase().includes(search.toLowerCase()) || 
      e.position.toLowerCase().includes(search.toLowerCase()) ||
      (e.email && e.email.toLowerCase().includes(search.toLowerCase()));
      
    const matchDept = deptFilter === 'all' || e.department === deptFilter;
    const matchContract = contractFilter === 'all' || e.contract_type === contractFilter;
    return matchSearch && matchDept && matchContract;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm text-text-secondary">Chargement du personnel...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Ressources humaines</h1>
          <p className="text-sm text-text-secondary mt-0.5">{stats.active} employés actifs</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Ajouter un employé
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total employés',  value: stats.total,  icon: Users,       cls: 'bg-brand-50 text-brand-600' },
          { label: 'Actifs',          value: stats.active, icon: UserCheck,   cls: 'bg-green-50 text-green-700' },
          { label: 'CDI',             value: stats.cdi,    icon: Award,       cls: 'bg-purple-50 text-purple-600' },
          { label: 'Masse salariale', value: `${fmt(stats.masseSalariale)} XOF`, icon: DollarSign, cls: 'bg-amber-50 text-amber-700' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="kpi-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.cls}`}><Icon className="w-4 h-4" /></div>
              </div>
              <p className="text-2xl font-bold text-text-primary">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-bg border border-surface-border rounded-lg p-1 w-fit">
        {[{key: 'list', label: 'Liste'}, {key: 'org', label: 'Organigramme'}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'list' ? (
        <div className="section-card">
          <div className="p-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input className="input pl-9" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="all">Tous les départements</option>
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="input w-auto" value={contractFilter} onChange={e => setContractFilter(e.target.value)}>
              <option value="all">Tous contrats</option>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="interim">Intérim</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Département</th>
                  <th>Poste</th>
                  <th>Contrat</th>
                  <th>Ancienneté</th>
                  <th>Salaire de base</th>
                  <th>Contact</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, idx) => (
                  <tr key={e.id} className="hover:bg-surface-hover/30 transition-all">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {getAvatarInitials(e.full_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary text-sm">{e.full_name}</p>
                          <p className="text-xs text-text-muted">{e.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${DEPT_COLORS[e.department] || 'bg-gray-50 text-gray-700'}`}>{e.department}</span></td>
                    <td className="text-sm text-text-secondary">{e.position}</td>
                    <td>
                      <span className={`badge ${e.contract_type === 'cdi' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}`}>
                        {e.contract_type ? e.contract_type.toUpperCase() : 'CDI'}
                      </span>
                    </td>
                    <td className="text-xs text-text-secondary">{yearsOfService(e.hire_date)}</td>
                    <td className="font-semibold tabular-nums text-xs">{fmt(e.base_salary)} XOF</td>
                    <td className="text-xs text-text-muted">{e.phone || 'N/A'}</td>
                    <td>
                      {e.is_active
                        ? <span className="badge bg-emerald-50 text-emerald-700"><UserCheck className="w-3 h-3" />Actif</span>
                        : <span className="badge bg-rose-50 text-rose-700"><UserX className="w-3 h-3" />Inactif</span>}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEditModal(e)} className="btn-ghost p-1.5" title="Modifier"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(e.id)} className="btn-ghost p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Organigramme simplifié */
        <div className="section-card p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-brand-700 text-white px-6 py-3 rounded-xl shadow-md text-center">
              <p className="font-bold text-sm">Direction Générale</p>
              <p className="text-xs text-blue-200">dg@demo.com</p>
            </div>
            <div className="w-px h-8 bg-surface-border" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
              {depts.map((dept) => (
                <div key={dept} className="flex flex-col items-center gap-2">
                  <div className="px-4 py-2.5 rounded-lg text-center border border-surface-border bg-white shadow-sm w-full">
                    <p className="font-semibold text-xs text-text-primary">{dept}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {employees.filter(e => e.department === dept).length} personnes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h3 className="text-lg font-bold text-text-primary">
                {editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
              </h3>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nom complet *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Moussa Traoré"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">E-mail</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="moussa@lgt.sn"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Numéro de téléphone</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="+221 77 123 45 67"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Département *</label>
                  <select
                    required
                    className="input"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Exploitation">Exploitation</option>
                    <option value="Comptabilité">Comptabilité</option>
                    <option value="RH">RH</option>
                    <option value="Finance">Finance</option>
                    <option value="Administration">Administration</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="label">Poste *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Chauffeur PL"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Date d'embauche *</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.hire_date}
                    onChange={e => setFormData({ ...formData, hire_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Type de contrat *</label>
                  <select
                    required
                    className="input"
                    value={formData.contract_type}
                    onChange={e => setFormData({ ...formData, contract_type: e.target.value })}
                  >
                    <option value="cdi">CDI</option>
                    <option value="cdd">CDD</option>
                    <option value="interim">Intérim</option>
                  </select>
                </div>
                <div>
                  <label className="label">Salaire de base (XOF) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.base_salary}
                    onChange={e => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Compte Bancaire (RIB)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="SN123 04812 00481..."
                    value={formData.bank_account}
                    onChange={e => setFormData({ ...formData, bank_account: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_active"
                    className="w-4 h-4 rounded text-brand-600 border-surface-border"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <label htmlFor="is_active" className="text-sm text-text-primary font-medium select-none cursor-pointer">
                    Employé actif
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-ghost"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...
                    </span>
                  ) : (
                    'Enregistrer'
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
