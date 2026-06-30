'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Receipt, Plus, Search, Eye, Download, Send, CheckCircle,
  AlertCircle, DollarSign, Wallet, FileText, Settings, ArrowUpRight,
  X, Trash2, Loader2, Edit
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  draft:     { label: 'Brouillon', badgeCls: 'bg-slate-100 text-slate-700',   icon: AlertCircle },
  validated: { label: 'Validé',    badgeCls: 'bg-blue-50 text-blue-700',      icon: CheckCircle },
  paid:      { label: 'Payé',      badgeCls: 'bg-green-50 text-green-700',    icon: CheckCircle },
};

const initialFormState = {
  employee_id: '',
  period: new Date().toISOString().substring(0, 7), // YYYY-MM
  bonuses: 0,
  deductions: 0,
  status: 'draft'
};

export default function PaiePage() {
  const supabaseHr = createClient({ db: { schema: 'hr' } });

  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: recordsData, error: rError } = await supabaseHr
        .from('payroll_records')
        .select(`
          *,
          employees ( id, full_name, department, base_salary )
        `)
        .order('period', { ascending: false });

      const { data: employeesData, error: eError } = await supabaseHr
        .from('employees')
        .select('id, full_name, department, base_salary')
        .eq('is_active', true);

      if (rError) throw rError;
      if (eError) throw eError;

      setRecords(recordsData || []);
      setEmployees(employeesData || []);
    } catch (err) {
      console.error('Error fetching payroll data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingRecord(null);
    setFormData({
      ...initialFormState,
      employee_id: employees[0]?.id || '',
    });
    setShowModal(true);
  };

  const openEditModal = (rec: any) => {
    setEditingRecord(rec);
    setFormData({
      employee_id: rec.employee_id,
      period: rec.period,
      bonuses: Number(rec.bonuses),
      deductions: Number(rec.deductions),
      status: rec.status
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const selectedEmp = employees.find(emp => emp.id === formData.employee_id);
      const baseSalary = Number(selectedEmp?.base_salary || 0);

      // Calculations
      const grossSalary = baseSalary + Number(formData.bonuses);
      const socialCharges = grossSalary * 0.05; // 5% simulation
      const incomeTax = grossSalary * 0.10; // 10% simulation
      const netSalary = grossSalary - socialCharges - incomeTax - Number(formData.deductions);

      const payload = {
        employee_id: formData.employee_id,
        period: formData.period,
        gross_salary: grossSalary,
        social_charges: socialCharges,
        income_tax: incomeTax,
        net_salary: netSalary,
        bonuses: Number(formData.bonuses),
        deductions: Number(formData.deductions),
        status: formData.status
      };

      if (editingRecord) {
        const { error } = await supabaseHr
          .from('payroll_records')
          .update(payload)
          .eq('id', editingRecord.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseHr
          .from('payroll_records')
          .insert([payload]);
        if (error) throw error;
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error saving payroll:', err);
      alert('Erreur lors de l\'enregistrement de la fiche de paie.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabaseHr
        .from('payroll_records')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette fiche de paie ?')) return;
    try {
      const { error } = await supabaseHr
        .from('payroll_records')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting payroll:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  // Stats
  const stats = {
    totalGross:    records.reduce((s, r) => s + Number(r.gross_salary || 0), 0),
    totalNet:      records.reduce((s, r) => s + Number(r.net_salary || 0), 0),
    totalPaid:     records.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.net_salary || 0), 0),
    totalDraft:    records.filter(r => r.status === 'draft').reduce((s, r) => s + Number(r.net_salary || 0), 0),
  };

  // Filter
  const filtered = records.filter(r => {
    const eName = r.employees?.full_name || '';
    const eDept = r.employees?.department || '';
    
    const matchSearch = search === '' ||
      eName.toLowerCase().includes(search.toLowerCase()) ||
      eDept.toLowerCase().includes(search.toLowerCase());
      
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm text-text-secondary">Chargement de la paie...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Gestion de la Paie</h1>
          <p className="text-sm text-text-secondary mt-0.5">Calcul des salaires, cotisations et virements</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openAddModal} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" /> Calculer la Paie (Juin)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Masse Salariale Brut', value: `${stats.totalGross.toLocaleString('fr-FR')} XOF`, icon: DollarSign, cls: 'bg-brand-50 text-brand-600' },
          { label: 'Net à payer total',   value: `${stats.totalNet.toLocaleString('fr-FR')} XOF`,   icon: Wallet,     cls: 'bg-blue-50 text-blue-700' },
          { label: 'Total payé',           value: `${stats.totalPaid.toLocaleString('fr-FR')} XOF`,  icon: CheckCircle, cls: 'bg-green-50 text-green-700' },
          { label: 'En cours de validation', value: `${stats.totalDraft.toLocaleString('fr-FR')} XOF`, icon: AlertCircle, cls: 'bg-amber-50 text-amber-700' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="kpi-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Table section */}
      <div className="section-card">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-9"
              placeholder="Rechercher par employé ou département..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="validated">Validé</option>
            <option value="paid">Payé</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Département</th>
                <th className="text-right">Salaire Base</th>
                <th className="text-right">Primes / Heures Sup.</th>
                <th className="text-right">Retenues / Avances</th>
                <th className="text-right">Net à payer</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const S = STATUS_CONFIG[r.status] || { label: r.status, badgeCls: 'bg-gray-100 text-gray-700', icon: AlertCircle };
                const SIcon = S.icon;
                const empBaseSalary = Number(r.employees?.base_salary || 0);

                return (
                  <tr key={r.id} className="hover:bg-surface-hover/30 transition-all">
                    <td><span className="font-semibold text-sm text-text-primary">{r.employees?.full_name || 'N/A'}</span></td>
                    <td className="text-xs text-text-secondary">{r.employees?.department || 'N/A'}</td>
                    <td className="text-right tabular-nums text-text-secondary text-xs">{empBaseSalary.toLocaleString('fr-FR')} XOF</td>
                    <td className="text-right tabular-nums text-green-600 text-xs">+{Number(r.bonuses).toLocaleString('fr-FR')} XOF</td>
                    <td className="text-right tabular-nums text-red-600 text-xs">-{Number(r.deductions).toLocaleString('fr-FR')} XOF</td>
                    <td className="text-right font-bold tabular-nums text-text-primary text-sm">{Number(r.net_salary).toLocaleString('fr-FR')} XOF</td>
                    <td>
                      <span className={`badge ${S.badgeCls}`}>
                        <SIcon className="w-3 h-3" />{S.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEditModal(r)}
                          className="btn-ghost p-1.5" 
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {r.status === 'validated' && (
                          <button 
                            onClick={() => handleUpdateStatus(r.id, 'paid')}
                            className="btn-ghost p-1.5 text-green-600 hover:bg-green-50" 
                            title="Virement"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(r.id)}
                          className="btn-ghost p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" 
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h3 className="text-lg font-bold text-text-primary">
                {editingRecord ? 'Modifier la fiche de paie' : 'Calculer la fiche de paie'}
              </h3>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Employé *</label>
                  <select
                    required
                    className="input"
                    value={formData.employee_id}
                    onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Période (Mois) *</label>
                  <input
                    type="month"
                    required
                    className="input"
                    value={formData.period}
                    onChange={e => setFormData({ ...formData, period: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Primes / Heures Sup. (XOF) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.bonuses}
                    onChange={e => setFormData({ ...formData, bonuses: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Retenues / Avances (XOF) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.deductions}
                    onChange={e => setFormData({ ...formData, deductions: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Statut *</label>
                  <select
                    required
                    className="input"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="draft">Brouillon</option>
                    <option value="validated">Validé</option>
                    <option value="paid">Payé</option>
                  </select>
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
                    'Calculer & Enregistrer'
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
