
import React from 'react';
import { Scale, Loader2, Sparkles } from 'lucide-react';
import { FipeData } from '../services/fipeService';

interface FipeCardProps {
    fipeData: FipeData | null;
    isLoading: boolean;
    conservationScore: number;
}

export const FipeCard: React.FC<FipeCardProps> = ({
    fipeData,
    isLoading,
    conservationScore
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />

            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Scale size={18} className="text-emerald-500" />
                        <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">Valor de Mercado</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Referência Tabela FIPE</p>
                </div>
                {isLoading && <Loader2 size={16} className="text-indigo-600 animate-spin" />}
            </div>

            {fipeData ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Oficial</span>
                        <span className="text-lg font-black text-slate-800 dark:text-white leading-none">{fipeData.Valor}</span>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 rounded-[28px] shadow-lg shadow-indigo-200 dark:shadow-none">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-[9px] font-black text-indigo-100 uppercase tracking-widest">Valor de Revenda AutoCare</p>
                            <div className="bg-white/20 px-2 py-0.5 rounded-full text-[8px] font-bold text-white uppercase tracking-tighter">Estimado</div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white tracking-tighter">
                                {(parseFloat(fipeData.Valor.replace(/[^\d]/g, '')) / 100 * (1 + (conservationScore > 80 ? 0.05 : conservationScore > 60 ? 0.02 : 0))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Sparkles size={10} className="text-amber-300" />
                                <p className="text-[9px] text-indigo-100 font-bold">Valor médio com bônus de conservação</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-[8px] text-slate-400 font-bold uppercase text-center mt-2 tracking-widest">Ref: {fipeData.MesReferencia}</p>
                </div>
            ) : !isLoading ? (
                <div className="py-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Não foi possível obter<br />o valor deste modelo</p>
                </div>
            ) : (
                <div className="py-10 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase animate-pulse">Consultando FIPE...</p>
                </div>
            )}
        </div>
    );
};
