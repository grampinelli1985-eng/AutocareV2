
import React from 'react';
import { CheckCircle2, AlertCircle, Clock, ChevronRight, Check } from 'lucide-react';
import { MaintenanceTask } from '../types';

interface MaintenanceListProps {
  tasks: MaintenanceTask[];
  currentKm: number;
  onCompleteTask?: (task: MaintenanceTask) => void;
}

const MaintenanceList: React.FC<MaintenanceListProps> = ({ tasks, currentKm, onCompleteTask }) => {
  const getTaskStatus = (task: MaintenanceTask) => {
    const nextKm = (task.lastDoneKm || 0) + task.intervalKm;
    const diff = nextKm - currentKm;
    
    if (diff <= 0) return { label: 'Atrasado', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: AlertCircle };
    if (diff <= 1000) return { label: 'Próximo', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10', icon: Clock };
    return { label: 'Em dia', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', icon: CheckCircle2 };
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const status = getTaskStatus(task);
        const StatusIcon = status.icon;
        
        return (
          <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group">
            <div className={`p-2 rounded-lg ${status.bg} ${status.color}`}>
              <StatusIcon size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{task.title}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Intervalo: {task.intervalKm.toLocaleString()} km</p>
            </div>

            <div className="text-right shrink-0">
              <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${status.bg} ${status.color}`}>
                {status.label}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Prox: {((task.lastDoneKm || 0) + task.intervalKm).toLocaleString()} km
              </p>
            </div>
            
            {onCompleteTask && (
              <button 
                onClick={() => onCompleteTask(task)}
                className="ml-2 p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                title="Concluir serviço"
              >
                <Check size={18} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MaintenanceList;
