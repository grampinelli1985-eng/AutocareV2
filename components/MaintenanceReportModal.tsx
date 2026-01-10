
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

                <div id="printable-report" className="flex-1 overflow-y-auto p-12 bg-white text-slate-900 pdf-content-area custom-scrollbar selection:bg-indigo-100">
                    {/* Top Decorative Bar */}
                    <div id="chunk-header-decoration" className="print-chunk h-4 bg-indigo-600 rounded-t-2xl -mx-12 -mt-12 mb-10"></div>

                    {/* Logo and Emission Header */}
                    <div id="chunk-header" className="print-chunk flex items-end justify-between border-b-[6px] border-indigo-600 pb-8 mb-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                <CarIcon size={48} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-indigo-600 tracking-tighter uppercase leading-[0.8]">AutoCare IA</h1>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mt-3">Gestão Inteligente Automotiva</p>
                            </div>
                        </div>
                        <div className="text-right pb-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Documento Oficial</p>
                            <p className="text-sm font-black text-slate-800">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>

                    {/* Owner and Vehicle Info */}
                    <div id="chunk-owner-vehicle" className="print-chunk grid grid-cols-2 gap-12 mb-12">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-indigo-600 border-b border-indigo-100 pb-2 tracking-[0.1em]">Dados do Proprietário</h4>
                            <div className="flex items-center gap-4 pt-1 pb-2">
                                <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 border border-slate-100"><UserIcon size={24} /></div>
                                <div>
                                    <p className="text-base font-black text-slate-800">Usuário AutoCare</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">Assinante Premium</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-indigo-600 border-b border-indigo-100 pb-2 tracking-[0.1em]">Informações do Veículo</h4>
                            <div className="pt-1 pb-2">
                                <p className="text-xl font-black text-slate-800 leading-normal uppercase tracking-tight">{vehicle.brand} {vehicle.model}</p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-1 leading-relaxed">
                                    {vehicle.year} • {vehicle.engine} • PLACA <span className="font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{vehicle.plate}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div id="chunk-stats" className="print-chunk bg-slate-50/50 p-10 rounded-[40px] flex justify-around items-center border border-slate-100 shadow-sm mb-12 relative overflow-hidden">
                        <div className="absolute left-0 top-0 w-2 h-full bg-indigo-50/50"></div>
                        <div className="text-center">
                            <p className="text-4xl font-black text-indigo-600 tracking-tight">{vehicle.currentMileage.toLocaleString()}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">KM Atual Registrado</p>
                        </div>
                        <div className="w-px h-16 bg-slate-200" />
                        <div className="text-center">
                            <p className="text-4xl font-black text-slate-800 tracking-tight">{records.length}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Serviços Históricos</p>
                        </div>
                    </div>

                    {/* Services Section Header */}
                    <div id="chunk-services-header" className="print-chunk flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl mb-10 shadow-lg shadow-slate-200">
                        <ClipboardList size={22} className="text-indigo-400" />
                        <h4 className="text-xs font-black uppercase tracking-[0.15em]">Descrição Completa dos Serviços e Peças</h4>
                    </div>

                    <div className="space-y-12">
                        {records.length > 0 ? (
                            records.map(record => (
                                <div key={record.id} id={`chunk-record-${record.id}`} className="print-chunk relative border-l-[10px] border-indigo-600 pl-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="max-w-[75%]">
                                            <p className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight">{record.taskTitle}</p>
                                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                                                REALIZADO EM {new Date(record.date).toLocaleDateString('pt-BR')} <span className="text-slate-300">•</span> {record.mileage.toLocaleString()} KM
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-3 min-w-[120px]">
                                            <p className="text-xl font-black text-indigo-600 tracking-tighter">R$ {record.cost.toFixed(2)}</p>
                                            {record.receiptUrl && (
                                                <button
                                                    onClick={() => onViewReceipt(record.receiptUrl!)}
                                                    className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 no-print border border-indigo-100"
                                                >
                                                    <Eye size={14} /> Ver Nota
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/80 p-8 rounded-[32px] border border-slate-100/50 backdrop-blur-sm">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2 tracking-widest">
                                            <PenTool size={14} strokeWidth={3} className="text-indigo-600" /> Descrição do serviço e detalhamento de peças:
                                        </p>
                                        <p className="text-[13px] text-slate-600 leading-relaxed font-semibold whitespace-pre-wrap italic opacity-90">
                                            {record.notes || "Nenhum detalhe adicional informado para este registro."}
                                        </p>
                                    </div>

                                    {record.receiptUrl && (
                                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">Anexo: Miniatura do Comprovante</p>
                                            <div className="w-40 h-40 rounded-3xl overflow-hidden border-[3px] border-white shadow-md bg-slate-50">
                                                <img
                                                    src={record.receiptUrl}
                                                    alt="Recibo"
                                                    className="w-full h-full object-cover"
                                                    crossOrigin="anonymous"
                                                    loading="eager"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div id="chunk-no-records" className="print-chunk py-32 text-center text-slate-300 italic text-lg font-medium tracking-tight">Não há registros de serviços cadastrados para este veículo.</div>
                        )}
                    </div>

                    {/* Footer Section */}
                    <div id="chunk-footer" className="print-chunk pt-16 mt-16 border-t-2 border-slate-100 space-y-8">
                        <div className="flex justify-between items-end">
                            <div className="space-y-3">
                                <p className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.25em]">Certificação AutoCare IA</p>
                                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[500px] font-semibold italic opacity-80">
                                    Documento autogerado via plataforma AutoCare. Este registro é mantido em nuvem para fins de histórico de manutenção preventiva.
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-black uppercase text-slate-900 tracking-widest">ID de Autenticação</p>
                                <p className="text-[10px] font-mono text-slate-300 uppercase tracking-[0.15em] mt-2">
                                    {vehicle.plate.replace('-', '')}-{Math.floor(Date.now() / 1000)}
                                </p>
                            </div>
                        </div>
                        <div className="text-center bg-slate-900 text-white py-4 rounded-[18px] shadow-lg shadow-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] ml-[0.5em]">Garantia de Organização para seu Veículo</p>
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
