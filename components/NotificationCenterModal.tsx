
import React from 'react';
import { X, Bell, ExternalLink } from 'lucide-react';

interface NotificationItem {
    id: string;
    type: 'theft' | 'maintenance' | 'info';
    title: string;
    message: string;
    date: string;
    isRead: boolean;
    mapUrl?: string;
}

interface NotificationCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: NotificationItem[];
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
    isOpen,
    onClose,
    notifications,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh]">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"><Bell size={18} /></div>
                        <h2 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight">Centro de Alertas</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <div key={n.id} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex gap-4 transition-all hover:bg-white dark:hover:bg-slate-800">
                                <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${n.type === 'theft' ? 'bg-red-500 animate-pulse' : n.type === 'maintenance' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                                <div className="space-y-1 flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase leading-none tracking-tight">{n.title}</p>
                                        {n.mapUrl && (
                                            <a
                                                href={n.mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-tighter hover:underline"
                                            >
                                                <ExternalLink size={10} />
                                                Ver no Mapa
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-snug">{n.message}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-1">{new Date(n.date).toLocaleDateString()} {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <Bell size={48} className="text-slate-200 dark:text-slate-800 mx-auto" />
                            <p className="text-sm font-bold text-slate-400">Nenhuma notificação por enquanto.</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={onClose} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95">Fechar</button>
                </div>
            </div>
        </div>
    );
};
