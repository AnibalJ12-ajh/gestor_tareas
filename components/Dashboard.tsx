import React from 'react';
import { Task, TaskStatus } from '../types';

interface DashboardProps {
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  // Statistics Calculation
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;

  // Percentage for progress bar
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  // SVG Pie Chart Data
  // Circumference of a circle with r=40 is ~251.32
  const r = 40;
  const circ = 2 * Math.PI * r;

  const pctPending = total === 0 ? 0 : pending / total;
  const pctInProgress = total === 0 ? 0 : inProgress / total;
  const pctCompleted = total === 0 ? 0 : completed / total;

  const offsetPending = circ - (pctPending * circ);
  const offsetInProgress = circ - (pctInProgress * circ);
  const offsetCompleted = circ - (pctCompleted * circ);

  // Rotation offsets
  const startPending = 0;
  const startInProgress = -(pctPending * 360); 
  const startCompleted = -((pctPending + pctInProgress) * 360);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm text-gray-500 font-medium">Total Tareas</span>
          <span className="text-3xl font-bold text-gray-800 mt-2">{total}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-yellow-400 border-gray-100 flex flex-col">
          <span className="text-sm text-gray-500 font-medium">Pendientes</span>
          <span className="text-3xl font-bold text-yellow-600 mt-2">{pending}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-blue-500 border-gray-100 flex flex-col">
          <span className="text-sm text-gray-500 font-medium">En Progreso</span>
          <span className="text-3xl font-bold text-blue-600 mt-2">{inProgress}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-green-500 border-gray-100 flex flex-col">
          <span className="text-sm text-gray-500 font-medium">Completadas</span>
          <span className="text-3xl font-bold text-green-600 mt-2">{completed}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-800 mb-6 w-full">Distribución de Estados</h3>
          
          {total > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
              {/* SVG Donut Chart */}
              <div className="relative w-48 h-48">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r={r} fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
                  
                  {/* Pending Segment */}
                  {pending > 0 && (
                    <circle 
                      cx="50" cy="50" r={r} 
                      fill="transparent" 
                      stroke="#eab308" // yellow-500
                      strokeWidth="12" 
                      strokeDasharray={circ}
                      strokeDashoffset={offsetPending}
                      style={{ transformOrigin: '50px 50px', transform: `rotate(${startPending}deg)` }}
                    />
                  )}
                  
                  {/* In Progress Segment */}
                  {inProgress > 0 && (
                    <circle 
                      cx="50" cy="50" r={r} 
                      fill="transparent" 
                      stroke="#3b82f6" // blue-500
                      strokeWidth="12" 
                      strokeDasharray={circ}
                      strokeDashoffset={offsetInProgress}
                      style={{ transformOrigin: '50px 50px', transform: `rotate(${startInProgress}deg)` }}
                    />
                  )}

                  {/* Completed Segment */}
                  {completed > 0 && (
                     <circle 
                      cx="50" cy="50" r={r} 
                      fill="transparent" 
                      stroke="#22c55e" // green-500
                      strokeWidth="12" 
                      strokeDasharray={circ}
                      strokeDashoffset={offsetCompleted}
                      style={{ transformOrigin: '50px 50px', transform: `rotate(${startCompleted}deg)` }}
                    />
                  )}
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-3xl font-bold text-gray-800">{completionRate}%</span>
                   <span className="text-xs text-gray-500">Completado</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-600">Pendientes ({Math.round(pctPending * 100)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">En Progreso ({Math.round(pctInProgress * 100)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Completadas ({Math.round(pctCompleted * 100)}%)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm italic">
              No hay datos suficientes
            </div>
          )}
        </div>

        {/* Efficiency / Simple Progress Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Progreso Global</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Tasa de finalización</span>
                <span className="text-sm font-medium text-gray-700">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Desglose rápido</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600">Tareas Activas (P + EP)</span>
                  <span className="font-semibold">{pending + inProgress}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Total Histórico</span>
                  <span className="font-semibold">{total}</span>
                </li>
              </ul>
            </div>
            
             <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-800">
                  <strong>Tip de productividad:</strong> 
                  {pending > inProgress + completed 
                    ? " Tienes muchas tareas pendientes. Intenta priorizar 3 para hoy." 
                    : " ¡Buen ritmo! Mantén el enfoque en las tareas en progreso."}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;