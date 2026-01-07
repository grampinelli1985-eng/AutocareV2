
import React from 'react';
import { X, FileText } from 'lucide-react';

interface ReceiptViewModalProps {
    isOpen: boolean;
    url: string | null;
    onClose: () => void;
}

export const ReceiptViewModal: React.FC<ReceiptViewModalProps> = ({
    isOpen,
    url,
    onClose
}) => {
    if (!isOpen || !url) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onClose}
                        className="p-3 bg-slate-900/50 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight">Comprovante Digital</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Visualização do documento original</p>
                    </div>
                </div>

                <div className="aspect-[3/4] sm:aspect-auto sm:h-[70vh] w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-auto p-4">
                    <img
                        src={url}
                        alt="Comprovante de Serviço"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=Erro+ao+carregar+imagem';
                        }}
                    />
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-lg"
                    >
                        Fechar Galeria
                    </button>
                </div>
            </div>
        </div>
    );
};
