
import React from 'react';
import { Activity } from 'lucide-react';

interface HealthExplanationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HealthExplanationModal: React.FC<HealthExplanationModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 text-center">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mx-auto flex items-center justify-center">
                    <Activity size={40} className="text-indigo-600" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">O que é a Saúde?</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Entenda como calculamos este índice</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-left space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        A <strong>IA da AutoCare</strong> analisa diversos fatores para chegar a este percentual:
                    </p>
                    <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <li className="flex items-start gap-3">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span><strong>Quilometragem:</strong> Comparação com o plano de manutenção do fabricante.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span><strong>Histórico:</strong> Se os serviços preventivos estão sendo registrados em dia.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span><strong>Idade:</strong> O desgaste natural de componentes por tempo.</span>
                        </li>
                    </ul>
                </div>
                <button
                    onClick={onClose}
                    className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95"
                >
                    Entendi
                </button>
            </div>
        </div>
    );
};
