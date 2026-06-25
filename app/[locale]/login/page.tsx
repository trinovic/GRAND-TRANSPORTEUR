'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Truck, Shield, Globe } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [locale, setLocale] = useState('fr');

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Demo: simulate network call
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    setStep('mfa');
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsLoading(false);
    // Redirect to dashboard
    window.location.href = `/${locale}/dashboard`;
  };

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-800 relative overflow-hidden flex-col justify-between p-12">
        {/* Pattern background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-brand-600 rounded-full opacity-30" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-900 rounded-full opacity-40" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Le Grand Transporteur</p>
            <p className="text-blue-200 text-xs font-medium tracking-wide uppercase">ERP Platform</p>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Pilotez votre<br />entreprise en<br />
            <span className="text-blue-300">temps réel.</span>
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-sm">
            Gestion intégrée du transport, de la logistique et des finances — conçu pour l'Afrique.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['14 Modules', 'Multi-devises', 'BI & IA', 'Temps réel', 'Mobile'].map((f) => (
              <span key={f} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Security badge */}
        <div className="relative z-10 flex items-center gap-2 text-blue-200 text-sm">
          <Shield className="w-4 h-4" />
          <span>JWT · MFA · AES-256 · RLS Supabase</span>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">

        {/* Locale switcher */}
        <div className="absolute top-6 right-6 flex items-center gap-1">
          <Globe className="w-4 h-4 text-text-secondary" />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="text-sm text-text-secondary bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="w-full max-w-sm animate-fade-in">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-brand-700 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-text-primary text-base">Le Grand Transporteur</span>
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-1">
            {step === 'credentials' ? t('auth.welcome') : 'Vérification 2FA'}
          </h2>
          <p className="text-text-secondary text-sm mb-8">
            {step === 'credentials' ? t('auth.subtitle') : 'Entrez le code de votre application d\'authentification'}
          </p>

          {step === 'credentials' ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label className="label">{t('auth.email')}</label>
                <input
                  type="email"
                  className="input"
                  placeholder="directeur@legrandtransporteur.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">{t('auth.password')}</label>
                  <button type="button" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    {t('auth.forgot_password')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center py-2.5 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Connexion...
                  </span>
                ) : t('auth.sign_in')}
              </button>

              {/* Demo accounts */}
              <div className="mt-6 p-4 bg-surface-bg rounded-lg border border-surface-border">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Comptes de démonstration</p>
                <div className="space-y-2">
                  {[
                    { label: 'Directeur Général', email: 'dg@demo.com', role: 'dg' },
                    { label: 'DAF', email: 'daf@demo.com', role: 'daf' },
                    { label: 'Responsable Logistique', email: 'log@demo.com', role: 'logistique' },
                  ].map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => { setEmail(acc.email); setPassword('demo1234'); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border border-surface-border hover:border-brand-200 hover:bg-brand-50 transition-all text-left"
                    >
                      <span className="font-medium text-text-primary">{acc.label}</span>
                      <span className="text-text-muted">{acc.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMfa} className="space-y-4">
              <div>
                <label className="label">{t('auth.mfa_code')}</label>
                <input
                  type="text"
                  className="input text-center text-xl tracking-widest font-mono"
                  placeholder="000 000"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
                <p className="text-xs text-text-muted mt-2 text-center">
                  Code valide 30 secondes · Google Authenticator / Authy
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || mfaCode.length < 6}
                className="btn-primary w-full justify-center py-2.5"
              >
                {isLoading ? 'Vérification...' : 'Vérifier'}
              </button>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="btn-ghost w-full justify-center text-sm"
              >
                ← Retour
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 text-xs text-text-muted">
          © 2026 Le Grand Transporteur · ERP v1.0 · Tous droits réservés
        </p>
      </div>
    </div>
  );
}
