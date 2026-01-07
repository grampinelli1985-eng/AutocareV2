
import React from 'react';
import { Activity, X } from 'lucide-react';
import { FUEL_TYPES } from '../constants';

interface FuelRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    defaultMileage?: number;
    defaultFuelType?: string;
    costInput: string;
    onCostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FuelRegistrationModal: React.FC<FuelRegistrationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    defaultMileage,
    defaultFuelType,
    costInput,
    onCostChange,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase text-sm tracking-tight">
                        <Activity size={20} className="text-emerald-600" /> Registro de Abastecimento
                    </h3>
                    <button onClick={onClose} className="p-1 text-slate-400"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">KM Atual</p>
                            <input required name="mileage" type="number" inputMode="numeric" defaultValue={defaultMileage} placeholder="Ex: 10500" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white font-bold" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Litros</p>
                            <input required name="liters" type="number" step="0.01" inputMode="decimal" placeholder="Ex: 45.5" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white font-bold" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Total (BRL)</p>
                            <input
                                required
                                name="cost"
                                type="text"
                                inputMode="decimal"
                                placeholder="R$ 0,00"
                                value={costInput}
                                onChange={onCostChange}
                                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</p>
                            <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Combustível</p>
                        <select name="fuelType" defaultValue={defaultFuelType} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white">
                            {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <input type="hidden" name="isFullTank" value="on" />
                    <button type="submit" className="w-full bg-emerald-600 py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest">Salvar Abastecimento</button>
                </form>
            </div>
        </div>
    );
};
