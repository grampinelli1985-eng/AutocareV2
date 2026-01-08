
import React from 'react';
import { X, CheckSquare, Square, Camera, Loader2, FileText, CheckCircle2, Lock, Crown } from 'lucide-react';
import { MaintenanceMilestone } from '../types';

interface MilestoneDetailModalProps {
    milestone: MaintenanceMilestone | null;
    checkedTaskIds: string[];
    onToggleTask: (taskId: string) => void;
    onClose: () => void;
    onSave: () => void;
    isSaving: boolean;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedFile: File | null;
    isCapturing: boolean;
    userPlan?: 'free' | 'premium';
    onUnlockPremium: () => void;
}

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
    milestone,
    checkedTaskIds,
    onToggleTask,
    onClose,
    onSave,
    isSaving,
    onFileSelect,
    selectedFile,
    isCapturing,
    userPlan = 'free',
    onUnlockPremium,
}) => {
    if (!milestone) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10 shrink-0">
                    <div className="flex flex-col">
                        <h3 className="font-bold text-slate-800 dark:text-white">Checklist {milestone.km.toLocaleString()} km</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Selecione os serviços realizados</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400"><X size={20} /></button>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                    {milestone.tasks.map((task) => {
                        const isChecked = checkedTaskIds.includes(task.id);
                        return (
                            <div
                                key={task.id}
                                onClick={() => onToggleTask(task.id)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${isChecked ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-800'}`}
                            >
                                <div className={`mt-0.5 shrink-0 ${isChecked ? 'text-indigo-600' : 'text-slate-300'}`}>
                                    {isChecked ? <CheckSquare size={24} /> : <Square size={24} />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${isChecked ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-white'}`}>{task.title}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{task.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="shrink-0 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={onFileSelect}
                                onClick={(e) => {
                                    if (userPlan === 'free') {
                                        e.preventDefault();
                                        onUnlockPremium();
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={isSaving || isCapturing}
                            />
                            <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed transition-all h-24 ${selectedFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-600'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${selectedFile ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    {isCapturing ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                                </div>
                                <p className="text-[9px] font-black uppercase text-slate-800 dark:text-white text-center">
                                    Escanear
                                    {userPlan === 'free' && <Crown size={10} className="inline ml-1 text-amber-500 fill-amber-500" />}
                                </p>
                            </div>
                        </div>

                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onFileSelect}
                                onClick={(e) => {
                                    if (userPlan === 'free') {
                                        e.preventDefault();
                                        onUnlockPremium();
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={isSaving || isCapturing}
                            />
                            <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed transition-all h-24 ${selectedFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-600'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${selectedFile ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    <FileText size={20} />
                                </div>
                                <p className="text-[9px] font-black uppercase text-slate-800 dark:text-white text-center">
                                    Upload
                                    {userPlan === 'free' && <Crown size={10} className="inline ml-1 text-amber-500 fill-amber-500" />}
                                </p>
                            </div>
                        </div>
                    </div>

                    {selectedFile && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl flex items-center justify-between border border-emerald-100 dark:border-emerald-900/30">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 truncate">{selectedFile.name}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onSave}
                        disabled={checkedTaskIds.length === 0 || isSaving || isCapturing}
                        className="w-full bg-indigo-600 py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 disabled:opacity-50 disabled:bg-slate-400 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Registrando...</span>
                            </>
                        ) : (
                            `Concluir ${checkedTaskIds.length} serviços`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MilestoneDetailModal;

