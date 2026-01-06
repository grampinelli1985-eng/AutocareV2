
import React, { useState } from 'react';
import { Plus, Settings, AlertTriangle, Activity, X, Fuel } from 'lucide-react';

interface FABProps {
  className?: string;
  onNewService?: () => void;
  onUpdateKm?: () => void;
}

const FAB: React.FC<FABProps> = ({ className, onNewService, onUpdateKm }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { 
      icon: Activity, 
      label: 'Registrar KM', 
      color: 'bg-blue-500', 
      action: () => onUpdateKm ? onUpdateKm() : alert('Função não disponível') 
    },
    { 
      icon: Settings, 
      label: 'Novo Serviço', 
      color: 'bg-indigo-500', 
      action: () => onNewService ? onNewService() : alert('Função não disponível') 
    },
    { 
      icon: Fuel, 
      label: 'Abastecimento', 
      color: 'bg-emerald-500', 
      action: () => alert('Calcule o consumo médio e custo por km rodado.') 
    },
    { 
      icon: AlertTriangle, 
      label: 'Relatar Problema', 
      color: 'bg-amber-500', 
      action: () => alert('Descreva um barulho ou defeito para diagnóstico da IA.') 
    },
  ];

  return (
    <div className={`fixed bottom-24 right-6 z-[60] ${className || ''}`}>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`flex flex-col items-end gap-3 mb-4 transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10 pointer-events-none'}`}>
        {actions.map((action, idx) => (
          <div key={idx} className="flex items-center gap-3 group">
            <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
              {action.label}
            </span>
            <button 
              onClick={() => { action.action(); setIsOpen(false); }}
              className={`${action.color} text-white p-3 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all`}
            >
              <action.icon size={20} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-indigo-600 text-white p-4 rounded-[24px] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all duration-300 active:scale-90 ${isOpen ? 'rotate-45 bg-slate-800 dark:bg-slate-700 shadow-none' : ''}`}
      >
        {isOpen ? <X size={28} /> : <Plus size={28} />}
      </button>
    </div>
  );
};

export default FAB;
