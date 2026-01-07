
import React from 'react';
import { Siren, Info, X } from 'lucide-react';
import { Vehicle, TheftReport } from '../types';

interface TheftAlertModalProps {
    alert: { vehicle: Vehicle; report: TheftReport } | null;
    onClose: () => void;
}

export const TheftAlertModal: React.FC<TheftAlertModalProps> = ({
    alert,
    onClose,
}) => {
    if (!alert) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-red-600/20 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border-4 border-red-600 text-center space-y-6 animate-in zoom-in-95">
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-25" />
                    <div className="relative bg-red-600 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-xl">
                        <Siren size={48} />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-red-600 uppercase tracking-tighter">Alerta de Roubo!</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Atenção Comunidade AutoCare</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-lg font-black text-slate-800 dark:text-white uppercase">{alert.vehicle.brand} {alert.vehicle.model}</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="bg-slate-800 text-white px-3 py-1 rounded-lg font-mono text-sm tracking-widest">{alert.vehicle.plate}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mt-3 uppercase tracking-wider italic">Visto por último em: {alert.report.city} - {alert.report.state}</p>

                    {alert.report.description && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/50 text-left">
                            <p className="text-[9px] text-red-600 dark:text-red-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Info size={10} /> Detalhes da Ocorrência:
                            </p>
                            <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic">
                                "{alert.report.description}"
                            </p>
                        </div>
                    )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Fique atento! Se localizar este veículo, informe um avistamento no mapa para ajudar o proprietário.</p>
                <button
                    onClick={onClose}
                    className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95"
                >
                    Entendido, ficarei de olho
                </button>
            </div>
        </div>
    );
};
