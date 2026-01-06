
import React from 'react';
import { ShieldAlert, X, Sparkles } from 'lucide-react';

interface TheftReportModalProps {
    isOpen: boolean;
    userPlan: 'free' | 'premium';
    brazilianStates: string[];
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const TheftReportModal: React.FC<TheftReportModalProps> = ({
    isOpen,
    userPlan,
    brazilianStates,
    onClose,
    onSubmit
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10">
                    <h3 className="font-bold text-red-600 flex items-center gap-2"><ShieldAlert size={20} /> Alertar de Roubo</h3>
                    <button onClick={onClose} className="p-1 text-slate-400"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    {userPlan === 'free' && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 flex gap-3 items-start animate-in slide-in-from-top-2">
                            <div className="bg-amber-100 dark:bg-amber-900/40 p-1.5 rounded-lg text-amber-700 dark:text-amber-400 mt-0.5"><Sparkles size={14} /></div>
                            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 leading-tight">Usuários do plano Free emitem alertas em um raio de 50 km. Para alcance nacional, ative o plano Premium.</p>
                        </div>
                    )}
                    <select required name="state" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm">
                        <option value="">Estado (UF)</option>
                        {brazilianStates.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                    <input required name="city" placeholder="Cidade" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm" />
                    <input required name="neighborhood" placeholder="Bairro" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm" />
                    <textarea required name="description" placeholder="Visto por último em / Características do veículo..." className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm h-24 resize-none" />
                    <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100">
                        <input required name="declaration" type="checkbox" className="mt-1" />
                        <p className="text-[11px] font-bold text-red-700">Declaro que sou o proprietário legal do veículo e que registrei boletim de ocorrência.</p>
                    </div>
                    <button type="submit" className="w-full bg-red-600 py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95">Emitir Alerta Urgente</button>
                </form>
            </div>
        </div>
    );
};

export default TheftReportModal;
