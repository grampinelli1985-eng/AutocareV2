
import React from 'react';
import { Trophy, X, Zap, ShieldCheck, Lock, CheckCircle2, TrendingUp, Info, Sparkles } from 'lucide-react';

interface LevelTimelineModalProps {
    currentLevel: number;
    currentTitle: string;
    progress: number;
    onClose: () => void;
}

export const LevelTimelineModal: React.FC<LevelTimelineModalProps> = ({
    currentLevel,
    currentTitle,
    progress,
    onClose
}) => {
    const titles = [
        'Recém-Chegado', 'Motorista Consciente', 'Guardião do Veículo',
        'Piloto Eficiente', 'Ninja da Manutenção', 'Zelador de Elite',
        'Sentinela Mecânico', 'Inspetor de Elite', 'Embaixador AutoCare', 'Mestre da Longevidade'
    ];

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex justify-between items-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Trophy size={24} />
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Evolução de Nível</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sua jornada para a maestria automotiva</p>
                </div>

                {/* Calculation Explanation */}
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Info size={16} strokeWidth={3} />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Como subir de nível?</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold italic">
                        Seu nível (LVL) é a média entre sua <span className="text-indigo-600 dark:text-indigo-400">Eco-Condução</span> (70%) e <span className="text-emerald-600">Conservação</span> (30%).
                        Cada 10 pontos conquistados na média geral desbloqueiam um novo título de prestígio.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3 px-1">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso do Nível</p>
                            <p className="text-lg font-black text-slate-800 dark:text-white leading-none">
                                {progress === 100 ? 'Maestria Atingida!' : `${progress}% para o Nível ${currentLevel + 1}`}
                            </p>
                        </div>
                        {progress < 100 && (
                            <div className="bg-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg animate-bounce-slow">
                                +{100 - progress}%
                            </div>
                        )}
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-200 dark:border-slate-800">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000 ease-out relative group"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            <Sparkles size={8} className="absolute right-1 top-0.5 text-white animate-spin-slow opacity-50" />
                        </div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight text-center">
                        {progress === 100 ? 'Você atingiu o nível máximo de cuidado!' : `Faltam apenas ${100 - progress}% para seu próximo título.`}
                    </p>
                </div>

                {/* Timeline */}
                <div className="space-y-4 pt-2">
                    {titles.map((title, index) => {
                        const levelNum = index + 1;
                        const isPast = levelNum < currentLevel;
                        const isCurrent = levelNum === currentLevel;
                        const isFuture = levelNum > currentLevel;

                        return (
                            <div key={levelNum} className={`relative flex items-center gap-4 transition-all duration-500 ${isCurrent ? 'scale-105' : ''}`}>
                                {/* Connector Line */}
                                {index < titles.length - 1 && (
                                    <div className={`absolute left-6 top-10 w-0.5 h-8 -z-10 ${isPast ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}`} />
                                )}

                                {/* Level Badge/Icon */}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${isCurrent
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none animate-pulse'
                                    : isPast
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/50 text-indigo-600'
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-300'
                                    }`}>
                                    {isPast ? (
                                        <CheckCircle2 size={24} />
                                    ) : isCurrent ? (
                                        <TrendingUp size={24} />
                                    ) : (
                                        <Lock size={20} />
                                    )}
                                </div>

                                {/* Title Info */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isFuture ? 'text-slate-400' : 'text-indigo-600'}`}>
                                            Nível {levelNum}
                                        </p>
                                        {isCurrent && (
                                            <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full uppercase">Atual</span>
                                        )}
                                    </div>
                                    <p className={`text-sm font-black uppercase tracking-tight ${isCurrent
                                        ? 'text-slate-800 dark:text-white'
                                        : isFuture
                                            ? 'text-slate-300 dark:text-slate-600'
                                            : 'text-slate-600 dark:text-slate-400 opacity-80'
                                        }`}>
                                        {title}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all mt-4"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
};
