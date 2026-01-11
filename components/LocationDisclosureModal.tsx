
import React from 'react';
import { MapPin, ShieldCheck, Navigation } from 'lucide-react';

interface LocationDisclosureModalProps {
    isOpen: boolean;
    onAccept: () => void;
}

export const LocationDisclosureModal: React.FC<LocationDisclosureModalProps> = ({ isOpen, onAccept }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 border border-indigo-100 dark:border-indigo-900">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl mx-auto flex items-center justify-center">
                        <MapPin size={32} className="text-indigo-600 animate-bounce-slow" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Uso de Localização</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Transparência AutoCare</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-5">
                    <div className="flex gap-4 items-start">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-xl text-indigo-600 shrink-0">
                            <Navigation size={18} />
                        </div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                            O AutoCare coleta dados de localização para calcular a distância entre você e alertas de roubo ou avistamentos feitos pela comunidade.
                        </p>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl text-emerald-600 shrink-0">
                            <ShieldCheck size={18} />
                        </div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                            Seus dados são usados apenas para triagem de alertas próximos e não são compartilhados com parceiros de publicidade.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 leading-relaxed text-center">
                        Ao continuar, você concorda que o app acesse sua localização enquanto estiver em uso.
                    </p>
                </div>

                <button
                    onClick={onAccept}
                    className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black active:scale-95 shadow-xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                    Entendi e Aceito
                </button>
            </div>
        </div>
    );
};
