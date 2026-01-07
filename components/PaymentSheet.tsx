
import React from 'react';
import { CreditCard, Loader2, Fingerprint, Car as CarIcon } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface PaymentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing: boolean;
    userEmail: string | null;
}

export const PaymentSheet: React.FC<PaymentSheetProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isProcessing,
    userEmail,
}) => {
    if (!isOpen) return null;

    const platform = Capacitor.getPlatform();

    return (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <CarIcon size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black dark:text-white">AutoCare IA Premium</h3>
                        <p className="text-sm text-slate-500 font-medium italic">Assinatura Mensal</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xl font-black text-slate-800 dark:text-white">R$ 15,99</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">por mês</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conta</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{userEmail || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plataforma</span>
                        <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-indigo-600" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {platform === 'android' ? 'Google Play Store' : 'Pagamento Seguro Web'}
                            </span>
                        </div>
                    </div>
                </div>

                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 size={40} className="text-indigo-600 animate-spin" />
                        <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Processando Compra...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={onConfirm}
                            className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
                        >
                            <Fingerprint size={24} />
                            <span className="uppercase text-xs tracking-widest">
                                {platform === 'android' ? 'Assinar com Google Play' : 'Ir para Pagamento Seguro'}
                            </span>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                        >
                            Cancelar Transação
                        </button>
                    </div>
                )}

                <p className="text-[10px] text-slate-400 text-center mt-6 leading-relaxed">
                    Cobrança recorrente. Você pode cancelar a qualquer momento nas configurações da sua conta na loja de aplicativos.
                </p>
            </div>
        </div>
    );
};
