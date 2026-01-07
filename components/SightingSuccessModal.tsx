
import React from 'react';
import { MapPinned } from 'lucide-react';

interface SightingSuccessModalProps {
    sighting: { mapUrl?: string } | null;
    onClose: () => void;
}

export const SightingSuccessModal: React.FC<SightingSuccessModalProps> = ({
    sighting,
    onClose,
}) => {
    if (!sighting) return null;

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in zoom-in-95">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border-4 border-indigo-500 text-center space-y-6">
                <MapPinned size={40} className="text-indigo-600 mx-auto" />
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase">Veículo Localizado!</h3>
                <p className="text-xs text-slate-500">
                    {sighting.mapUrl
                        ? "Localização GPS enviada pela comunidade agora."
                        : "Um membro da comunidade informou a localização manualmente."}
                </p>
                {sighting.mapUrl && (
                    <a
                        href={sighting.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black block uppercase text-xs shadow-xl active:scale-95"
                    >
                        Abrir no Google Maps
                    </a>
                )}
                <button
                    onClick={onClose}
                    className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase hover:text-slate-600 transition-colors"
                >
                    Fechar Notificação
                </button>
            </div>
        </div>
    );
};
