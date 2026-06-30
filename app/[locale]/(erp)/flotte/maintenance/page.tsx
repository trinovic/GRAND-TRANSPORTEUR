'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Wrench, Plus, Search, Eye, Edit, Trash2, X, Loader2,
  AlertTriangle, CheckCircle, Clock, DollarSign, Calendar, Truck
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  completed:   { label: 'Terminé', badgeCls: 'bg-green-50 text-green-700', icon: CheckCircle },
  in_progress: { label: 'En cours', badgeCls: 'bg-blue-50 text-blue-700',    icon: Clock },
  planned:     { label: 'Planifié', badgeCls: 'bg-slate-100 text-slate-600',  icon: Calendar },
};

const TYPE_LABELS: Record<string, string> = {
  'vidange': 'Vidange',
  'pneus': 'Pneumatiques',
  'reparation': 'Réparation',
  'controle-technique': 'Contrôle Technique',
  'autre': 'Autre',
};

const initialFormState = {
  vehicle_id: '',
  type: 'vidange',
  date: new Date().toISOString().split('T')[0],
  cost: 0,
  provider: '',
  description: '',
  next_due_date: '',
  next_due_km: '',
};

export default function MaintenancePage() {
  const supabase = createClient({ db: { schema: 'fleet' } });

  const [records, setRecords] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: recordsData, error: rError } = await supabase
        .from('maintenance_records')
        .select('*')
        .order('date', { ascending: false });

      const { data: vehiclesData, error: vError } = await supabase
        .from('vehicles')
        .select('id, plate_number, brand, model');

      if (rError) throw rError;
      if (vError) throw vError;

      setRecords(recordsData || []);
      setVehicles(vehiclesData || []);
    } catch (err) {
      console.error('Error fetching maintenance records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingRecord(null);
    setFormData(initialFormState);
    if (vehicles.length > 0) {
      setFormData(prev => ({ ...prev, vehicle_id: vehicles[0].id }));
    }
    setShowModal(true);
  };

  const openEditModal = (rec: any) => {
    setEditingRecord(rec);
    setFormData({
      vehicle_id: rec.vehicle_id,
      type: rec.type,
      date: rec.date,
      cost: rec.cost,
      provider: rec.provider || '',
      description: rec.description || '',
      next_due_date: rec.next_due_date || '',
      next_due_km: rec.next_due_km !== null ? String(rec.next_due_km) : '',
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
      const recPayload = {
        vehicle_id: formData.vehicle_id,
        type: formData.type,
        date: formData.date,
        cost: Number(formData.cost),
        provider: formData.provider || null,
        description: formData.description || null,
        next_due_date: formData.next_due_date || null,
        next_due_km: formData.next_due_km ? Number(formData.next_due_km) : null,
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('maintenance_records')
          .update(recPayload)
          .eq('id', editingRecord.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('maintenance_records')
          .insert([recPayload]);
        if (error) throw error;
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error saving maintenance record:', err);
      alert('Erreur lors de l\'enregistrement de l\'entretien.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet entretien ?')) return;
    try {
      const { error } = await supabase
        .from('maintenance_records')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting maintenance record:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  // Status mapping logic
  const getRecordStatus = (rec: any): 'completed' | 'in_progress' | 'planned' => {
    const today = new Date().toISOString().split('T')[0];
    if (rec.date > today) return 'planned';
    if (rec.date === today && !rec.next_due_date) return 'in_progress';
    return 'completed';
  };

  const stats = {
    totalCost:    records.reduce((s, r) => s + Number(r.cost), 0),
    inProgress:   records.filter(r => getRecordStatus(r) === 'in_progress').length,
    completed:    records.filter(r => getRecordStatus(r) === 'completed').length,
    planned:      records.filter(r => getRecordStatus(r) === 'planned').length,
  };

  const filtered = records.filter(r => {
    const vObj = vehicles.find(v => v.id === r.vehicle_id);
    const vPlate = vObj?.plate_number || '';
    const vBrand = vObj?.brand || '';
    const rProvider = r.provider || '';
    const rDesc = r.description || '';
    
    const matchSearch = search === '' ||
      vPlate.toLowerCase().includes(search.toLowerCase()) ||
      vBrand.toLowerCase().includes(search.toLowerCase()) ||
      rProvider.toLowerCase().includes(search.toLowerCase()) ||
      rDesc.toLowerCase().includes(search.toLowerCase()) ||
      TYPE_LABELS[r.type]?.toLowerCase().includes(search.toLowerCase());
      
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const types = Object.keys(TYPE_LABELS);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm text-text-secondary">Chargement des maintenances...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Maintenance des Véhicules</h1>
          <p className="text-sm text-text-secondary mt-0.5">Suivi des entretiens et contrôles périodiques</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Enregistrer un entretien
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Budget dépensé',  value: `${stats.totalCost.toLocaleString('fr-FR')} XOF`, icon: DollarSign, cls: 'bg-brand-50 text-brand-600' },
          { label: 'En atelier',       value: stats.inProgress,                              icon: Clock,      cls: 'bg-blue-50 text-blue-700' },
          { label: 'Révisions faites', value: stats.completed,                               icon: CheckCircle, cls: 'bg-green-50 text-green-700' },
          { label: 'Entretien prévu',  value: stats.planned,                                 icon: Calendar,   cls: 'bg-amber-50 text-amber-700' },
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
              placeholder="Rechercher par véhicule, atelier, opération..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">Tous les types d'opération</option>
            {types.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Opération</th>
                <th>Date d'effet</th>
                <th>Atelier / Prestataire</th>
                <th>Détails de l'intervention</th>
                <th className="text-right">Coût</th>
                <th>Échéance révision</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const status = getRecordStatus(r);
                const S = STATUS_CONFIG[status] || { label: status, badgeCls: 'bg-gray-100 text-gray-700', icon: Clock };
                const SIcon = S.icon;
                
                return (
                  <tr key={r.id} className="hover:bg-surface-hover/30 transition-all">
                    <td>
                      {(() => {
                        const vehicle = vehicles.find(v => v.id === r.vehicle_id);
                        return vehicle ? (
                          <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            {vehicle.plate_number}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">Inconnu</span>
                        );
                      })()}
                    </td>
                    <td><span className="font-medium text-sm text-text-primary">{TYPE_LABELS[r.type] || r.type}</span></td>
                    <td className="text-xs text-text-secondary">{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                    <td className="text-xs text-text-primary font-medium">{r.provider || 'N/A'}</td>
                    <td className="text-xs text-text-secondary max-w-[250px] truncate" title={r.description || ''}>
                      {r.description || 'N/A'}
                    </td>
                    <td className="text-right font-semibold tabular-nums text-text-primary text-xs">{r.cost.toLocaleString('fr-FR')} XOF</td>
                    <td>
                      {r.next_due_date ? (
                        <span className="text-xs text-text-secondary">{new Date(r.next_due_date).toLocaleDateString('fr-FR')}</span>
                      ) : (
                        <span className="text-xs text-text-muted">N/A</span>
                      )}
                    </td>
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
                {editingRecord ? 'Modifier l\'entretien' : 'Enregistrer un entretien'}
              </h3>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Véhicule *</label>
                  <select
                    required
                    className="input"
                    value={formData.vehicle_id}
                    onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.plate_number} - {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Type d'opération *</label>
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
                  <label className="label">Date d'effet *</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Coût total (XOF) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Atelier / Prestataire</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Garage CFAO"
                    value={formData.provider}
                    onChange={e => setFormData({ ...formData, provider: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Prochaine échéance (Date)</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.next_due_date}
                    onChange={e => setFormData({ ...formData, next_due_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Prochaine échéance (KM)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="200000"
                    value={formData.next_due_km}
                    onChange={e => setFormData({ ...formData, next_due_km: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Détails de l'intervention</label>
                  <textarea
                    className="input h-20"
                    placeholder="Vidange moteur complète..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
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
