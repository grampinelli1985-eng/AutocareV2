
import React from 'react';
import { Scale, ShieldCheck, X } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onAccept, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto border border-indigo-100 dark:border-indigo-900">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl mx-auto flex items-center justify-center">
                        <Scale size={32} className="text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Contrato de Uso</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Proteção Legal AutoCare</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed font-medium">
                    <p>
                        <strong className="text-indigo-600">1. ISENÇÃO DE RESPONSABILIDADE MECÂNICA:</strong> O AutoCare fornece sugestões e informações com base em manuais técnicos, dados públicos e inteligência artificial, com finalidade exclusivamente educativa. As informações disponibilizadas não substituem diagnóstico, inspeção ou reparo realizado por mecânico ou profissional certificado.
                    </p>
                    <p>
                        <strong className="text-indigo-600">2. SEGURANÇA E RECUPERAÇÃO:</strong> O sistema de alerta comunitário tem caráter informativo e colaborativo. Recomendamos expressamente que o usuário não tente qualquer abordagem direta em caso de roubo, devendo sempre acionar as autoridades.
                    </p>
                    <p>
                        <strong className="text-indigo-600">3. PRIVACIDADE E GPS:</strong> O AutoCare solicita acesso à sua localização (GPS) apenas durante o uso para calcular distâncias em alertas ou validar avistamentos. Ao registrar um avistamento, você autoriza o compartilhamento da localização aproximada. Não rastreamos você em tempo real ou em segundo plano. Consulte nossa <a href="https://sites.google.com/view/politicadeprivacidadeautocare/in%C3%ADcio" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Política de Privacidade completa</a>.
                    </p>
                    <p>
                        <strong className="text-indigo-600">4. USO DO PLANO:</strong> O Plano Free permite o uso limitado. O upgrade para o Plano Premium oferece acesso ilimitado e relatórios, via Google Play Billing no Android.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onAccept}
                        className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black active:scale-95 shadow-xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                    >
                        <ShieldCheck size={18} /> Aceitar e Continuar
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                    >
                        Ler Depois
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
