
import React from 'react';
import { PartyPopper } from 'lucide-react';
import { TheftReport } from '../types';

interface RecoverySuccessModalProps {
    report: TheftReport | null;
    onClose: () => void;
}

export const RecoverySuccessModal: React.FC<RecoverySuccessModalProps> = ({
    report,
    onClose,
}) => {
    if (!report) return null;

    return (
        <div className="fixed inset-0 z-[450] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in zoom-in-95">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border-4 border-emerald-500 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mx-auto flex items-center justify-center">
                    <PartyPopper size={40} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase">Excelente Notícia!</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">O veículo <strong>{report.vehicle.brand} {report.vehicle.model}</strong> foi recuperado com sucesso e o alerta de roubo foi desativado na comunidade.</p>
                <button onClick={onClose} className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black uppercase text-xs shadow-xl active:scale-95">Continuar</button>
            </div>
        </div>
    );
};
