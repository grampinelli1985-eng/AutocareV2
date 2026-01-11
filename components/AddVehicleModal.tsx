
import React, { useState, useEffect } from 'react';
import { Car as CarIcon, X, Loader2, Info, ChevronDown } from 'lucide-react';
import { FUEL_TYPES, TRANSMISSIONS, COMMON_ENGINES, MODELS_BY_BRAND, BRANDS } from '../constants';
import { Vehicle } from '../types';
import { getFipeBrands, getFipeModels, getFipeYears } from '../services/fipeService';

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
    const [brands, setBrands] = useState<{ codigo: string; nome: string }[]>([]);
    const [models, setModels] = useState<{ codigo: string; nome: string }[]>([]);
    const [years, setYears] = useState<{ codigo: string; nome: string }[]>([]);

    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [isLoadingYears, setIsLoadingYears] = useState(false);

    const [selectedFipeBrand, setSelectedFipeBrand] = useState('');
    const [selectedFipeModel, setSelectedFipeModel] = useState('');
    const [selectedFipeYear, setSelectedFipeYear] = useState('');
    const [selectedGenericModel, setSelectedGenericModel] = useState(isAddingNew ? '' : (selectedVehicle?.model || ''));

    // Carregar Marcas ao abrir e resetar estados
    useEffect(() => {
        if (isOpen) {
            // Reset states before loading
            setSelectedFipeBrand('');
            setSelectedFipeModel('');
            setSelectedFipeYear('');
            setSelectedGenericModel(isAddingNew ? '' : (selectedVehicle?.model || ''));

            setIsLoadingBrands(true);
            getFipeBrands().then(data => {
                // Filtrar apenas as marcas que temos em nossa lista de "mais conhecidas" em constants.tsx
                const filtered = data.filter(fipeBrand =>
                    BRANDS.some(b => fipeBrand.nome.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(fipeBrand.nome.toLowerCase()))
                );

                setBrands(filtered.sort((a, b) => a.nome.localeCompare(b.nome)));
                setIsLoadingBrands(false);

                // Se estiver editando, tentar encontrar o código da marca
                if (!isAddingNew && selectedVehicle) {
                    const found = data.find(b =>
                        b.nome.toLowerCase().includes(selectedVehicle.brand.toLowerCase()) ||
                        selectedVehicle.brand.toLowerCase().includes(b.nome.toLowerCase())
                    );
                    if (found) {
                        setSelectedFipeBrand(found.codigo);
                        onBrandChange(found.nome);
                    }
                }
            });
        }
    }, [isOpen, selectedVehicle, isAddingNew]);

    // Carregar Modelos (Versões no FIPE) quando a marca muda
    useEffect(() => {
        if (selectedFipeBrand) {
            setIsLoadingModels(true);
            getFipeModels(selectedFipeBrand).then(data => {
                setModels(data);
                setIsLoadingModels(false);
            });
        } else {
            setModels([]);
        }
    }, [selectedFipeBrand]);

    // Carregar Anos quando a versão/modelo muda
    useEffect(() => {
        if (selectedFipeBrand && selectedFipeModel) {
            setIsLoadingYears(true);
            getFipeYears(selectedFipeBrand, selectedFipeModel).then(data => {
                setYears(data);
                setIsLoadingYears(false);
            });
        } else {
            setYears([]);
        }
    }, [selectedFipeModel, selectedFipeBrand]);

    // Auto-select version/model when list is loaded (Editing mode)
    useEffect(() => {
        if (!isAddingNew && selectedVehicle && models.length > 0 && !selectedFipeModel) {
            const found = models.find(m =>
                m.nome.toLowerCase() === selectedVehicle.version?.toLowerCase() ||
                m.nome.toLowerCase().includes(selectedVehicle.version?.toLowerCase())
            );
            if (found) {
                setSelectedFipeModel(found.codigo);
            }
        }
    }, [models, isAddingNew, selectedVehicle]);

    // Auto-select year when list is loaded (Editing mode)
    useEffect(() => {
        if (!isAddingNew && selectedVehicle && years.length > 0 && !selectedFipeYear) {
            const yearStr = selectedVehicle.year.toString();
            const found = years.find(y => y.nome.startsWith(yearStr));
            if (found) {
                setSelectedFipeYear(found.nome.split(' ')[0]);
            }
        }
    }, [years, isAddingNew, selectedVehicle]);

    // Helper to find generic models even if the brand name from FIPE is slightly different (e.g. "VW - VolksWagen")
    const getGenericModels = () => {
        if (!selectedBrandInModal) return [];
        const normalizedBrand = selectedBrandInModal.toLowerCase();
        const brandKey = Object.keys(MODELS_BY_BRAND).find(k =>
            normalizedBrand.includes(k.toLowerCase()) || k.toLowerCase().includes(normalizedBrand)
        );
        return brandKey ? MODELS_BY_BRAND[brandKey] : [];
    };

    if (!isOpen) return null;

    const filteredVersions = selectedGenericModel
        ? models.filter(m => m.nome.toLowerCase().includes(selectedGenericModel.toLowerCase()))
        : models;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">

                {/* Header Profissional */}
                <div className="bg-indigo-600 p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm">
                            <CarIcon size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">
                                {isAddingNew ? 'Cadastrar Veículo' : 'Editar Veículo'}
                            </h3>
                            <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest opacity-80">
                                Sincronizado com Tabela FIPE
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form onSubmit={onSubmit} className="space-y-5">

                        {/* Seção Principal: Identificação */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identificação</p>

                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-indigo-500 uppercase ml-1">Marca</p>
                                <div className="relative">
                                    <select
                                        required
                                        name="brand"
                                        value={selectedBrandInModal}
                                        onChange={(e) => {
                                            const brand = brands.find(b => b.nome === e.target.value);
                                            onBrandChange(e.target.value);
                                            setSelectedFipeBrand(brand?.codigo || '');
                                            setSelectedGenericModel('');
                                            setSelectedFipeModel('');
                                        }}
                                        disabled={isLoadingBrands}
                                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 appearance-none transition-all"
                                    >
                                        <option value="">Selecione a Marca</option>
                                        {brands.map(b => <option key={b.codigo} value={b.nome}>{b.nome}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        {isLoadingBrands ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-indigo-500 uppercase ml-1">Modelo</p>
                                    <div className="relative">
                                        <select
                                            required
                                            name="model"
                                            value={selectedGenericModel}
                                            onChange={(e) => {
                                                setSelectedGenericModel(e.target.value);
                                                setSelectedFipeModel('');
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 appearance-none transition-all"
                                        >
                                            <option value="">Modelo</option>
                                            {getGenericModels().map(m => <option key={m} value={m}>{m}</option>)}
                                            <option value="Outro">Outro</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-indigo-500 uppercase ml-1">Placa</p>
                                    <input
                                        required
                                        name="plate"
                                        value={plateMasked}
                                        onChange={onPlateMask}
                                        placeholder="ABC-1234"
                                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white border border-slate-100 dark:border-slate-800 focus:border-indigo-500 uppercase font-mono"
                                    />
                                </div>
                            </div>

                            {/* NOVO CAMPO: VERSÃO (DINÂMICO FIPE) */}
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-indigo-500 uppercase ml-1 flex items-center gap-1">
                                    Versão / Motorização <Info size={10} className="text-slate-400" />
                                </p>
                                <div className="relative">
                                    <select
                                        required
                                        name="fipeModelId"
                                        value={selectedFipeModel}
                                        onChange={(e) => setSelectedFipeModel(e.target.value)}
                                        disabled={isLoadingModels || !selectedBrandInModal}
                                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 appearance-none transition-all"
                                    >
                                        <option value="">Selecione a Versão</option>
                                        {filteredVersions.map(m => (
                                            <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                                        ))}
                                    </select>
                                    <input type="hidden" name="version" value={models.find(m => m.codigo === selectedFipeModel)?.nome || ''} />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        {isLoadingModels ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                                    </div>
                                </div>
                                {selectedGenericModel && filteredVersions.length === 0 && !isLoadingModels && (
                                    <p className="text-[8px] text-amber-600 font-bold ml-1 uppercase">Todas as versões disponíveis carregadas</p>
                                )}
                            </div>
                        </div>

                        {/* Seção: Especificações Técnicas */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Especificações</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-indigo-500 uppercase ml-1">Ano Modelo</p>
                                    <div className="relative">
                                        <select
                                            required
                                            name="year"
                                            value={selectedFipeYear}
                                            onChange={(e) => setSelectedFipeYear(e.target.value)}
                                            disabled={isLoadingYears || !selectedFipeModel}
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 appearance-none transition-all"
                                        >
                                            <option value="">Ano</option>
                                            {years.map(y => (
                                                <option key={y.codigo} value={y.nome.split(' ')[0]}>{y.nome}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            {isLoadingYears ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-indigo-500 uppercase ml-1">Câmbio</p>
                                    <div className="relative">
                                        <select
                                            required
                                            name="transmission"
                                            defaultValue={isAddingNew ? '' : (selectedVehicle?.transmission || '')}
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 appearance-none transition-all"
                                        >
                                            <option value="">Transmissão</option>
                                            {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-indigo-500 uppercase ml-1">Combustível</p>
                                    <div className="relative">
                                        <select
                                            required
                                            name="fuel"
                                            defaultValue={isAddingNew ? '' : (selectedVehicle?.fuel || '')}
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 appearance-none transition-all"
                                        >
                                            <option value="">Combustível</option>
                                            {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-indigo-500 uppercase ml-1">Motorização</p>
                                    <div className="relative">
                                        <select
                                            required
                                            name="engine"
                                            defaultValue={isAddingNew ? '' : (selectedVehicle?.engine || '')}
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 appearance-none transition-all"
                                        >
                                            <option value="">Motor</option>
                                            {COMMON_ENGINES.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Odômetro */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Estado Atual</p>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-indigo-500 uppercase ml-1">Quilometragem Total (KM)</p>
                                <input
                                    required
                                    name="currentMileage"
                                    type="number"
                                    min="0"
                                    step="1"
                                    inputMode="numeric"
                                    defaultValue={isAddingNew ? '' : selectedVehicle?.currentMileage}
                                    placeholder="Ex: 45000"
                                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-4 text-sm dark:text-white border border-slate-100 dark:border-slate-800 focus:border-indigo-500 font-bold"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoadingModels || isLoadingYears}
                            className={`w-full bg-indigo-600 dark:bg-indigo-500 py-5 rounded-[24px] font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${isLoadingModels || isLoadingYears ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                            {isAddingNew ? 'Confirmar Cadastro' : 'Salvar Alterações'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddVehicleModal;
