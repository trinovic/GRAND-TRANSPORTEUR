'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Truck, Plus, Search, Eye, Edit, Wrench,
  CheckCircle, XCircle, AlertTriangle,
  X, Trash2, Loader2, Calendar, Fuel
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  active:      { label: 'Actif',          badgeCls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  immobilized: { label: 'Immobilisé',     badgeCls: 'bg-rose-50 text-rose-700',  icon: XCircle },
  maintenance: { label: 'Maintenance',    badgeCls: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
  sold:        { label: 'Vendu',          badgeCls: 'bg-gray-100 text-gray-700', icon: XCircle },
};

const TYPE_LABELS: Record<string, string> = {
  'camion-citerne':  'Camion-citerne',
  'porte-conteneur': 'Porte-conteneur',
  'camion-plateau':  'Camion plateau',
  'semi-remorque':   'Semi-remorque',
  'vehicule-leger':  'Véhicule léger',
  'engin-special':   'Engin spécial',
};

const TYPE_COLORS: Record<string, string> = {
  'camion-citerne':  'bg-blue-50 text-blue-700',
  'porte-conteneur': 'bg-emerald-50 text-emerald-700',
  'camion-plateau':  'bg-amber-50 text-amber-700',
  'semi-remorque':   'bg-purple-50 text-purple-700',
  'vehicule-leger':  'bg-cyan-50 text-cyan-700',
  'engin-special':   'bg-rose-50 text-rose-700',
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function isExpired(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isExpiringSoon(dateStr: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const days = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return days > 0 && days <= 30;
}

function DateBadge({ label, date }: { label: string; date: string | null }) {
  if (!date) return <span className="text-xs text-text-muted">N/A</span>;
  const expired = isExpired(date);
  const soon = isExpiringSoon(date);
  return (
    <div className={`flex flex-col ${
      expired ? 'text-red-600' : soon ? 'text-amber-600' : 'text-text-secondary'
    }`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-xs font-medium">{new Date(date).toLocaleDateString('fr-FR')}</span>
      {expired && <span className="text-[10px] font-bold">EXPIRÉ</span>}
      {soon    && <span className="text-[10px] font-bold">Bientôt</span>}
    </div>
  );
}

const initialFormState = {
  plate_number: '',
  type: 'camion-citerne',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  current_km: 0,
  chassis_number: '',
  acquisition_date: new Date().toISOString().split('T')[0],
  acquisition_value: 0,
  status: 'active',
  insurance_expiry: '',
  technical_control_expiry: '',
  driver_id: ''
};

export default function FlottePage() {
  const supabase = createClient({ db: { schema: 'fleet' } });
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: vehiclesData, error: vError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: driversData, error: dError } = await supabase
        .from('drivers')
        .select('id, full_name, vehicle_id');

      if (vError) throw vError;
      if (dError) throw dError;

      setVehicles(vehiclesData || []);
      setDrivers(driversData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const openEditModal = (vehicle: any) => {
    setEditingVehicle(vehicle);
    
    // Find current driver ID if any
    const assignedDriver = drivers.find(d => d.vehicle_id === vehicle.id);
    
    setFormData({
      plate_number: vehicle.plate_number,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      current_km: vehicle.current_km,
      chassis_number: vehicle.chassis_number || '',
      acquisition_date: vehicle.acquisition_date,
      acquisition_value: vehicle.acquisition_value,
      status: vehicle.status,
      insurance_expiry: vehicle.insurance_expiry || '',
      technical_control_expiry: vehicle.technical_control_expiry || '',
      driver_id: assignedDriver ? assignedDriver.id : ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let vehicleId = editingVehicle?.id;
      
      const vehiclePayload = {
        plate_number: formData.plate_number,
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        current_km: Number(formData.current_km),
        chassis_number: formData.chassis_number || null,
        acquisition_date: formData.acquisition_date,
        acquisition_value: Number(formData.acquisition_value),
        status: formData.status,
        insurance_expiry: formData.insurance_expiry || null,
        technical_control_expiry: formData.technical_control_expiry || null,
      };

      if (editingVehicle) {
        const { error } = await supabase
          .from('vehicles')
          .update(vehiclePayload)
          .eq('id', vehicleId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('vehicles')
          .insert([vehiclePayload])
          .select()
          .single();
        if (error) throw error;
        vehicleId = data.id;
      }

      // Handle driver assignment updates
      // 1. Reset all drivers currently assigned to this vehicle
      await supabase
        .from('drivers')
        .update({ vehicle_id: null })
        .eq('vehicle_id', vehicleId);

      // 2. Assign the new driver if selected
      if (formData.driver_id) {
        await supabase
          .from('drivers')
          .update({ vehicle_id: vehicleId })
          .eq('id', formData.driver_id);
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      alert('Erreur lors de l\'enregistrement du véhicule.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.')) return;
    try {
      // First unassign any driver to respect foreign keys safely
      await supabase
        .from('drivers')
        .update({ vehicle_id: null })
        .eq('vehicle_id', id);

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      alert('Erreur lors de la suppression du véhicule.');
    }
  };

  const stats = {
    total:       vehicles.length,
    active:      vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    immobilized: vehicles.filter(v => v.status === 'immobilized').length,
  };

  const filtered = vehicles.filter(v => {
    const matchSearch = search === '' || 
      v.plate_number.toLowerCase().includes(search.toLowerCase()) || 
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchType   = typeFilter   === 'all' || v.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const types = Object.keys(TYPE_LABELS);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm text-text-secondary">Chargement de la flotte...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Gestion de la flotte</h1>
          <p className="text-sm text-text-secondary mt-0.5">{stats.total} véhicules enregistrés</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Ajouter un véhicule
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total parc',     value: stats.total,       icon: Truck,         cls: 'text-brand-600 bg-brand-50' },
          { label: 'Actifs',         value: stats.active,      icon: CheckCircle,   cls: 'text-success bg-green-50 text-green-700' },
          { label: 'En maintenance', value: stats.maintenance, icon: Wrench,        cls: 'text-warning bg-amber-50 text-amber-700' },
          { label: 'Immobilisés',    value: stats.immobilized, icon: XCircle,       cls: 'text-danger bg-red-50 text-red-700' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="kpi-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-text-primary">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="section-card">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-9"
              placeholder="Rechercher par immatriculation, marque..."
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
            <option value="active">Actifs</option>
            <option value="maintenance">En maintenance</option>
            <option value="immobilized">Immobilisés</option>
            <option value="sold">Vendus</option>
          </select>
          <select
            className="input w-auto"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">Tous les types</option>
            {types.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Immatriculation</th>
                <th>Type</th>
                <th>Véhicule</th>
                <th>Année / KM</th>
                <th>Chauffeur</th>
                <th>Assurance</th>
                <th>CT</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const S = STATUS_CONFIG[v.status] || { label: v.status, badgeCls: 'bg-gray-100 text-gray-700', icon: Truck };
                const SIcon = S.icon;
                const assignedDriver = drivers.find(d => d.vehicle_id === v.id)?.full_name || 'N/A';
                
                return (
                  <tr key={v.id} className="hover:bg-surface-hover/30 transition-all">
                    <td>
                      <span className="font-mono text-xs font-bold text-text-primary">{v.plate_number}</span>
                    </td>
                    <td>
                      <span className={`badge ${TYPE_COLORS[v.type] || 'bg-slate-100 text-slate-700'}`}>
                        {TYPE_LABELS[v.type] || v.type}
                      </span>
                    </td>
                    <td>
                      <div className="font-medium text-text-primary">{v.brand}</div>
                      <div className="text-xs text-text-secondary">{v.model}</div>
                    </td>
                    <td>
                      <div className="text-sm font-medium">{v.year}</div>
                      <div className="text-xs text-text-secondary">{v.current_km.toLocaleString('fr-FR')} km</div>
                    </td>
                    <td className="text-xs font-medium text-text-secondary">{assignedDriver}</td>
                    <td><DateBadge label="Assur." date={v.insurance_expiry} /></td>
                    <td><DateBadge label="CT" date={v.technical_control_expiry} /></td>
                    <td>
                      <span className={`badge ${S.badgeCls}`}>
                        <SIcon className="w-3 h-3" />{S.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEditModal(v)}
                          className="btn-ghost p-1.5" 
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id)}
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

        {filtered.length === 0 && (
          <div className="p-12 text-center text-text-muted">
            <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun véhicule trouvé</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h3 className="text-lg font-bold text-text-primary">
                {editingVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
              </h3>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Immatriculation *</label>
                  <input
                    type="text"
                    required
                    className="input font-mono"
                    placeholder="TN-4821-AB"
                    value={formData.plate_number}
                    onChange={e => setFormData({ ...formData, plate_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Type de véhicule *</label>
                  <select
                    required
                    className="input"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Marque *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Mercedes"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Modèle *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Actros 3341"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Année *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Kilométrage actuel (KM) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.current_km}
                    onChange={e => setFormData({ ...formData, current_km: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Numéro de châssis</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="WDB93403..."
                    value={formData.chassis_number}
                    onChange={e => setFormData({ ...formData, chassis_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Chauffeur assigné</label>
                  <select
                    className="input"
                    value={formData.driver_id}
                    onChange={e => setFormData({ ...formData, driver_id: e.target.value })}
                  >
                    <option value="">Aucun chauffeur</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} {d.vehicle_id && d.vehicle_id !== editingVehicle?.id ? '(Déjà assigné)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Date d'acquisition *</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.acquisition_date}
                    onChange={e => setFormData({ ...formData, acquisition_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Valeur d'acquisition (XOF) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.acquisition_value}
                    onChange={e => setFormData({ ...formData, acquisition_value: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Expiration Assurance</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.insurance_expiry}
                    onChange={e => setFormData({ ...formData, insurance_expiry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Expiration Contrôle Technique</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.technical_control_expiry}
                    onChange={e => setFormData({ ...formData, technical_control_expiry: e.target.value })}
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
                    <option value="active">Actif</option>
                    <option value="maintenance">En maintenance</option>
                    <option value="immobilized">Immobilisé</option>
                    <option value="sold">Vendu</option>
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
