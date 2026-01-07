
import React from 'react';
import { Trophy } from 'lucide-react';

interface RecoveryConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const RecoveryConfirmationModal: React.FC<RecoveryConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
                <Trophy size={40} className="text-emerald-600 mx-auto" />
                <h3 className="text-lg font-black dark:text-white uppercase">Confirmar Recuperação?</h3>
                <p className="text-xs text-slate-500">Isso removerá o alerta de roubo da comunidade e limpará o histórico de avistamentos.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={onConfirm} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95">Sim, foi recuperado!</button>
                    <button onClick={onClose} className="w-full py-4 text-slate-500 font-bold active:scale-95">Cancelar</button>
                </div>
            </div>
        </div>
    );
};
