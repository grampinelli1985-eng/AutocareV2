
import React from 'react';
import { Crown, ShieldCheck } from 'lucide-react';

interface Advice {
    title: string;
    content: string;
    urgency: 'high' | 'medium' | 'low';
}

interface PreventiveRadarCardProps {
    isLoading: boolean;
    analysis: { advices: Advice[] } | null;
    userPlan: 'free' | 'premium';
}

export const PreventiveRadarCard: React.FC<PreventiveRadarCardProps> = ({
    isLoading,
    analysis,
    userPlan,
}) => {
    return (
        <div className="bg-indigo-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">Radar Preventivo IA</h3>
                {userPlan === 'premium' ? (
                    <div className="flex items-center gap-2">
                        <div className="bg-white/10 px-2 py-1 rounded-lg flex items-center gap-1 border border-white/5 animate-pulse">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-100">Memory Active</span>
                        </div>
                        <Crown size={20} className="text-amber-400" />
                    </div>
                ) : (
                    <ShieldCheck size={20} className="text-white/40" />
                )}
            </div>
            <div className="space-y-3 mt-4">
                {isLoading && !analysis ? (
                    <div className="h-20 bg-white/10 animate-pulse rounded-2xl" />
                ) : (
                    analysis?.advices?.slice(0, userPlan === 'free' ? 1 : undefined).map((adv: Advice, i: number) => (
                        <div key={i} className="flex gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 transition-all hover:bg-white/15">
                            <div className={`shrink-0 w-1.5 h-full rounded-full ${adv.urgency === 'high' ? 'bg-orange-400' : 'bg-indigo-300'}`} />
                            <div>
                                <h4 className="text-xs font-bold uppercase text-indigo-200">{adv.title}</h4>
                                <p className="text-sm text-white/90 leading-tight">{adv.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
