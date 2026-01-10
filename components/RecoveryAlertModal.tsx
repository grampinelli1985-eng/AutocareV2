
import React from 'react';
import { PartyPopper, X, Trophy, Heart } from 'lucide-react';
import { Vehicle } from '../types';

interface RecoveryAlertModalProps {
    vehicle: Vehicle | null;
    onClose: () => void;
}

export const RecoveryAlertModal: React.FC<RecoveryAlertModalProps> = ({
    vehicle,
    onClose,
}) => {
    if (!vehicle) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-emerald-600/20 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border-4 border-emerald-500 text-center space-y-6 animate-in zoom-in-95">
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-25" />
                    <div className="relative bg-emerald-500 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-xl">
                        <Trophy size={48} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-emerald-600 uppercase tracking-tighter">Veículo Recuperado!</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ótima notícia para a comunidade</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-lg font-black text-slate-800 dark:text-white uppercase">{vehicle.brand} {vehicle.model}</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="bg-slate-800 text-white px-3 py-1 rounded-lg font-mono text-sm tracking-widest">{vehicle.plate}</span>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
                        <Heart size={16} fill="currentColor" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Alerta Encerrado</p>
                    </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Agradecemos a todos que colaboraram com avistamentos e informações. A rede de proteção AutoCare funcionou!
                </p>

                <button
                    onClick={onClose}
                    className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
                >
                    Fico feliz em ajudar!
                </button>
            </div>
        </div>
    );
};
