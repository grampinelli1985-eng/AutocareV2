
import React, { useState } from 'react';
import { X, Calendar, Gauge, Receipt, FileText, AlertTriangle, Edit3 } from 'lucide-react';
import { MaintenanceMilestone } from '../types';

interface MilestoneCompletionModalProps {
    milestone: MaintenanceMilestone | null;
    onClose: () => void;
    onEdit: (milestone: MaintenanceMilestone) => void;
}

export const MilestoneCompletionModal: React.FC<MilestoneCompletionModalProps> = ({
    milestone,
    onClose,
    onEdit,
}) => {
    const [showWarning, setShowWarning] = useState(false);

    if (!milestone || milestone.status !== 'done' || !milestone.records || milestone.records.length === 0) return null;

    const record = milestone.records[0]; // Pegamos o primeiro registro associado a este marco

    const handleEditClick = () => {
        setShowWarning(true);
    };

    const confirmEdit = () => {
        onEdit(milestone);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            {!showWarning ? (
                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-slate-800 dark:text-white">Serviço Realizado</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Marco de {milestone.km.toLocaleString()} km</p>
                        </div>
                        <button onClick={onClose} className="p-1 text-slate-400"><X size={20} /></button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(record.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                                <Gauge size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KM Registrado</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{record.mileage.toLocaleString()} KM</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                                <Receipt size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor Investido</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">R$ {record.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <FileText size={10} /> Notas
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">{record.notes || 'Sem observações adicionais.'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleEditClick}
                        className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <Edit3 size={16} /> Editar Registro
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 text-center">
                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[32px] flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50/50 dark:ring-amber-900/10">
                        <AlertTriangle size={40} />
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Aviso Importante</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            A edição dos dados irá impactar no **cálculo de conservação** do veículo. Deseja continuar com a alteração?
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={confirmEdit}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                            Sim, desejo editar
                        </button>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
