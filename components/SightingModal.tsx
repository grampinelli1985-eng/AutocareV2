
import React from 'react';
import { Eye, X, Navigation, Info } from 'lucide-react';

interface SightingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onPlateValidation: (val: string) => void;
    sightingError: string | null;
    showManualLocationInput: boolean;
    isSightingValidated: boolean;
}

export const SightingModal: React.FC<SightingModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onPlateValidation,
    sightingError,
    showManualLocationInput,
    isSightingValidated
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[280] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Eye size={20} className="text-indigo-600" /> Relatar Avistamento</h3>
                    <button onClick={onClose} className="p-1 text-slate-400"><X size={20} /></button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 flex gap-3 items-start">
                        <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-indigo-700 uppercase">Divulgação de Privacidade</p>
                            <p className="text-[10px] text-indigo-700 leading-tight">
                                Utilizaremos sua localização GPS apenas para marcar o ponto de avistamento no mapa. Esta informação será compartilhada exclusivamente com o proprietário do veículo.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                        <p className="font-black uppercase mb-1">Confirmação de Segurança</p>
                        Para garantir a segurança, informe os 2 últimos dígitos da placa.
                    </div>

                    <div className="space-y-1">
                        <input
                            required
                            name="plateDigits"
                            maxLength={2}
                            placeholder="Últimos 2 dígitos"
                            onChange={(e) => onPlateValidation(e.target.value)}
                            className={`w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm font-black text-center ${sightingError ? 'border-2 border-red-500' : ''}`}
                        />
                        {sightingError && (
                            <p className="text-[10px] text-red-500 font-bold text-center mt-2">{sightingError}</p>
                        )}
                    </div>

                    {showManualLocationInput && (
                        <div className="space-y-1 animate-in slide-in-from-top-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Localização aproximada</p>
                            <input
                                required
                                name="manualLocation"
                                placeholder="Ex: Av. Paulista, próximo ao MASP"
                                className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!isSightingValidated}
                        className={`w-full py-5 rounded-[24px] font-black text-white flex items-center justify-center gap-2 ${isSightingValidated ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                        {showManualLocationInput ? (
                            'Confirmar Localização Manual'
                        ) : (
                            <>
                                <Navigation size={18} className="animate-pulse" />
                                Confirmar e Enviar GPS
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SightingModal;
