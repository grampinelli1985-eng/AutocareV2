
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
    isLoading?: boolean;
}

export const SightingModal: React.FC<SightingModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onPlateValidation,
    sightingError,
    showManualLocationInput,
    isSightingValidated,
    isLoading = false
}) => {
    const [confirmedTruth, setConfirmedTruth] = React.useState(false);
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
                            disabled={isLoading}
                            name="plateDigits"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={2}
                            placeholder="00"
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ''); // Garantepenas números
                                e.target.value = val;
                                onPlateValidation(val);
                            }}
                            className={`w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-2xl font-black text-center tracking-widest ${sightingError ? 'border-2 border-red-500 text-red-600' : 'text-indigo-600'} ${isLoading ? 'opacity-50' : ''}`}
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
                                disabled={isLoading}
                                name="manualLocation"
                                placeholder="Ex: Av. Paulista, próximo ao MASP"
                                className={`w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm ${isLoading ? 'opacity-50' : ''}`}
                            />
                        </div>
                    )}

                    <div
                        className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => !isLoading && setConfirmedTruth(!confirmedTruth)}
                    >
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${confirmedTruth ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                            {confirmedTruth && <Eye size={12} className="text-white" />}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-tight select-none">
                            Confirmo que as informações acima são verdadeiras e estou ciente das diretrizes da comunidade.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={!isSightingValidated || !confirmedTruth || isLoading}
                        className={`w-full py-5 rounded-[24px] font-black text-white flex items-center justify-center gap-2 ${isSightingValidated && confirmedTruth && !isLoading ? 'bg-indigo-600 shadow-xl shadow-indigo-200' : 'bg-slate-300'}`}
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Relatando...</span>
                        ) : showManualLocationInput ? (
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
