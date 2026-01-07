
import React from 'react';
import { Fuel, Activity, Trash2, Loader2, Crown, ShieldCheck } from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  score: number;
  onDelete?: (id: string) => void;
  onShowHealthInfo?: () => void;
  isLoading?: boolean;
  userPlan?: 'free' | 'premium';
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, score, onDelete, onShowHealthInfo, isLoading, userPlan = 'free' }) => {
  const getScoreColor = (s: number) => {
    if (s > 80) return 'text-green-500 bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20';
    if (s > 50) return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-100 dark:border-yellow-500/20';
    return 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative group transition-all hover:shadow-md overflow-hidden">

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(vehicle.id);
          }}
          className="absolute top-4 right-4 p-3 text-slate-300 hover:text-red-500 active:text-red-600 transition-colors z-10"
          title="Excluir veículo"
        >
          <Trash2 size={20} />
        </button>
      )}

      <div className="flex justify-between items-start mb-5 pr-10">
        <div>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg uppercase text-[8px] font-black tracking-tighter mb-1.5 border shadow-sm ${userPlan === 'premium'
              ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-800'
            }`}>
            {userPlan === 'premium' ? <Crown size={8} /> : <ShieldCheck size={8} />}
            Plano {userPlan}
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{vehicle.brand} {vehicle.model}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mt-1">{vehicle.year} • {vehicle.engine} • {vehicle.transmission}</p>
        </div>

        {isLoading ? (
          <div className="px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/10 shrink-0">
            <Loader2 size={14} className="animate-spin text-indigo-600" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Analisando</span>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowHealthInfo?.();
            }}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border shrink-0 transition-all active:scale-95 ${getScoreColor(score)}`}
          >
            <Activity size={14} />
            <span className="text-[10px] font-black uppercase">{score}% Saúde</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
            <Activity size={14} />
            <span className="text-[9px] uppercase font-black tracking-widest">Quilometragem</span>
          </div>
          <p className="text-lg font-black text-slate-700 dark:text-slate-200">{vehicle.currentMileage.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">KM</span></p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
            <Fuel size={14} />
            <span className="text-[9px] uppercase font-black tracking-widest">Combustível</span>
          </div>
          <p className="text-lg font-black text-slate-700 dark:text-slate-200">{vehicle.fuel}</p>
        </div>
      </div>

      {vehicle.plate && (
        <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black tracking-[0.2em] uppercase">
            {vehicle.plate.slice(0, 3)}***{vehicle.plate.slice(-1)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider italic">Identificação Protegida</span>
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
