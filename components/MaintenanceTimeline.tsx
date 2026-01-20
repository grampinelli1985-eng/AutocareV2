
import React from 'react';
import { CheckCircle2, Clock, AlertCircle, History, ChevronRight } from 'lucide-react';
import { MaintenanceMilestone, MaintenanceTask } from '../types';

interface MaintenanceTimelineProps {
  milestones: MaintenanceMilestone[];
  onCompleteTask: (task: MaintenanceTask, km: number) => void;
  onViewDetail?: (milestone: MaintenanceMilestone) => void;
}

const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ milestones, onCompleteTask, onViewDetail }) => {
  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
      {milestones.map((milestone, idx) => {
        const isDone = milestone.status === 'done';
        const isOverdue = milestone.status === 'overdue';
        const isUpcoming = milestone.status === 'upcoming';

        return (
          <div key={idx} className="relative flex items-start gap-6 group">
            {/* Indicador de Status na Linha */}
            <div className={`absolute left-0 mt-1.5 w-10 h-10 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center z-10 transition-all ${isDone ? 'bg-green-500' : isOverdue ? 'bg-red-500' : isUpcoming ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
              {isDone ? <CheckCircle2 size={20} className="text-white" /> :
                isOverdue ? <AlertCircle size={20} className="text-white" /> :
                  <Clock size={20} className="text-white" />}
            </div>

            <div className="ml-12 flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className={`text-lg font-black tracking-tight ${isDone ? 'text-green-600' : isOverdue ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}>
                    {milestone.km.toLocaleString()} KM
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${milestone.isWarranty ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                      {milestone.isWarranty ? 'Garantia' : 'Pós-Garantia'}
                    </span>
                    {isDone && <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><History size={10} /> Realizado</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isDone && (
                    <button
                      onClick={() => onViewDetail ? onViewDetail(milestone) : onCompleteTask(milestone.tasks[0], milestone.km)}
                      className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-lg active:scale-95 transition-all hover:bg-indigo-700"
                    >
                      REGISTRAR
                    </button>
                  )}
                  {onViewDetail && (
                    <button
                      onClick={() => onViewDetail(milestone)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all"
                      title="Ver detalhes"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-3 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors" onClick={() => onViewDetail?.(milestone)}>
                {milestone.tasks.slice(0, 2).map((task, tIdx) => (
                  <div key={tIdx} className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{task.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-relaxed truncate max-w-[200px]">{task.description}</p>
                    </div>
                  </div>
                ))}
                {milestone.tasks.length > 2 && (
                  <p className="text-[9px] font-bold text-indigo-500 uppercase">+ {milestone.tasks.length - 2} outros itens</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MaintenanceTimeline;
