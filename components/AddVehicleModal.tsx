
import React from 'react';
import { Car as CarIcon, X } from 'lucide-react';
import { BRANDS, MODELS_BY_BRAND, FUEL_TYPES, TRANSMISSIONS, COMMON_ENGINES } from '../constants';
import { Vehicle } from '../types';

interface AddVehicleModalProps {
    isOpen: boolean;
    isAddingNew: boolean;
    selectedVehicle: Vehicle | null;
    plateMasked: string;
    selectedBrandInModal: string;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onPlateMask: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBrandChange: (brand: string) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
    isOpen,
    isAddingNew,
    selectedVehicle,
    plateMasked,
    selectedBrandInModal,
    onClose,
    onSubmit,
    onPlateMask,
    onBrandChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <CarIcon size={20} className="text-indigo-600" /> {isAddingNew ? 'Novo Veículo' : 'Alterar Dados'}
                    </h3>
                    <button onClick={onClose} className="p-1 text-slate-400"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-3">
                    <select
                        required
                        name="brand"
                        defaultValue={isAddingNew ? '' : (selectedVehicle?.brand || '')}
                        onChange={(e) => onBrandChange(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white outline-none"
                    >
                        <option value="">Marca</option>
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select
                        required
                        name="model"
                        defaultValue={isAddingNew ? '' : (selectedVehicle?.model || '')}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white outline-none"
                    >
                        <option value="">Modelo</option>
                        {(MODELS_BY_BRAND[selectedBrandInModal] || []).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            required
                            name="year"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            inputMode="numeric"
                            defaultValue={isAddingNew ? '' : selectedVehicle?.year}
                            placeholder="Ano"
                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white"
                        />
                        <input
                            required
                            name="plate"
                            value={plateMasked}
                            onChange={onPlateMask}
                            placeholder="Placa"
                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            required
                            name="fuel"
                            defaultValue={isAddingNew ? '' : (selectedVehicle?.fuel || '')}
                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white outline-none"
                        >
                            <option value="">Combustível</option>
                            {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <select
                            required
                            name="transmission"
                            defaultValue={isAddingNew ? '' : (selectedVehicle?.transmission || '')}
                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white outline-none"
                        >
                            <option value="">Câmbio</option>
                            {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <select
                        required
                        name="engine"
                        defaultValue={isAddingNew ? '' : (selectedVehicle?.engine || '')}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white outline-none"
                    >
                        <option value="">Motor</option>
                        {COMMON_ENGINES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <input
                        required
                        name="currentMileage"
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        defaultValue={isAddingNew ? '' : selectedVehicle?.currentMileage}
                        placeholder="KM Atual"
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white"
                    />
                    <button type="submit" className="w-full bg-indigo-600 py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all">
                        {isAddingNew ? 'Cadastrar Veículo' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddVehicleModal;
