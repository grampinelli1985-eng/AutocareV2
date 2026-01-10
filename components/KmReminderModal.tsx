
import React from 'react';
import { Crown, Gauge, Sparkles, X } from 'lucide-react';

interface KmReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const KmReminderModal: React.FC<KmReminderModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[320] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in transition-all">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Background Sparkles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[32px] flex items-center justify-center shadow-xl shadow-amber-200 dark:shadow-none rotate-3">
                            <Gauge size={40} className="text-white" />
                        </div>
                        <div className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 animate-bounce-slow">
                            <Crown size={20} className="text-amber-500 fill-amber-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Exclusivo Premium</p>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                            Mantenha o KM atualizado!
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            Para que nossa IA possa analisar a saúde do seu veículo com precisão e gerar dicas exclusivas no Radar Preventivo, lembre-se de atualizar a quilometragem regularmente.
                        </p>
                    </div>

                    <div className="w-full space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex gap-3 items-start text-left">
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl text-amber-600">
                                <Sparkles size={16} />
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold leading-tight uppercase">
                                Novas dicas da IA aparecem assim que você atualiza o KM.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
                        >
                            Entendido, manterei atualizado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KmReminderModal;
