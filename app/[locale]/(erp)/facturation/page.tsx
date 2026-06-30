'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  FileText, Plus, Search, Eye, Download, CheckCircle2,
  AlertCircle, Clock, XCircle, DollarSign,
  Receipt, FileCheck, ArrowUpRight, X, Trash2, Loader2, Edit
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ElementType }> = {
  draft:     { label: 'Brouillon', badgeCls: 'bg-slate-100 text-slate-700',   icon: Clock },
  sent:      { label: 'Envoyée',   badgeCls: 'bg-blue-50 text-blue-700',      icon: ArrowUpRight },
  paid:      { label: 'Payée',     badgeCls: 'bg-green-50 text-green-700',    icon: CheckCircle2 },
  overdue:   { label: 'En retard', badgeCls: 'bg-red-50 text-red-700',      icon: AlertCircle },
  cancelled: { label: 'Annulée',   badgeCls: 'bg-slate-100 text-slate-500',   icon: XCircle },
};

const initialFormState = {
  reference: '',
  client_id: '',
  mission_id: '',
  amount_ht: 0,
  tva_rate: 18,
  status: 'draft',
  issue_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  notes: ''
};

export default function FacturationPage() {
  const supabaseFinance = createClient({ db: { schema: 'finance' } });
  const supabaseLogistics = createClient({ db: { schema: 'logistics' } });

  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tab, setTab] = useState<'invoices' | 'quotes' | 'credits' | 'clients'>('invoices');

  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [formData, setFormData] = useState(initialFormState);

  // Client CRUD states
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: invoicesData, error: iError } = await supabaseFinance
        .from('invoices')
        .select(`
          *,
          clients ( id, name )
        `)
        .order('created_at', { ascending: false });

      const { data: clientsData, error: cError } = await supabaseFinance
        .from('clients')
        .select('id, name, email, phone, address, tax_id')
        .order('name', { ascending: true });

      const { data: missionsData, error: mError } = await supabaseLogistics
        .from('missions')
        .select('id, reference, revenue');

      if (iError) throw iError;
      if (cError) throw cError;
      if (mError) throw mError;

      setInvoices(invoicesData || []);
      setClients(clientsData || []);
      setMissions(missionsData || []);
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingInvoice(null);
    const mockRef = `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      ...initialFormState,
      reference: mockRef,
      client_id: clients[0]?.id || '',
    });
    setShowModal(true);
  };

  const openEditModal = (inv: any) => {
    setEditingInvoice(inv);
    setFormData({
      reference: inv.reference,
      client_id: inv.client_id,
      mission_id: inv.mission_id || '',
      amount_ht: Number(inv.amount_ht),
      tva_rate: Number(inv.tva_rate),
      status: inv.status,
      issue_date: inv.issue_date,
      due_date: inv.due_date,
      notes: inv.notes || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
  };

  const handleMissionChange = (missionId: string) => {
    const selectedMission = missions.find(m => m.id === missionId);
    if (selectedMission) {
      const amountHt = Number(selectedMission.revenue || 0);
      setFormData(prev => ({
        ...prev,
        mission_id: missionId,
        amount_ht: amountHt
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        mission_id: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const amountHt = Number(formData.amount_ht);
      const tvaRate = Number(formData.tva_rate);
      const tvaAmount = amountHt * (tvaRate / 100);
      const amountTtc = amountHt + tvaAmount;

      const payload = {
        reference: formData.reference,
        client_id: formData.client_id,
        mission_id: formData.mission_id || null,
        amount_ht: amountHt,
        tva_rate: tvaRate,
        tva_amount: tvaAmount,
        amount_ttc: amountTtc,
        status: formData.status,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        notes: formData.notes || null
      };

      if (editingInvoice) {
        const { error } = await supabaseFinance
          .from('invoices')
          .update(payload)
          .eq('id', editingInvoice.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseFinance
          .from('invoices')
          .insert([payload]);
        if (error) throw error;
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error saving invoice:', err);
      alert('Erreur lors de l\'enregistrement de la facture.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const { error } = await supabaseFinance
        .from('invoices')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Erreur lors de l\'enregistrement du règlement.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;
    try {
      const { error } = await supabaseFinance
        .from('invoices')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  // Client CRUD Handlers
  const openClientAddModal = () => {
    setEditingClient(null);
    setClientFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      tax_id: ''
    });
    setShowClientModal(true);
  };

  const openClientEditModal = (client: any) => {
    setEditingClient(client);
    setClientFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      tax_id: client.tax_id || ''
    });
    setShowClientModal(true);
  };

  const closeClientModal = () => {
    setShowClientModal(false);
    setEditingClient(null);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: clientFormData.name,
        email: clientFormData.email || null,
        phone: clientFormData.phone || null,
        address: clientFormData.address || null,
        tax_id: clientFormData.tax_id || null
      };

      if (editingClient) {
        const { error } = await supabaseFinance
          .from('clients')
          .update(payload)
          .eq('id', editingClient.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseFinance
          .from('clients')
          .insert([payload]);
        if (error) throw error;
      }

      await fetchData();
      closeClientModal();
    } catch (err) {
      console.error('Error saving client:', err);
      alert('Erreur lors de l\'enregistrement du client.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClientDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cela pourrait affecter ses factures.')) return;
    try {
      const { error } = await supabaseFinance
        .from('clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  // Stats calculation
  const validInvoices = invoices.filter(i => i.status !== 'cancelled');
  const stats = {
    totalRevenue: validInvoices.reduce((s, i) => s + Number(i.amount_ttc), 0),
    collected:    validInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount_ttc), 0),
    pending:      validInvoices.filter(i => i.status === 'sent').reduce((s, i) => s + Number(i.amount_ttc), 0),
    overdue:      validInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + Number(i.amount_ttc), 0),
  };

  // Filter
  const filtered = invoices.filter(i => {
    const cName = i.clients?.name || '';
    const missionRef = missions.find(m => m.id === i.mission_id)?.reference || '';
    const matchSearch = search === '' ||
      i.reference.toLowerCase().includes(search.toLowerCase()) ||
      cName.toLowerCase().includes(search.toLowerCase()) ||
      missionRef.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredClients = clients.filter(c => {
    return search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.toLowerCase().includes(search.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()));
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm text-text-secondary">Chargement de la facturation...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Facturation</h1>
          <p className="text-sm text-text-secondary mt-0.5">Suivi des créances et encaissements</p>
        </div>
        <div className="flex gap-2">
          {tab === 'clients' ? (
            <button onClick={openClientAddModal} className="btn-primary text-xs">
              <Plus className="w-3.5 h-3.5" /> Nouveau Client
            </button>
          ) : (
            <button onClick={openAddModal} className="btn-primary text-xs">
              <Plus className="w-3.5 h-3.5" /> Nouvelle Facture
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        {[
          { key: 'invoices', label: 'Factures clients', count: invoices.length },
          { key: 'quotes',   label: 'Devis en cours',  count: 0 },
          { key: 'credits',  label: 'Avoirs émis',     count: 0 },
          { key: 'clients',  label: 'Clients',         count: clients.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              tab === t.key
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-surface-border'
            }`}
          >
            {t.label} <span className="ml-1.5 px-2 py-0.5 text-xs bg-surface-bg text-text-secondary rounded-full font-normal">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'invoices' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Volume facturé',   value: `${(stats.totalRevenue / 1_000_000).toFixed(2)}M XOF`, icon: FileText,     cls: 'bg-brand-50 text-brand-600' },
              { label: 'Total Encaissé',   value: `${(stats.collected / 1_000_000).toFixed(2)}M XOF`,    icon: CheckCircle2, cls: 'bg-green-50 text-green-700' },
              { label: 'En attente',       value: `${(stats.pending / 1_000_000).toFixed(2)}M XOF`,      icon: Clock,        cls: 'bg-blue-50 text-blue-700' },
              { label: 'Créances en retard',value: `${(stats.overdue / 1_000_000).toFixed(2)}M XOF`,    icon: AlertCircle,  cls: 'bg-red-50 text-red-700' },
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
                  placeholder="Rechercher par référence, client..."
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
                <option value="draft">Brouillons</option>
                <option value="sent">Envoyées</option>
                <option value="paid">Payées</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Client</th>
                    <th>Mission</th>
                    <th>Émission</th>
                    <th>Échéance</th>
                    <th className="text-right">Montant HT</th>
                    <th className="text-right">TVA (18%)</th>
                    <th className="text-right">Montant TTC</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => {
                    const S = STATUS_CONFIG[i.status] || { label: i.status, badgeCls: 'bg-gray-100 text-gray-700', icon: Clock };
                    const SIcon = S.icon;
                    const missionRef = missions.find(m => m.id === i.mission_id)?.reference || '—';

                    return (
                      <tr key={i.id} className="hover:bg-surface-hover/30 transition-all">
                        <td><span className="font-mono text-xs font-bold text-text-primary">{i.reference}</span></td>
                        <td className="font-medium text-text-primary text-sm">{i.clients?.name || 'N/A'}</td>
                        <td className="font-mono text-xs text-text-secondary">{missionRef}</td>
                        <td className="text-xs text-text-secondary">{new Date(i.issue_date).toLocaleDateString('fr-FR')}</td>
                        <td className="text-xs text-text-secondary">{new Date(i.due_date).toLocaleDateString('fr-FR')}</td>
                        <td className="text-right tabular-nums font-medium text-xs">{Number(i.amount_ht).toLocaleString('fr-FR')} XOF</td>
                        <td className="text-right tabular-nums text-text-muted text-xs">{Number(i.tva_amount).toLocaleString('fr-FR')} XOF</td>
                        <td className="text-right tabular-nums font-bold text-sm text-text-primary">{Number(i.amount_ttc).toLocaleString('fr-FR')} XOF</td>
                        <td>
                          <span className={`badge ${S.badgeCls}`}>
                            <SIcon className="w-3 h-3" />{S.label}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => openEditModal(i)}
                              className="btn-ghost p-1.5" 
                              title="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {i.status !== 'paid' && i.status !== 'cancelled' && (
                              <button 
                                onClick={() => handleMarkAsPaid(i.id)}
                                className="btn-ghost p-1.5 text-brand-600 hover:bg-brand-50" 
                                title="Enregistrer règlement"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(i.id)}
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
        </>
      ) : tab === 'clients' ? (
        <div className="section-card">
          <div className="p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                className="input pl-9"
                placeholder="Rechercher un client..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom du client</th>
                  <th>E-mail</th>
                  <th>Téléphone</th>
                  <th>Adresse</th>
                  <th>Identifiant fiscal (NIF)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(c => (
                  <tr key={c.id} className="hover:bg-surface-hover/30 transition-all">
                    <td><span className="font-semibold text-text-primary text-sm">{c.name}</span></td>
                    <td className="text-sm text-text-secondary">{c.email || '—'}</td>
                    <td className="text-sm text-text-secondary">{c.phone || '—'}</td>
                    <td className="text-xs text-text-secondary">{c.address || '—'}</td>
                    <td className="text-xs font-mono text-text-secondary">{c.tax_id || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openClientEditModal(c)}
                          className="btn-ghost p-1.5" 
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleClientDelete(c.id)}
                          className="btn-ghost p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" 
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="section-card p-12 text-center text-text-muted bg-white">
          <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30 text-brand-700" />
          <p className="text-sm font-semibold">Devis & Avoirs en cours de chargement</p>
          <p className="text-xs text-text-secondary mt-1">Le module est entièrement interconnecté avec Supabase et le service de facturation.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h3 className="text-lg font-bold text-text-primary">
                {editingInvoice ? 'Modifier la facture' : 'Créer une facture'}
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
                  <select
                    required
                    className="input"
                    value={formData.client_id}
                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Mission associée (Optionnel, charge le montant)</label>
                  <select
                    className="input font-mono"
                    value={formData.mission_id}
                    onChange={e => handleMissionChange(e.target.value)}
                  >
                    <option value="">Aucune mission</option>
                    {missions.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.reference} ({Number(m.revenue).toLocaleString('fr-FR')} XOF)
                      </option>
                    ))}
                  </select>
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
                    <option value="sent">Envoyée</option>
                    <option value="paid">Payée</option>
                    <option value="overdue">En retard</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
                <div>
                  <label className="label">Montant HT (XOF) *</label>
                  <input
                    type="number"
                    required
                    className="input font-semibold"
                    value={formData.amount_ht}
                    onChange={e => setFormData({ ...formData, amount_ht: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Taux TVA (%) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.tva_rate}
                    onChange={e => setFormData({ ...formData, tva_rate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Date d'émission *</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.issue_date}
                    onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Date d'échéance *</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Calculs (HT + 18% TVA = TTC)</label>
                  <div className="p-3 bg-surface-bg border border-surface-border rounded-lg text-sm text-text-secondary flex justify-between">
                    <span>HT: <strong>{Number(formData.amount_ht).toLocaleString('fr-FR')} XOF</strong></span>
                    <span>TVA ({formData.tva_rate}%): <strong>{(Number(formData.amount_ht) * (Number(formData.tva_rate) / 100)).toLocaleString('fr-FR')} XOF</strong></span>
                    <span className="text-brand-700">TTC: <strong>{(Number(formData.amount_ht) * (1 + Number(formData.tva_rate) / 100)).toLocaleString('fr-FR')} XOF</strong></span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Notes / Conditions de règlement</label>
                  <textarea
                    className="input h-20"
                    placeholder="Facturation des prestations logistiques..."
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

      {/* Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h3 className="text-lg font-bold text-text-primary">
                {editingClient ? 'Modifier le client' : 'Ajouter un client'}
              </h3>
              <button onClick={closeClientModal} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClientSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nom de l'entreprise / Client *</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="TOTAL Énergies"
                  value={clientFormData.name}
                  onChange={e => setClientFormData({ ...clientFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Adresse e-mail</label>
                <input
                  type="email"
                  className="input"
                  placeholder="contact@total.sn"
                  value={clientFormData.email}
                  onChange={e => setClientFormData({ ...clientFormData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Numéro de téléphone</label>
                <input
                  type="text"
                  className="input"
                  placeholder="+221 33 800 00 00"
                  value={clientFormData.phone}
                  onChange={e => setClientFormData({ ...clientFormData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Adresse physique</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Route de l'Aéroport, Dakar"
                  value={clientFormData.address}
                  onChange={e => setClientFormData({ ...clientFormData, address: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Identifiant fiscal (NIF / RC)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="NIF-1234567-A"
                  value={clientFormData.tax_id}
                  onChange={e => setClientFormData({ ...clientFormData, tax_id: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={closeClientModal}
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
