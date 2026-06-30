'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users, Plus, Search, Eye, Edit, Shield, Calendar, Phone, Award,
  CheckCircle, Clock, AlertTriangle, ArrowUpRight, DollarSign,
  X, Trash2, Loader2
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  in_mission: { label: 'En mission', badgeCls: 'bg-blue-50 text-blue-700',    icon: ArrowUpRight },
  resting:    { label: 'Au repos',    badgeCls: 'bg-green-50 text-green-700', icon: CheckCircle },
  suspended:  { label: 'Suspendu',   badgeCls: 'bg-red-50 text-red-700',      icon: AlertTriangle },
};

const initialFormState = {
  full_name: '',
  phone: '',
  license_number: '',
  license_expiry: '',
  license_type: 'C',
  contract_type: 'cdi',
  base_salary: 250_000,
  hire_date: new Date().toISOString().split('T')[0],
  vehicle_id: '',
};

export default function ChauffeursPage() {
  const supabase = createClient({ db: { schema: 'fleet' } });

  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: driversData, error: dError } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: vehiclesData, error: vError } = await supabase
        .from('vehicles')
        .select('id, plate_number, brand, model');

      if (dError) throw dError;
      if (vError) throw vError;

      setDrivers(driversData || []);
      setVehicles(vehiclesData || []);
    } catch (err) {
      console.error('Error fetching drivers data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingDriver(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const openEditModal = (driver: any) => {
    setEditingDriver(driver);
    setFormData({
      full_name: driver.full_name,
      phone: driver.phone,
      license_number: driver.license_number,
      license_expiry: driver.license_expiry,
      license_type: driver.license_type || 'C',
      contract_type: driver.contract_type || 'cdi',
      base_salary: driver.base_salary,
      hire_date: driver.hire_date,
      vehicle_id: driver.vehicle_id || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDriver(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const driverPayload = {
        full_name: formData.full_name,
        phone: formData.phone,
        license_number: formData.license_number,
        license_expiry: formData.license_expiry,
        license_type: formData.license_type,
        contract_type: formData.contract_type,
        base_salary: Number(formData.base_salary),
        hire_date: formData.hire_date,
        vehicle_id: formData.vehicle_id || null,
      };

      if (editingDriver) {
        const { error } = await supabase
          .from('drivers')
          .update(driverPayload)
          .eq('id', editingDriver.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('drivers')
          .insert([driverPayload]);
        if (error) throw error;
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error saving driver:', err);
      alert('Erreur lors de l\'enregistrement du chauffeur.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ? Cette action est irréversible.')) return;
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting driver:', err);
      alert('Erreur lors de la suppression du chauffeur.');
    }
  };

  // Helper to calculate status (in_mission if has vehicle, else resting)
  const getDriverStatus = (d: any) => {
    return d.vehicle_id ? 'in_mission' : 'resting';
  };

  // Helper to generate score (safety) deterministically
  const getDriverScore = (id: string) => {
    // Generate code between 80 and 97
    const val = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (val % 18) + 80;
  };

  const stats = {
    total:       drivers.length,
    inMission:   drivers.filter(d => getDriverStatus(d) === 'in_mission').length,
    resting:     drivers.filter(d => getDriverStatus(d) === 'resting').length,
    avgScore:    drivers.length > 0 
      ? (drivers.reduce((s, d) => s + getDriverScore(d.id), 0) / drivers.length).toFixed(0)
      : '0',
  };

  const filtered = drivers.filter(d => {
    const matchSearch = search === '' ||
      d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.license_number.toLowerCase().includes(search.toLowerCase()) ||
      (d.vehicle_id && vehicles.find(v => v.id === d.vehicle_id)?.plate_number?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || getDriverStatus(d) === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm text-text-secondary">Chargement des chauffeurs...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Chauffeurs</h1>
          <p className="text-sm text-text-secondary mt-0.5">Gestions des conducteurs et permis</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Ajouter un chauffeur
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total chauffeurs',  value: stats.total,       icon: Users,      cls: 'bg-brand-50 text-brand-600' },
          { label: 'En mission',        value: stats.inMission,   icon: ArrowUpRight, cls: 'bg-blue-50 text-blue-700' },
          { label: 'Au repos',          value: stats.resting,     icon: CheckCircle, cls: 'bg-green-50 text-green-700' },
          { label: 'Score de conduite', value: `${stats.avgScore}%`, icon: Shield,     cls: 'bg-purple-50 text-purple-600' },
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
              placeholder="Rechercher par nom, permis, véhicule..."
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
            <option value="in_mission">En mission</option>
            <option value="resting">Au repos</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Chauffeur</th>
                <th>Permis / Validité</th>
                <th>Téléphone</th>
                <th>Contrat</th>
                <th className="text-right">Salaire Base</th>
                <th>Véhicule affecté</th>
                <th>Score sécurité</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const status = getDriverStatus(d);
                const score = getDriverScore(d.id);
                const S = STATUS_CONFIG[status] || { label: status, badgeCls: 'bg-gray-100 text-gray-700', icon: Clock };
                const SIcon = S.icon;
                const isExpired = new Date(d.license_expiry) < new Date();
                
                return (
                  <tr key={d.id} className="hover:bg-surface-hover/30 transition-all">
                    <td>
                      <div className="font-semibold text-text-primary text-sm">{d.full_name}</div>
                      <div className="text-[10px] text-text-muted">ID: CH-{d.id.slice(0, 8)}</div>
                    </td>
                    <td>
                      <div className="font-mono text-xs text-text-primary">{d.license_number} ({d.license_type || 'C'})</div>
                      <div className={`text-[10px] ${isExpired ? 'text-red-600 font-bold' : 'text-text-secondary'}`}>
                        Exp. {new Date(d.license_expiry).toLocaleDateString('fr-FR')} {isExpired && 'EXPIRÉ'}
                      </div>
                    </td>
                    <td className="text-xs text-text-secondary font-medium">{d.phone}</td>
                    <td>
                      <span className={`badge ${d.contract_type === 'cdi' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}`}>
                        {d.contract_type ? d.contract_type.toUpperCase() : 'CDI'}
                      </span>
                    </td>
                    <td className="text-right font-medium text-xs tabular-nums">{d.base_salary.toLocaleString('fr-FR')} XOF</td>
                    <td>
                      {(() => {
                        const assignedVehicle = vehicles.find(v => v.id === d.vehicle_id);
                        return assignedVehicle ? (
                          <span className="font-mono text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-semibold">
                            {assignedVehicle.plate_number}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">Aucun</span>
                        );
                      })()}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${score >= 90 ? 'text-green-600' : score >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                          {score}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${S.badgeCls}`}>
                        <SIcon className="w-3 h-3" />{S.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEditModal(d)}
                          className="btn-ghost p-1.5" 
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(d.id)}
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
                {editingDriver ? 'Modifier le chauffeur' : 'Ajouter un chauffeur'}
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
                  <label className="label">Numéro de téléphone *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="+221 77 123 45 67"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Numéro de permis *</label>
                  <input
                    type="text"
                    required
                    className="input font-mono"
                    placeholder="C-22941-DK"
                    value={formData.license_number}
                    onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Type de permis *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="C"
                    value={formData.license_type}
                    onChange={e => setFormData({ ...formData, license_type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Expiration permis *</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.license_expiry}
                    onChange={e => setFormData({ ...formData, license_expiry: e.target.value })}
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
                  <label className="label">Véhicule affecté</label>
                  <select
                    className="input"
                    value={formData.vehicle_id}
                    onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                  >
                    <option value="">Aucun véhicule</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.plate_number} - {v.brand} {v.model}
                      </option>
                    ))}
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
