'use client';

import { useState } from 'react';
import {
  Users, Plus, Search, Eye, Edit, UserCheck, UserX,
  Phone, Mail, Calendar, DollarSign, FileText,
  Building2, Award, Clock,
} from 'lucide-react';

const EMPLOYEES = [
  { id: '1', name: 'Ibrahima Diallo',   dept: 'Exploitation',   position: 'Chauffeur PL',         contract: 'CDI',  hire: '2019-03-15', salary: 285_000, is_active: true,  phone: '+221 77 123 45 67', email: 'i.diallo@lgt.sn',   avatar: 'ID' },
  { id: '2', name: 'Moussa Traoré',     dept: 'Exploitation',   position: 'Chauffeur PL',         contract: 'CDI',  hire: '2020-07-01', salary: 260_000, is_active: true,  phone: '+221 76 234 56 78', email: 'm.traore@lgt.sn',   avatar: 'MT' },
  { id: '3', name: 'Oumar Seck',        dept: 'Exploitation',   position: 'Chauffeur PL',         contract: 'CDI',  hire: '2018-11-20', salary: 310_000, is_active: true,  phone: '+221 70 345 67 89', email: 'o.seck@lgt.sn',     avatar: 'OS' },
  { id: '4', name: 'Aminata Fall',      dept: 'Comptabilité',   position: 'Responsable Comptable', contract: 'CDI', hire: '2017-01-10', salary: 520_000, is_active: true,  phone: '+221 78 456 78 90', email: 'a.fall@lgt.sn',     avatar: 'AF' },
  { id: '5', name: 'Mamadou Ndiaye',   dept: 'RH',             position: 'DRH',                  contract: 'CDI',  hire: '2016-06-15', salary: 750_000, is_active: true,  phone: '+221 77 567 89 01', email: 'm.ndiaye@lgt.sn',   avatar: 'MN' },
  { id: '6', name: 'Fatoumata Bah',    dept: 'Finance',        position: 'DAF',                  contract: 'CDI',  hire: '2015-09-01', salary: 1_200_000, is_active: true, phone: '+221 76 678 90 12', email: 'f.bah@lgt.sn',      avatar: 'FB' },
  { id: '7', name: 'Cheikh Fall',      dept: 'Exploitation',   position: 'Chauffeur VL',         contract: 'CDD', hire: '2023-01-15', salary: 185_000, is_active: true,  phone: '+221 70 789 01 23', email: 'c.fall@lgt.sn',     avatar: 'CF' },
  { id: '8', name: 'Amadou Diop',      dept: 'Exploitation',   position: 'Chauffeur Engins',     contract: 'CDI',  hire: '2021-04-20', salary: 340_000, is_active: true,  phone: '+221 78 890 12 34', email: 'a.diop@lgt.sn',     avatar: 'AD' },
  { id: '9', name: 'Rokhaya Sarr',     dept: 'Administration', position: 'Secrétaire de Direction', contract: 'CDI', hire: '2020-02-01', salary: 380_000, is_active: true, phone: '+221 77 901 23 45', email: 'r.sarr@lgt.sn',     avatar: 'RS' },
  { id: '10', name: 'Lamine Coulibaly', dept: 'Maintenance',   position: 'Chef Mécanicien',      contract: 'CDI',  hire: '2018-08-10', salary: 420_000, is_active: false, phone: '+221 76 012 34 56', email: 'l.coulibaly@lgt.sn', avatar: 'LC' },
];

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
  const years = Math.floor((Date.now() - new Date(hire).getTime()) / (1000 * 60 * 60 * 24 * 365));
  return `${years} an${years > 1 ? 's' : ''}`;
}

export default function RHPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [tab, setTab] = useState<'list' | 'org'>('list');

  const depts = [...new Set(EMPLOYEES.map(e => e.dept))];
  const stats = {
    total: EMPLOYEES.length,
    active: EMPLOYEES.filter(e => e.is_active).length,
    cdi: EMPLOYEES.filter(e => e.contract === 'CDI').length,
    masseSalariale: EMPLOYEES.filter(e => e.is_active).reduce((s, e) => s + e.salary, 0),
  };

  const filtered = EMPLOYEES.filter(e => {
    const matchSearch = search === '' || e.name.toLowerCase().includes(search.toLowerCase()) || e.position.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || e.dept === deptFilter;
    const matchContract = contractFilter === 'all' || e.contract === contractFilter;
    return matchSearch && matchDept && matchContract;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Ressources humaines</h1>
          <p className="text-sm text-text-secondary mt-0.5">{stats.active} employés actifs</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> Ajouter un employé</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total employés',  value: stats.total,  icon: Users,       cls: 'bg-brand-50 text-brand-600' },
          { label: 'Actifs',          value: stats.active, icon: UserCheck,   cls: 'bg-success-light text-success' },
          { label: 'CDI',             value: stats.cdi,    icon: Award,       cls: 'bg-purple-50 text-purple-600' },
          { label: 'Masse salariale', value: `${fmt(stats.masseSalariale)} XOF`, icon: DollarSign, cls: 'bg-warning-light text-warning' },
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
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
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
                  <th>Salaire net</th>
                  <th>Contact</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id} className="cursor-pointer">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                          {e.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary text-sm">{e.name}</p>
                          <p className="text-xs text-text-muted">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${DEPT_COLORS[e.dept] || 'badge-gray'}`}>{e.dept}</span></td>
                    <td className="text-sm text-text-secondary">{e.position}</td>
                    <td><span className={`badge ${e.contract === 'CDI' ? 'badge-success' : 'badge-warning'}`}>{e.contract}</span></td>
                    <td className="text-xs text-text-secondary">{yearsOfService(e.hire)}</td>
                    <td className="font-semibold tabular-nums">{fmt(e.salary)} XOF</td>
                    <td className="text-xs text-text-muted">{e.phone}</td>
                    <td>
                      {e.is_active
                        ? <span className="badge badge-success"><UserCheck className="w-3 h-3" />Actif</span>
                        : <span className="badge badge-danger"><UserX className="w-3 h-3" />Inactif</span>}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-ghost p-1.5"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="btn-ghost p-1.5"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="btn-ghost p-1.5"><FileText className="w-3.5 h-3.5" /></button>
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
            {/* DG */}
            <div className="bg-brand-700 text-white px-6 py-3 rounded-xl shadow-md">
              <p className="font-bold text-sm">Directeur Général</p>
              <p className="text-xs text-blue-200">dg@lgt.sn</p>
            </div>
            <div className="w-px h-8 bg-surface-border" />
            {/* Branches */}
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 w-full">
              {depts.map((dept, i) => (
                <div key={dept} className="flex flex-col items-center gap-2">
                  <div className={`px-4 py-2.5 rounded-lg text-center border border-surface-border bg-white shadow-card w-full`}>
                    <p className="font-semibold text-xs text-text-primary">{dept}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {EMPLOYEES.filter(e => e.dept === dept).length} personnes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
