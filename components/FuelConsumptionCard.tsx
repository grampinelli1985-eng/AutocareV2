
import React from 'react';
import { Activity, Zap, PlusCircle } from 'lucide-react';

interface FuelConsumptionCardProps {
    averageConsumption: number | null;
    onReset: () => void;
    onRefuel: () => void;
    userPlan: 'free' | 'premium';
    onUnlockPremium: () => void;
    onShowAdvice: () => void;
    isAiLoading: boolean;
    hasAdvice: boolean;
}

export const FuelConsumptionCard: React.FC<FuelConsumptionCardProps> = ({
    averageConsumption,
    onReset,
    onRefuel,
    userPlan,
    onUnlockPremium,
    onShowAdvice,
    isAiLoading,
    hasAdvice,
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Consumo Real</p>
                        <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none">
                            {averageConsumption ? `${averageConsumption} km/L` : '--- km/L'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Média Histórica</p>
                            {averageConsumption && (
                                <button
                                    onClick={onReset}
                                    className="text-[8px] text-red-400 font-black uppercase hover:text-red-600 transition-colors"
                                >
                                    (Resetar)
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Radar de Consumo IA</span>
                        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-1 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Zap size={12} />
                        </div>
                    </div>
                    {userPlan === 'premium' && <span className="bg-amber-400 text-[7px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Premium</span>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={onRefuel}
                    className="bg-emerald-600 text-white px-4 py-3.5 rounded-2xl font-black text-[10px] active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 uppercase tracking-widest transition-all hover:bg-emerald-700"
                >
                    <PlusCircle size={14} /> Abastecer
                </button>

                {userPlan === 'free' ? (
                    <button
                        onClick={onUnlockPremium}
                        className="w-full bg-indigo-600 text-[9px] font-black text-white py-3.5 rounded-2xl uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all text-center hover:bg-indigo-700"
                    >
                        Unlock Premium
                    </button>
                ) : (
                    <div className="w-full">
                        {isAiLoading && !hasAdvice ? (
                            <div className="h-full bg-slate-100 dark:bg-white/5 animate-pulse rounded-2xl" />
                        ) : hasAdvice ? (
                            <button
                                onClick={onShowAdvice}
                                className="w-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100"
                            >
                                <Activity size={14} /> Dicas IA
                            </button>
                        ) : (
                            <div className="h-full bg-slate-50 dark:bg-white/5 flex items-center justify-center rounded-2xl px-2">
                                <p className="text-[8px] text-slate-400 italic text-center leading-tight">Mais dados p/ IA</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
