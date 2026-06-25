'use client';

import { useState } from 'react';
import {
  Fuel, Plus, Search, Filter, Eye, AlertTriangle, CheckCircle,
  TrendingDown, TrendingUp, DollarSign, Calendar, Truck, ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const FUEL_LOGS = [
  { id: '1', date: '2026-06-25', vehicle: 'TN-4821-AB', driver: 'Ibrahima Diallo', liters: 240, pricePerLiter: 675, total: 162_000, km: 187_420, station: 'TOTAL Patte d\'Oie', consumption: 32.5 },
  { id: '2', date: '2026-06-24', vehicle: 'TN-3356-CD', driver: 'Moussa Traoré',   liters: 320, pricePerLiter: 675, total: 216_000, km: 241_100, station: 'SHELL Diamniadio', consumption: 29.8 },
  { id: '3', date: '2026-06-24', vehicle: 'TN-1102-GH', driver: 'Oumar Seck',      liters: 280, pricePerLiter: 675, total: 189_000, km: 98_300,  station: 'TOTAL Kaolack',     consumption: 31.2 },
  { id: '4', date: '2026-06-23', vehicle: 'TN-9901-OP', driver: 'Aliou Ba',        liters: 350, pricePerLiter: 675, total: 236_250, km: 203_700, station: 'SHELL Saint-Louis', consumption: 33.1 },
  { id: '5', date: '2026-06-22', vehicle: 'TN-2234-KL', driver: 'Cheikh Fall',     liters: 60,  pricePerLiter: 675, total: 40_500,  km: 42_100,  station: 'TOTAL Dakar VDN',   consumption: 11.5 },
  { id: '6', date: '2026-06-21', vehicle: 'TN-5567-MN', driver: 'Amadou Diop',     liters: 190, pricePerLiter: 675, total: 128_250, km: 156_200, station: 'SHELL Touba',       consumption: 28.6 },
];

const fuelConsumptionData = [
  { day: 'Lun', cost: 350000 },
  { day: 'Mar', cost: 420000 },
  { day: 'Mer', cost: 380000 },
  { day: 'Jeu', cost: 405000 },
  { day: 'Ven', cost: 520000 },
  { day: 'Sam', cost: 240000 },
  { day: 'Dim', cost: 950000 },
];

export default function CarburantPage() {
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const stats = {
    totalSpent: FUEL_LOGS.reduce((s, l) => s + l.total, 0),
    totalLiters: FUEL_LOGS.reduce((s, l) => s + l.liters, 0),
    avgConsumption: (FUEL_LOGS.reduce((s, l) => s + l.consumption, 0) / FUEL_LOGS.length).toFixed(1),
    anomalies: FUEL_LOGS.filter(l => l.consumption > 32).length,
  };

  const filtered = FUEL_LOGS.filter(l => {
    const matchSearch = search === '' ||
      l.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      l.driver.toLowerCase().includes(search.toLowerCase()) ||
      l.station.toLowerCase().includes(search.toLowerCase());
    const matchVehicle = vehicleFilter === 'all' || l.vehicle === vehicleFilter;
    return matchSearch && matchVehicle;
  });

  const vehicles = Array.from(new Set(FUEL_LOGS.map(l => l.vehicle)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Gestion du Carburant</h1>
          <p className="text-sm text-text-secondary mt-0.5">Suivi de la consommation et des dépenses de carburant</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> Saisir un plein
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Dépenses carburant', value: `${stats.totalSpent.toLocaleString('fr-FR')} XOF`, icon: DollarSign, cls: 'bg-brand-50 text-brand-600' },
          { label: 'Volume total acheté', value: `${stats.totalLiters.toLocaleString('fr-FR')} L`,   icon: Fuel,       cls: 'bg-blue-50 text-blue-700' },
          { label: 'Conso moyenne PL',  value: `${stats.avgConsumption} L/100km`,                  icon: TrendingDown, cls: 'bg-green-50 text-green-700' },
          { label: 'Alertes anomalies', value: stats.anomalies,                                     icon: AlertTriangle, cls: stats.anomalies > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700' },
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

      {/* Chart Section */}
      <div className="section-card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-1.5"><Fuel className="w-4 h-4 text-brand-700" /> Évolution quotidienne des coûts de carburant</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fuelConsumptionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000)}k`} />
              <Tooltip formatter={(v) => [`${Number(v).toLocaleString('fr-FR')} XOF`, 'Dépense']} contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: '#3B82F6', strokeWidth: 1 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table section */}
      <div className="section-card">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-9"
              placeholder="Rechercher par véhicule, chauffeur, station..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={vehicleFilter}
            onChange={e => setVehicleFilter(e.target.value)}
          >
            <option value="all">Tous les véhicules</option>
            {vehicles.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Véhicule</th>
                <th>Chauffeur</th>
                <th>Volume (L)</th>
                <th className="text-right">Prix Unitaire</th>
                <th className="text-right">Montant Total</th>
                <th className="text-right">Kilométrage</th>
                <th>Station-service</th>
                <th>Rapport Conso</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const isConsoHigh = l.consumption > 32;
                return (
                  <tr key={l.id} className="cursor-pointer">
                    <td className="text-xs text-text-secondary">{new Date(l.date).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {l.vehicle}
                      </span>
                    </td>
                    <td className="font-semibold text-xs text-text-primary">{l.driver}</td>
                    <td className="font-medium text-xs text-text-primary tabular-nums">{l.liters} L</td>
                    <td className="text-right text-text-secondary text-xs tabular-nums">{l.pricePerLiter} XOF</td>
                    <td className="text-right font-bold text-text-primary text-xs tabular-nums">{l.total.toLocaleString('fr-FR')} XOF</td>
                    <td className="text-right font-mono text-xs tabular-nums">{l.km.toLocaleString('fr-FR')} km</td>
                    <td className="text-xs text-text-primary">{l.station}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold text-xs ${isConsoHigh ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                          {l.consumption} L/100
                        </span>
                        {isConsoHigh && <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse-soft" />}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost p-1.5" title="Voir reçu"><Eye className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
