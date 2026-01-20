
import React from 'react';
import { Crown, PlusCircle, Sparkles, FileText, Activity, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PremiumSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    onRestore: () => void;
}

export const PremiumSubscriptionModal: React.FC<PremiumSubscriptionModalProps> = ({
    isOpen,
    onClose,
    onUpgrade,
    onRestore,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-lg animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 border border-amber-100 dark:border-amber-900/30">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-full mx-auto flex items-center justify-center">
                        <Crown size={32} className="text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">AutoCare IA Premium</h2>
                    <p className="text-xs text-slate-500 font-bold">Libere todo o potencial da sua garagem</p>
                    <p className="text-[10px] text-slate-400 font-bold">Cancelamento disponível pela Google Play.</p>
                </div>

                <div className="space-y-4">
                    {[
                        { icon: PlusCircle, title: 'Veículos Ilimitados', desc: 'Cadastre todos os carros da família.' },
                        { icon: Sparkles, title: 'IA Chat Especialista', desc: 'Dúvidas respondidas por IA sem limites.' },
                        { icon: FileText, title: 'Relatórios em PDF', desc: 'Gere histórico detalhado e pronto para impressão.' },
                        { icon: Activity, title: 'Dicas de Economia IA', desc: 'Dicas inteligentes para reduzir consumo.' },
                        { icon: ShieldAlert, title: 'Alerta de Roubo', desc: 'Rede ampliada de proteção comunitária.' }
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl">
                            <feature.icon size={20} className={feature.icon === ShieldAlert ? 'text-red-600' : 'text-indigo-600'} />
                            <div>
                                <p className="text-sm font-bold">{feature.title}</p>
                                <p className="text-[10px] text-slate-500">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center pt-2">
                    <p className="text-3xl font-black text-slate-800 dark:text-white">R$ 15,99 <span className="text-sm font-bold text-slate-400">/mês</span></p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onUpgrade}
                        className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black active:scale-95 shadow-xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                    >
                        Assinar Agora
                    </button>
                    <button
                        onClick={onRestore}
                        className="w-full py-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:underline"
                    >
                        Restaurar Compras
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={14} />
                        Continuar com Plano Free
                    </button>
                </div>
            </div>
        </div>
    );
};
