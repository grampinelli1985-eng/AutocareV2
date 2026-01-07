
import React from 'react';
import { X, FileText, Download, Loader2, Car as CarIcon, User as UserIcon, ClipboardList, PenTool, Eye } from 'lucide-react';
import { Vehicle, ServiceRecord } from '../types';

interface MaintenanceReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
    records: ServiceRecord[];
    onDownload: () => void;
    isDownloading: boolean;
    onViewReceipt: (url: string) => void;
}

export const MaintenanceReportModal: React.FC<MaintenanceReportModalProps> = ({
    isOpen,
    onClose,
    vehicle,
    records,
    onDownload,
    isDownloading,
    onViewReceipt,
}) => {
    if (!isOpen || !vehicle) return null;

    return (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 no-print">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl"><FileText size={20} /></div>
                        <h2 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight">Relatório de Manutenção</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>

                <div id="printable-report" className="flex-1 overflow-y-auto p-12 space-y-12 bg-white text-slate-900 pdf-content-area custom-scrollbar">
                    <div className="h-4 bg-indigo-600 rounded-t-lg -mx-12 -mt-12 mb-8"></div>
                    <div className="flex items-center justify-between border-b-8 border-indigo-600 pb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                                <CarIcon size={56} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-indigo-600 tracking-tighter uppercase leading-none">AutoCare IA</h1>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Gestão Inteligente Automotiva</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Documento Oficial</p>
                            <p className="text-sm font-black text-slate-800">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-4">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-indigo-600 border-b-2 border-indigo-100 pb-1 tracking-widest">Dados do Proprietário</h4>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 rounded-2xl text-slate-400"><UserIcon size={24} /></div>
                                <div>
                                    <p className="text-base font-black text-slate-800">Usuário AutoCare</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">Assinante Premium</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-indigo-600 border-b-2 border-indigo-100 pb-1 tracking-widest">Informações do Veículo</h4>
                            <div>
                                <p className="text-xl font-black text-slate-800 flagship leading-tight uppercase">{vehicle.brand} {vehicle.model}</p>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{vehicle.year} • {vehicle.engine} • PLACA {vehicle.plate}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[32px] flex justify-around items-center border-2 border-slate-100 shadow-sm">
                        <div className="text-center">
                            <p className="text-3xl font-black text-indigo-600">{vehicle.currentMileage.toLocaleString()}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">KM Atual Registrado</p>
                        </div>
                        <div className="w-px h-12 bg-slate-200" />
                        <div className="text-center">
                            <p className="text-3xl font-black text-slate-800">{records.length}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Serviços Históricos</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl">
                            <ClipboardList size={20} />
                            <h4 className="text-[11px] font-black uppercase tracking-widest">Descrição Completa dos Serviços e Peças</h4>
                        </div>

                        {records.length > 0 ? (
                            <div className="space-y-10">
                                {records.map(record => (
                                    <div key={record.id} className="relative border-l-8 border-indigo-600 pl-8 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{record.taskTitle}</p>
                                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1">Realizado em {new Date(record.date).toLocaleDateString('pt-BR')} • {record.mileage.toLocaleString()} KM</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <p className="text-sm font-black text-indigo-700 tracking-tight">R$ {record.cost.toFixed(2)}</p>
                                                {record.receiptUrl && (
                                                    <button
                                                        onClick={() => onViewReceipt(record.receiptUrl!)}
                                                        className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors no-print"
                                                    >
                                                        <Eye size={12} /> Ver Nota
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                                            <p className="text-[9px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
                                                <PenTool size={12} className="text-indigo-600" /> Descrição do Serviço e Detalhamento de Peças:
                                            </p>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap italic">
                                                {record.notes || "Nenhum detalhe adicional informado para este registro."}
                                            </p>
                                        </div>

                                        {record.receiptUrl && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                                                <p className="text-[8px] font-black uppercase text-slate-400">Anexo: Miniatura do Comprovante</p>
                                                <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50">
                                                    <img
                                                        src={record.receiptUrl}
                                                        alt="Recibo"
                                                        className="w-full h-full object-cover"
                                                        crossOrigin="anonymous"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center text-slate-300 italic text-base font-medium">Não há registros de serviços cadastrados para este veículo.</div>
                        )}
                    </div>

                    <div className="pt-12 mt-12 border-t-4 border-slate-100 space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="space-y-2">
                                <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">Certificação AutoCare IA</p>
                                <p className="text-[10px] text-slate-400 leading-relaxed max-w-[400px] font-medium italic">Documento autogerado via plataforma AutoCare. Este registro é mantido em nuvem para fins de histórico de manutenção preventiva.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-black uppercase text-slate-900 tracking-widest">ID de Autenticação</p>
                                <p className="text-[10px] font-mono text-slate-300 uppercase tracking-[0.2em] mt-1">{vehicle.plate}-{Date.now()}</p>
                            </div>
                        </div>
                        <div className="text-center bg-slate-900 text-white py-2 rounded-xl">
                            <p className="text-[9px] font-black uppercase tracking-[0.5em]">Garantia de Organização para seu Veículo</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-4 no-print">
                    <button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-70 transition-all"
                    >
                        {isDownloading ? (
                            <><Loader2 size={20} className="animate-spin" /> Gerando Documento...</>
                        ) : (
                            <><Download size={20} /> Baixar Relatório PDF</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
