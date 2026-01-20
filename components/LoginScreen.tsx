
import React, { useState } from 'react';
import { Car, Mail, Lock, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Capacitor } from '@capacitor/core';

interface LoginScreenProps {
  onLogin: () => void;
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isManual, setIsManual] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const platform = Capacitor.getPlatform();
    const isNative = platform === 'android' || platform === 'ios';
    const redirectTo = isNative
      ? 'com.autocareia://auth-callback'
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '?reset=true',
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccess(null);
      }, 5000);
    }
    setLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess("Conta criada! Verifique seu e-mail ou faça login.");
        setIsSignUp(false);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("E-mail ou senha incorretos.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-indigo-600 via-violet-700 to-fuchsia-700 flex flex-col items-center justify-end p-6 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-20%] w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[20%] right-[-10%] w-60 h-60 bg-fuchsia-500/20 rounded-full blur-3xl" />

      <div className="flex-1 flex flex-col items-center justify-center text-white text-center space-y-4 z-10">
        <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-xl border border-white/30 shadow-2xl animate-bounce">
          <Car size={64} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-black tracking-tight">AutoCare IA</h1>
        <p className="text-indigo-100 font-medium max-w-[250px]">Gestão inteligente do seu veículo.</p>
      </div>

      <div className="w-full bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl z-10 space-y-6">
        {!isManual ? (
          <>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Acesse sua garagem</h2>
              <p className="text-slate-500 text-sm">Organize a manutenção do seu veículo.</p>
            </div>

            <div className="space-y-3">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold border border-emerald-100 animate-in fade-in">
                  {success}
                </div>
              )}
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-4 rounded-2xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <GoogleIcon />} Continuar com Google
              </button>
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ou use e-mail</span>
                <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
              </div>
              <button onClick={() => setIsManual(true)} className="w-full flex items-center justify-center gap-3 bg-indigo-600 py-4 rounded-2xl font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">
                <Mail size={20} /> Entrar com E-mail
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <button onClick={() => { setIsManual(false); setIsSignUp(false); setIsForgotPassword(false); setError(null); setSuccess(null); }} className="text-indigo-600 text-sm font-bold flex items-center gap-1">
              Voltar
            </button>

            {isForgotPassword ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Recuperar Senha</h2>
                <p className="text-slate-500 text-sm">Insira seu e-mail para receber as instruções.</p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seu e-mail cadastrado"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 py-4 rounded-2xl font-bold text-white shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : 'Enviar e-mail'}
                  </button>
                  {error && <p className="text-red-500 text-[10px] font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}
                  {success && <p className="text-emerald-500 text-[10px] font-bold text-center bg-emerald-50 p-2 rounded-lg">{success}</p>}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-xs font-bold text-slate-400 hover:text-indigo-600"
                    >
                      Voltar para o Login
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{isSignUp ? 'Criar Conta' : 'Login Manual'}</h2>
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                    />
                  </div>

                  {!isSignUp && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs font-bold text-indigo-500 hover:text-indigo-700"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 py-4 rounded-2xl font-bold text-white shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : (isSignUp ? 'Cadastrar' : 'Entrar agora')}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-700 underline"
                    >
                      {isSignUp ? 'Já tem conta? Fazer Login' : 'Não tem conta? Criar agora'}
                    </button>
                  </div>

                  {error && (
                    <p className="text-red-500 text-[10px] font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>
                  )}
                  {success && (
                    <p className="text-emerald-500 text-[10px] font-bold text-center bg-emerald-50 p-2 rounded-lg">{success}</p>
                  )}
                </form>
              </>
            )}
          </div>
        )}

        <div className="mt-8 text-center bg-white/10 backdrop-blur-sm py-3 px-6 rounded-2xl border border-white/10">
          <p className="text-[10px] text-white font-bold tracking-widest uppercase opacity-70 mb-2">Segurança AutoCare</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://sites.google.com/view/politicadeprivacidadeautocare/in%C3%ADcio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-indigo-200 font-black uppercase hover:underline"
            >
              Política de Privacidade
            </a>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-[9px] text-slate-400 font-bold uppercase">Versão 1.0.18</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
