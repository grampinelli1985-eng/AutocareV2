
import React from 'react';
import { MapPin, Navigation, Flag, X, Eye, AlertCircle } from 'lucide-react';
import { Vehicle } from '../types';

interface SightingAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
    sightingData: {
        location: string;
        description: string;
        mapUrl?: string;
    } | null;
    onReport?: (sightingId: string) => void;
}

export const SightingAlertModal: React.FC<SightingAlertModalProps> = ({
    isOpen,
    onClose,
    vehicle,
    sightingData,
    onReport,
}) => {
    if (!isOpen || !vehicle || !sightingData) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-indigo-900/40 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border-4 border-indigo-600 text-center space-y-6 animate-in zoom-in-95">
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-25" />
                    <div className="relative bg-indigo-600 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-xl">
                        <Eye size={48} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-indigo-600 uppercase tracking-tighter">Veículo Avistado!</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Alerta da Comunidade AutoCare</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 text-left">
                    <div className="mb-4">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Seu Veículo</p>
                        <p className="text-lg font-black text-slate-800 dark:text-white uppercase leading-none">{vehicle.brand} {vehicle.model}</p>
                        <span className="inline-block mt-2 bg-slate-800 text-white px-2 py-0.5 rounded-md font-mono text-xs tracking-widest">{vehicle.plate}</span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Localização Informada</p>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                <MapPin size={14} className="text-red-500" />
                                <p className="text-sm font-bold">{sightingData.location}</p>
                            </div>
                        </div>

                        {sightingData.description && (
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                                <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <AlertCircle size={10} /> Descrição:
                                </p>
                                <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic">
                                    "{sightingData.description}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {sightingData.mapUrl && (
                        <a
                            href={sightingData.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            <Navigation size={18} /> Ver no Mapa
                        </a>
                    )}
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                    >
                        Entendido
                    </button>
                </div>

                <div className="pt-2">
                    <button
                        onClick={() => onReport?.('sighting_report')}
                        className="flex items-center gap-2 mx-auto text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                        <Flag size={12} /> Denunciar Informação Falsa
                    </button>
                </div>
            </div>
        </div>
    );
};
