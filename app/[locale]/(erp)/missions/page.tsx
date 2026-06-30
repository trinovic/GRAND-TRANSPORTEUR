'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  MapPin, Plus, Search, Eye, Edit, Trash2, X, Loader2,
  TrendingUp, DollarSign, Clock, CheckCircle,
  XCircle, AlertTriangle, Truck, Users, ArrowRight,
  Calendar, Navigation
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  in_progress: { label: 'En cours',   badgeCls: 'bg-blue-50 text-blue-700',    icon: Navigation },
  completed:   { label: 'Terminée',   badgeCls: 'bg-green-50 text-green-700', icon: CheckCircle },
  planned:     { label: 'Planifiée',  badgeCls: 'bg-slate-100 text-slate-700',    icon: Clock },
  cancelled:   { label: 'Annulée',    badgeCls: 'bg-red-50 text-red-700',  icon: XCircle },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconCls: string;
}

function StatCard({ label, value, icon: Icon, iconCls }: StatCardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconCls}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  );
}

// Helpers for serializing client name inside notes column
const parseNotes = (notesStr: string | null) => {
  if (!notesStr) return { client: 'N/A', notes: '' };
  if (notesStr.startsWith('Client: ')) {
    const parts = notesStr.split(' | Notes: ');
    const client = parts[0].replace('Client: ', '');
    const notes = parts[1] || '';
    return { client, notes };
  }
  return { client: 'N/A', notes: notesStr };
};

const serializeNotes = (client: string, notes: string) => {
  return `Client: ${client} | Notes: ${notes}`;
};

const initialFormState = {
  reference: '',
  vehicle_id: '',
  driver_id: '',
  departure_location: '',
  arrival_location: '',
  departure_at: '',
  arrival_at: '',
  estimated_distance_km: 0,
  actual_distance_km: '',
  revenue: 0,
  cost: 0,
  status: 'planned',
  client: '',
  notes: ''
};

export default function MissionsPage() {
  const supabaseLogistics = createClient({ db: { schema: 'logistics' } });
  const supabaseFleet = createClient({ db: { schema: 'fleet' } });

  const [missions, setMissions] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState<any>(null);
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch missions
      const { data: missionsData, error: mError } = await supabaseLogistics
        .from('missions')
        .select('*')
        .order('departure_at', { ascending: false });

      // 2. Fetch fleet details
      const { data: vehiclesData, error: vError } = await supabaseFleet
        .from('vehicles')
        .select('id, plate_number, brand, model');

      const { data: driversData, error: dError } = await supabaseFleet
        .from('drivers')
        .select('id, full_name');

      if (mError) throw mError;
      if (vError) throw vError;
      if (dError) throw dError;

      setMissions(missionsData || []);
      setVehicles(vehiclesData || []);
      setDrivers(driversData || []);
    } catch (err) {
      console.error('Error fetching missions details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingMission(null);
    const mockRef = `MIS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      ...initialFormState,
      reference: mockRef,
      vehicle_id: vehicles[0]?.id || '',
      driver_id: drivers[0]?.id || '',
      departure_at: new Date().toISOString().substring(0, 16),
    });
    setShowModal(true);
  };

  const openEditModal = (m: any) => {
    setEditingMission(m);
    const { client, notes } = parseNotes(m.notes);
    setFormData({
      reference: m.reference,
      vehicle_id: m.vehicle_id,
      driver_id: m.driver_id,
      departure_location: m.departure_location,
      arrival_location: m.arrival_location,
      departure_at: m.departure_at ? new Date(m.departure_at).toISOString().substring(0, 16) : '',
      arrival_at: m.arrival_at ? new Date(m.arrival_at).toISOString().substring(0, 16) : '',
      estimated_distance_km: Number(m.estimated_distance_km),
      actual_distance_km: m.actual_distance_km !== null ? String(m.actual_distance_km) : '',
      revenue: Number(m.revenue),
      cost: Number(m.cost),
      status: m.status,
      client,
      notes
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMission(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        reference: formData.reference,
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id,
        departure_location: formData.departure_location,
        arrival_location: formData.arrival_location,
        departure_at: new Date(formData.departure_at).toISOString(),
        arrival_at: formData.arrival_at ? new Date(formData.arrival_at).toISOString() : null,
        estimated_distance_km: Number(formData.estimated_distance_km),
        actual_distance_km: formData.actual_distance_km ? Number(formData.actual_distance_km) : null,
        revenue: Number(formData.revenue),
        cost: Number(formData.cost),
        status: formData.status,
        notes: serializeNotes(formData.client, formData.notes)
      };

      if (editingMission) {
        const { error } = await supabaseLogistics
          .from('missions')
          .update(payload)
          .eq('id', editingMission.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseLogistics
          .from('missions')
          .insert([payload]);
        if (error) throw error;
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error saving mission:', err);
      alert('Erreur lors de l\'enregistrement de la mission.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) return;
    try {
      const { error } = await supabaseLogistics
        .from('missions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting mission:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  // Stats calculation
  const validMissions = missions.filter(m => m.status !== 'cancelled');
  const stats = {
    total:       missions.length,
    in_progress: missions.filter(m => m.status === 'in_progress').length,
    completed:   missions.filter(m => m.status === 'completed').length,
    totalRevenue: validMissions.reduce((s, m) => s + Number(m.revenue), 0),
    avgMargin:   validMissions.length > 0 
      ? (validMissions.reduce((s, m) => {
          const rev = Number(m.revenue);
          const cost = Number(m.cost);
          const pct = rev > 0 ? ((rev - cost) / rev) * 100 : 0;
          return s + pct;
        }, 0) / validMissions.length).toFixed(1)
      : '0.0',
  };

  // Filter
  const filtered = missions.filter(m => {
    const { client } = parseNotes(m.notes);
    const vehicleObj = vehicles.find(v => v.id === m.vehicle_id);
    const driverObj = drivers.find(d => d.id === m.driver_id);
    const vPlate = vehicleObj?.plate_number || '';
    const dName = driverObj?.full_name || '';

    const matchSearch = search === '' ||
      m.reference.toLowerCase().includes(search.toLowerCase()) ||
      client.toLowerCase().includes(search.toLowerCase()) ||
      m.departure_location.toLowerCase().includes(search.toLowerCase()) ||
      m.arrival_location.toLowerCase().includes(search.toLowerCase()) ||
      vPlate.toLowerCase().includes(search.toLowerCase()) ||
      dName.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm text-text-secondary">Chargement des missions...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Missions de transport</h1>
          <p className="text-sm text-text-secondary mt-0.5">{stats.total} missions au total</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Nouvelle mission
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total missions"   value={stats.total}       icon={MapPin}      iconCls="bg-brand-50 text-brand-600" />
        <StatCard label="En cours"         value={stats.in_progress} icon={Navigation}  iconCls="bg-blue-50 text-blue-700" />
        <StatCard label="Terminées"        value={stats.completed}   icon={CheckCircle} iconCls="bg-green-50 text-green-700" />
        <StatCard label="CA total"         value={`${fmt(stats.totalRevenue)} XOF`} icon={DollarSign} iconCls="bg-green-50 text-green-700" />
        <StatCard label="Marge moyenne"    value={`${stats.avgMargin}%`} icon={TrendingUp} iconCls="bg-brand-50 text-brand-600" />
      </div>

      {/* Filters + Table */}
      <div className="section-card">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-9"
              placeholder="Rechercher par réf., client, chauffeur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'in_progress', 'completed', 'planned', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  statusFilter === s
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'bg-white text-text-secondary border-surface-border hover:border-brand-200'
                }`}
              >
                {{ all: 'Toutes', in_progress: 'En cours', completed: 'Terminées', planned: 'Planifiées', cancelled: 'Annulées' }[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Trajet</th>
                <th>Chauffeur / Véhicule</th>
                <th>Départ</th>
                <th>Arrivée</th>
                <th>Distance</th>
                <th>Revenu</th>
                <th>Coût</th>
                <th>Marge</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const S = STATUS_CONFIG[m.status] || { label: m.status, badgeCls: 'bg-gray-100 text-gray-700', icon: MapPin };
                const SIcon = S.icon;
                
                const vehicleObj = vehicles.find(v => v.id === m.vehicle_id);
                const driverObj = drivers.find(d => d.id === m.driver_id);
                const vPlate = vehicleObj?.plate_number || 'N/A';
                const dName = driverObj?.full_name || 'N/A';

                const { client } = parseNotes(m.notes);
                
                const rev = Number(m.revenue);
                const cost = Number(m.cost);
                const marginPercent = rev > 0 ? ((rev - cost) / rev) * 100 : 0;

                return (
                  <tr key={m.id} className="hover:bg-surface-hover/30 transition-all">
                    <td>
                      <span className="font-mono text-xs font-bold text-text-primary">{m.reference}</span>
                    </td>
                    <td className="font-medium text-text-primary text-sm">{client}</td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-text-primary font-medium">
                        <span>{m.departure_location}</span>
                        <ArrowRight className="w-3 h-3 text-text-muted" />
                        <span>{m.arrival_location}</span>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-xs text-text-primary">{dName}</div>
                      <div className="text-[10px] font-mono text-text-muted">{vPlate}</div>
                    </td>
                    <td className="text-xs text-text-secondary">{fmtDate(m.departure_at)}</td>
                    <td className="text-xs text-text-secondary">{fmtDate(m.arrival_at)}</td>
                    <td className="text-xs font-medium">{Number(m.estimated_distance_km).toLocaleString('fr-FR')} km</td>
                    <td className="font-semibold tabular-nums text-text-primary text-xs">{rev.toLocaleString('fr-FR')} XOF</td>
                    <td className="text-xs text-text-secondary tabular-nums text-xs">{cost.toLocaleString('fr-FR')} XOF</td>
                    <td>
                      <span className={`font-bold text-xs ${
                        marginPercent >= 40 ? 'text-green-600' :
                        marginPercent >= 25 ? 'text-amber-600' : 'text-red-600'
                      }`}>{marginPercent.toFixed(0)}%</span>
                    </td>
                    <td>
                      <span className={`badge ${S.badgeCls}`}>
                        <SIcon className="w-3 h-3" />{S.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEditModal(m)}
                          className="btn-ghost p-1.5" 
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)}
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
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune mission trouvée</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h3 className="text-lg font-bold text-text-primary">
                {editingMission ? 'Modifier la mission' : 'Créer une mission'}
              </h3>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Référence *</label>
                  <input
                    type="text"
                    required
                    className="input font-mono"
                    value={formData.reference}
                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Client *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="TOTAL Sénégal"
                    value={formData.client}
                    onChange={e => setFormData({ ...formData, client: e.target.value })}
                  />
                </div>
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
                  <label className="label">Chauffeur *</label>
                  <select
                    required
                    className="input"
                    value={formData.driver_id}
                    onChange={e => setFormData({ ...formData, driver_id: e.target.value })}
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Lieu de départ *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Dakar, Port"
                    value={formData.departure_location}
                    onChange={e => setFormData({ ...formData, departure_location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Lieu d'arrivée *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Bamako"
                    value={formData.arrival_location}
                    onChange={e => setFormData({ ...formData, arrival_location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Date de départ *</label>
                  <input
                    type="datetime-local"
                    required
                    className="input"
                    value={formData.departure_at}
                    onChange={e => setFormData({ ...formData, departure_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Date d'arrivée (Optionnel)</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.arrival_at}
                    onChange={e => setFormData({ ...formData, arrival_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Distance estimée (KM) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.estimated_distance_km}
                    onChange={e => setFormData({ ...formData, estimated_distance_km: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Distance réelle (KM)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="1250"
                    value={formData.actual_distance_km}
                    onChange={e => setFormData({ ...formData, actual_distance_km: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Revenu prévu (XOF) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.revenue}
                    onChange={e => setFormData({ ...formData, revenue: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Coût prévu (XOF) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
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
                    <option value="planned">Planifiée</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Notes / Instructions</label>
                  <textarea
                    className="input h-20"
                    placeholder="Consignes particulières pour le trajet..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
