'use client';

import React, { useState } from 'react';
import { AuthUser, authApiService } from '../services/AuthApiService';
import { KeyRound, Mail, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';

interface AuthGateProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export function AuthGate({ onLoginSuccess }: AuthGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authApiService.login(email, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid credentials or request failed.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      const res = await authApiService.loginAsDemo();
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      }
    } catch {
      setError('Failed to initiate demo session.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@example.com');
    setPassword('demo1234');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
            OI
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline text-slate-900 tracking-tight">Opportunity Intel</h1>
            <p className="text-xs text-slate-500 font-medium">Upwork Pro Intelligence Engine</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mb-6">
          <h2 className="text-base font-semibold text-slate-900">Sign In to Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">Enter your application credentials to access workspace.</p>
        </div>

        {/* Demo Mode Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Studio Preview Mode</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              Fill Demo Info
            </button>
          </div>
          <p className="text-[11px] text-emerald-800/90 leading-relaxed">
            Testing without a live local Laravel backend? Click below for instant one-click preview access.
          </p>
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={isDemoLoading || isLoading}
            className="w-full mt-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isDemoLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Launching Preview...</span>
              </>
            ) : (
              <>
                <span>Sign In with Demo Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white px-2.5 text-slate-400 font-semibold tracking-wider">
              Or Use Credentials
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isDemoLoading}
            className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-medium text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-6">
          Local development: Use <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">php artisan tinker</code> to create local accounts.
        </p>
      </div>
    </div>
  );
}
