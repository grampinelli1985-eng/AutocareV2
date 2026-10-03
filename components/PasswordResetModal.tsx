import React, { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface PasswordResetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirm) {
            setError('As senhas não conferem.');
            return;
        }

        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        setPassword('');
        setConfirm('');
        alert('Senha alterada com sucesso!');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[3100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 border border-indigo-100 dark:border-indigo-900">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl mx-auto flex items-center justify-center">
                        <KeyRound size={32} className="text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Nova Senha</h2>
                    <p className="text-xs text-slate-500 font-bold">Defina uma nova senha para sua conta.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        required
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nova senha"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                    />
                    <input
                        required
                        type="password"
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Confirme a nova senha"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                    />
                    {error && <p className="text-red-500 text-[10px] font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black active:scale-95 shadow-xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Salvar Nova Senha'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                    >
                        Agora não
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordResetModal;
