
import React from 'react';
import { X, PenTool, Loader2, Zap, Lock, Crown, FileText, CheckCircle2 } from 'lucide-react';
import { MaintenanceTask } from '../types';

interface ServiceRegistrationModalProps {
    task: { task: MaintenanceTask; targetKm: number } | null;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isScanning: boolean;
    onInvoiceScan: (e: React.ChangeEvent<HTMLInputElement>) => void;
    userPlan?: 'free' | 'premium';
    onUnlockPremium: () => void;
    selectedFile?: File | null;
}

export const ServiceRegistrationModal: React.FC<ServiceRegistrationModalProps> = ({
    task,
    onClose,
    onSubmit,
    isScanning,
    onInvoiceScan,
    userPlan = 'free',
    onUnlockPremium,
    selectedFile,
}) => {
    if (!task) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <PenTool size={20} className="text-indigo-600" /> Registro de Serviço
                    </h3>
                    <button onClick={onClose} className="p-1 text-slate-400"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Serviços Selecionados</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-indigo-300 leading-snug">{task.task.title}</p>
                    </div>
                    <input type="hidden" name="taskTitle" value={task.task.title} />
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">KM Rodado</p>
                            <input required name="mileage" id="record-mileage" type="number" inputMode="numeric" defaultValue={task.targetKm} placeholder="Ex: 10000" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</p>
                            <input required name="date" id="record-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white" />
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                        <div className="py-2">
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest text-center mb-2">Poupe tempo com o Scanner IA</p>

                            <div className="grid grid-cols-2 gap-2">
                                <label
                                    onClick={(e) => {
                                        if (userPlan === 'free') {
                                            e.preventDefault();
                                            onUnlockPremium();
                                        }
                                    }}
                                    className={`flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-2xl transition-all ${isScanning ? 'bg-indigo-50 animate-pulse border-indigo-300 pointer-events-none' : 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        {isScanning ? (
                                            <Loader2 size={16} className="text-indigo-600 animate-spin" />
                                        ) : (
                                            <Zap size={16} className={userPlan === 'premium' ? (selectedFile ? "text-emerald-500" : "text-indigo-600 animate-pulse") : "text-amber-500"} />
                                        )}
                                        <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-tight flex items-center gap-1">
                                            {userPlan === 'free' && <Crown size={10} className="text-amber-500 fill-amber-500" />}
                                            Escanear
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={onInvoiceScan}
                                        disabled={isScanning}
                                    />
                                </label>

                                <label
                                    onClick={(e) => {
                                        if (userPlan === 'free') {
                                            e.preventDefault();
                                            onUnlockPremium();
                                        }
                                    }}
                                    className={`flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-2xl transition-all ${isScanning ? 'bg-indigo-50 animate-pulse border-indigo-300 pointer-events-none' : 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <FileText size={16} className={selectedFile ? "text-emerald-500" : "text-indigo-600"} />
                                        <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-tight flex items-center gap-1">
                                            {userPlan === 'free' && <Crown size={10} className="text-amber-500 fill-amber-500" />}
                                            Upload
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={onInvoiceScan}
                                        disabled={isScanning}
                                    />
                                </label>
                            </div>

                            {selectedFile && (
                                <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2 overflow-hidden">
                                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                    <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-400 truncate">{selectedFile.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Total (R$)</p>
                        <input required name="cost" id="record-cost" type="number" step="0.01" inputMode="decimal" placeholder="Ex: 450.00" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white font-bold" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Detalhes (Opcional)</p>
                        <textarea name="notes" placeholder="Descreva as peças e oficina..." className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white h-20 resize-none" />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest">Finalizar Registro</button>
                </form>
            </div>
        </div>
    );
};

export default ServiceRegistrationModal;
