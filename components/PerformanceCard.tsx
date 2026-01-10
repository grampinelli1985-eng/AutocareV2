
import React from 'react';
import { Trophy, Zap, ShieldCheck, X, Sparkles } from 'lucide-react';

interface PerformanceScore {
    eco: number;
    conservation: number;
    level: number;
    title: string;
}

interface PerformanceCardProps {
    score: PerformanceScore;
    averageConsumption: string | null;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    onLevelClick?: () => void;
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({
    score,
    averageConsumption,
    showModal,
    setShowModal,
    onLevelClick
}) => {
    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-all duration-700" />

                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Trophy size={18} className="text-amber-500" />
                            <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">Sua Graduação IA</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{score.title}</p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onLevelClick?.();
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-black text-[10px] shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                    >
                        LVL {score.level}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => setShowModal(true)}
                        className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-95 transition-all"
                    >
                        <div className="flex justify-between items-end mb-2">
                            <Zap size={14} className="text-indigo-600" />
                            <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{score.eco}%</span>
                        </div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Eco-Condução</p>
                        <div className="mt-2 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${score.eco}%` }} />
                        </div>
                    </div>

                    <div
                        onClick={() => setShowModal(true)}
                        className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-95 transition-all"
                    >
                        <div className="flex justify-between items-end mb-2">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{score.conservation}%</span>
                        </div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Conservação</p>
                        <div className="mt-2 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full transition-all duration-1000" style={{ width: `${score.conservation}%` }} />
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="w-full mt-4 py-2 text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
                >
                    Ver Detalhes do Ranking
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[2400] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Trophy size={24} />
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 bg-slate-100 dark:bg-white/5 rounded-full"><X size={20} /></button>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Ranking AutoCare</h3>
                            <div className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Level {score.level} • {score.title}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 rounded-xl"><Zap size={18} /></div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase leading-none">Eco-Condução</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Eficiência de Combustível</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-black text-indigo-600">{score.eco}%</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                                    Baseado na sua média real de <strong>{averageConsumption || '...'} km/l</strong> contra a meta da IA para seu motor.
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-600/20 text-emerald-600 rounded-xl"><ShieldCheck size={18} /></div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase leading-none">Conservação</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cuidado e Manutenção</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-black text-emerald-600">{score.conservation}%</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                                    Cálculo que une as revisões feitas no prazo com o índice de saúde detectado pela IA.
                                </p>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex gap-4">
                            <Sparkles size={24} className="text-amber-500 shrink-0" />
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                                <strong>DICA DE VALOR:</strong> Veículos com histórico impecável e nível alto podem ser vendidos por até 15% acima da Tabela FIPE!
                            </p>
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95"
                        >
                            Voltar ao Painel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
