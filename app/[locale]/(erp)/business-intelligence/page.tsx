'use client';

import { useState } from 'react';
import {
  BarChart2, TrendingUp, TrendingDown, DollarSign, Award, Truck,
  Users, Calendar, Filter, Download, ArrowUpRight, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

const marginTrend = [
  { month: 'Jan', hydrocarbures: 35, conteneurs: 28, vrac: 20 },
  { month: 'Fév', hydrocarbures: 37, conteneurs: 29, vrac: 21 },
  { month: 'Mar', hydrocarbures: 42, conteneurs: 31, vrac: 22 },
  { month: 'Avr', hydrocarbures: 40, conteneurs: 30, vrac: 24 },
  { month: 'Mai', hydrocarbures: 41, conteneurs: 33, vrac: 23 },
  { month: 'Jun', hydrocarbures: 45, conteneurs: 35, vrac: 25 },
];

const customerProfitability = [
  { name: 'SHELL Sénégal', revenue: 28400000, margin: 45 },
  { name: 'SONACOS', revenue: 19500000, margin: 40 },
  { name: 'TOTAL Énergies', revenue: 34200000, margin: 42 },
  { name: 'Bolloré Logistics', revenue: 52100000, margin: 35 },
  { name: 'SENELEC', revenue: 41000000, margin: 38 },
];

const COLORS = ['#1D4ED8', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

export default function BIPage() {
  const [range, setRange] = useState('6m');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Business Intelligence</h1>
          <p className="text-sm text-text-secondary mt-0.5">Analyses décisionnelles et rentabilité de l'entreprise</p>
        </div>
        <div className="flex gap-2">
          <select
            className="input w-auto text-xs"
            value={range}
            onChange={e => setRange(e.target.value)}
          >
            <option value="1m">Dernier mois</option>
            <option value="3m">Derniers 3 mois</option>
            <option value="6m">Derniers 6 mois</option>
            <option value="12m">Dernière année</option>
          </select>
          <button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> Exporter le rapport</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Marge opérationnelle', value: '38.4%',       icon: TrendingUp,   cls: 'bg-green-50 text-green-700' },
          { label: 'Coût au kilomètre',   value: '1 240 XOF',    icon: Truck,        cls: 'bg-blue-50 text-blue-700' },
          { label: 'Taux de charge utile',value: '84.2%',       icon: BarChart2,    cls: 'bg-brand-50 text-brand-600' },
          { label: 'Rentabilité client max',value: '45.0%',       icon: Award,        cls: 'bg-purple-50 text-purple-600' },
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margin Trend Chart */}
        <div className="section-card p-6">
          <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-brand-700" /> Évolution de la marge par activité (%)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marginTrend}>
                <defs>
                  <linearGradient id="colorHydro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorCont" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
                <Legend iconType="circle" />
                <Area type="monotone" name="Hydrocarbures" dataKey="hydrocarbures" stroke="#1D4ED8" fillOpacity={1} fill="url(#colorHydro)" strokeWidth={2} />
                <Area type="monotone" name="Conteneurs" dataKey="conteneurs" stroke="#10B981" fillOpacity={1} fill="url(#colorCont)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Profitability */}
        <div className="section-card p-6">
          <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-brand-700" /> Rentabilité des 5 principaux clients</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerProfitability}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1_000_000).toFixed(0)}M`} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
                <Legend iconType="circle" />
                <Bar name="CA Facturé (XOF)" dataKey="revenue" fill="#1D4ED8" radius={[4, 4, 0, 0]}>
                  {customerProfitability.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Profitability Table */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="text-sm font-bold text-text-primary">Analyse de rentabilité par client</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th className="text-right">Chiffre d'Affaires</th>
                <th className="text-right">Taux de Marge Moyen</th>
                <th className="text-right">Nombre de missions</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {customerProfitability.map((c, i) => (
                <tr key={c.name} className="cursor-pointer">
                  <td className="font-semibold text-text-primary">{c.name}</td>
                  <td className="text-right tabular-nums font-semibold">{c.revenue.toLocaleString('fr-FR')} XOF</td>
                  <td className="text-right font-bold">
                    <span className={c.margin >= 40 ? 'text-green-600' : 'text-amber-600'}>
                      {c.margin}%
                    </span>
                  </td>
                  <td className="text-right tabular-nums">{(c.revenue / 2_000_000).toFixed(0)}</td>
                  <td><span className="badge bg-green-50 text-green-700">Rentable</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
