
import React from 'react';
import { CheckCircle2, MapPin, Navigation, X } from 'lucide-react';

interface SightingSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicleName: string;
    location: string;
}

export const SightingSuccessModal: React.FC<SightingSuccessModalProps> = ({
    isOpen,
    onClose,
    vehicleName,
    location
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl" />

                <div className="relative space-y-6 text-center">
                    <div className="flex justify-center">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-[24px] text-emerald-600 animate-bounce-slow">
                            <CheckCircle2 size={48} strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Obrigado pela Ajuda!</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Sua contribuição é fundamental. O proprietário do <span className="text-indigo-600 font-bold">{vehicleName}</span> foi notificado imediatamente.
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-left space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local do Avistamento</p>
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-red-500 shadow-sm">
                                <MapPin size={18} />
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{location}</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        Entendido
                    </button>

                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        Você acabou de ganhar <span className="text-indigo-600">+50 pontos</span> de prestígio!
                    </p>
                </div>
            </div>
        </div>
    );
};
