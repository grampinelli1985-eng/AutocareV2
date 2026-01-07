
import React from 'react';
import { Activity, X } from 'lucide-react';

interface FuelAdviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    tips: string[];
}

export const FuelAdviceModal: React.FC<FuelAdviceModalProps> = ({
    isOpen,
    onClose,
    tips
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-2xl text-indigo-600 dark:text-indigo-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Dicas de Consumo</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Personalizadas para seu veículo</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 bg-slate-100 dark:bg-white/5 rounded-full"><X size={20} /></button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {tips.map((tip, idx) => (
                        <div key={idx} className="flex gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-white/5">
                            <div className="shrink-0 w-1.5 bg-indigo-400 rounded-full" />
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{tip}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
};
