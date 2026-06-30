'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, AlertTriangle, Sparkles, Brain, Cpu, MessageSquare,
  TrendingDown, FileText, ChevronRight, User, HelpCircle, ArrowUpRight
} from 'lucide-react';

const RECOMMENDATIONS = [
  { id: '1', title: 'Alerte Maintenance Prédictive', desc: 'Le camion TN-7701-EF montre une hausse de consommation (+8%) indiquant un encrassement potentiel des filtres ou une anomalie moteur.', type: 'maintenance' },
  { id: '2', title: 'Optimisation de Rentabilité', desc: 'La liaison Dakar-Kaolack présente une baisse de marge moyenne à 22%. Il est conseillé de renégocier les tarifs de gros avec SONACOS.', type: 'finance' },
  { id: '3', title: 'Prévision de Trésorerie', desc: 'Les encaissements prévus au 15 juillet permettront de couvrir 120% des dépenses fixes du mois.', type: 'treasury' },
];

export default function IAAssistantPage() {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([    { sender: 'ai', text: 'Bonjour ! Je suis l\'Assistant Intelligent de "Le Grand Transporteur". Je peux analyser vos données logistiques, prédire les pannes de flotte, et estimer la rentabilité financière de vos missions. Posez-moi vos questions.', time: '14:30' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: input, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "Je traite votre demande de rapport. D'après mes calculs récents sur la base de données, la rentabilité globale de la flotte est en hausse de 2.4% ce mois-ci, portée par les missions de transport d'hydrocarbures pour SHELL.";
      if (input.toLowerCase().includes('camion') || input.toLowerCase().includes('panne') || input.toLowerCase().includes('flotte')) {
        response = "Analyse de la flotte : le véhicule TN-7701-EF (MAN TGX) présente une hausse anormale de consommation de carburant de 11.5% sur les 3 dernières missions. Un contrôle de la pression des pneus et du système d'injection est recommandé sous 7 jours.";
      } else if (input.toLowerCase().includes('rentabilité') || input.toLowerCase().includes('argent') || input.toLowerCase().includes('marge')) {
        response = "Analyse financière : la marge moyenne de vos missions est de 38.4%. Les missions les plus rentables sont effectuées par Oumar Seck sur le véhicule TN-1102-GH pour TOTAL Énergies (41.8% de marge moyenne).";
      } else if (input.toLowerCase().includes('trésorerie') || input.toLowerCase().includes('flux') || input.toLowerCase().includes('cash')) {
        response = "Prévision de trésorerie : les encaissements prévus au 15 juillet (3 factures échéant : SONACOS, SHELL, TOTAL) permettront de couvrir 120% des charges fixes du mois. Un excédent de 18.2M XOF est anticipé.";
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: 'ai' as const,
        text: response,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1400);
  };

  const handleSuggestion = (q: string) => {
    setInput(q);
  };

  return (
    <div className="p-6 h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Brain className="w-6 h-6 text-brand-700" /> Assistant IA prédictif
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">Analyses prédictives, détection d'anomalies de flotte et finance</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Left chat panel */}
        <div className="flex-1 section-card flex flex-col min-h-0 bg-white">
          <div className="p-4 border-b border-surface-border flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-soft" />
            <span className="text-xs font-semibold text-text-primary">LGT IA Assistant (En ligne)</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 max-w-[80%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.sender === 'ai' ? 'bg-brand-50 text-brand-700 border border-brand-100' : 'bg-slate-200 text-slate-700'
                }`}>
                  {m.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`p-3.5 rounded-xl text-sm ${
                  m.sender === 'ai'
                    ? 'bg-brand-50 text-text-primary border border-brand-100/50 rounded-tl-none'
                    : 'bg-brand-700 text-white rounded-tr-none'
                }`}>
                  <p className="leading-relaxed">{m.text}</p>
                  <span className={`text-[10px] block mt-1.5 ${m.sender === 'user' ? 'text-blue-200' : 'text-text-muted'}`}>{m.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-50 text-brand-700 border border-brand-100">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-100/50 rounded-tl-none">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSend} className="p-4 border-t border-surface-border flex gap-2">
            <input
              className="input flex-1"
              placeholder="Posez une question sur la rentabilité de la flotte, la maintenance ou la trésorerie..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              <Send className="w-4 h-4" /> Envoyer
            </button>
          </form>
        </div>

        {/* Right insights panel */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto hidden lg:flex flex-shrink-0 min-h-0">
          <div className="section-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Analyse prédictive active</h2>
            <div className="space-y-3">
              {RECOMMENDATIONS.map(r => (
                <div key={r.id} className="p-3 bg-surface-bg border border-surface-border rounded-lg space-y-2 hover:border-brand-300 transition-all duration-150">
                  <div className="flex items-center gap-1.5">
                    {r.type === 'maintenance' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Sparkles className="w-4 h-4 text-brand-700" />}
                    <h3 className="text-xs font-bold text-text-primary">{r.title}</h3>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-brand-700" /> Suggestions de questions</h2>
            <div className="space-y-1">
              {[
                'Quel camion risque une panne moteur ?',
                'Quelle est la marge brute moyenne de SHELL ?',
                'Prévisions de flux de trésorerie pour le mois prochain',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  className="w-full text-left p-2 hover:bg-surface-bg rounded text-xs text-text-secondary hover:text-text-primary transition-all duration-150 flex items-center justify-between group"
                >
                  <span>{q}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-brand-700 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
