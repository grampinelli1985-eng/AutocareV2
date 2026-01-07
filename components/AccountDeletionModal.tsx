
import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface AccountDeletionModalProps {
    isOpen: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
    isOpen,
    isDeleting,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center p-6 bg-red-600/10 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border-4 border-red-100 dark:border-red-900/30 text-center space-y-6 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full mx-auto flex items-center justify-center">
                    <Trash2 size={40} className="text-red-600" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-red-600 uppercase tracking-tight">Excluir Conta?</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Esta ação é irreversível</p>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Ao excluir sua conta, todos os veículos, históricos de manutenção e configurações serão apagados permanentemente de nossos servidores.
                </p>
                <div className="space-y-3 pt-2">
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="w-full bg-red-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Sim, Excluir Tudo"}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                    >
                        Cancelar e Manter Dados
                    </button>
                </div>
            </div>
        </div>
    );
};
