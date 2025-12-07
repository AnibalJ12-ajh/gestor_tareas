import React from 'react';
import { Task, TaskStatus, StatusColors, StatusLabels } from '../types';
import { ClockIcon, PencilIcon, TrashIcon } from './Icons';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col h-full relative overflow-hidden group`}>
      {/* Left colored border indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.status === TaskStatus.COMPLETED ? 'bg-green-500' : task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-500' : 'bg-yellow-400'}`}></div>
      
      <div className="flex justify-between items-start mb-3 pl-2">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${StatusColors[task.status]}`}>
          {StatusLabels[task.status]}
        </span>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Editar"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className={`text-lg font-bold text-gray-800 mb-2 pl-2 ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-400' : ''}`}>
        {task.title}
      </h3>
      
      <p className={`text-sm text-gray-600 mb-4 flex-grow whitespace-pre-line pl-2 ${task.status === TaskStatus.COMPLETED ? 'text-gray-400' : ''}`}>
        {task.description}
      </p>

      <div className="mt-auto pl-2 flex items-center justify-between text-sm pt-4 border-t border-gray-50">
        <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
          <ClockIcon className="w-4 h-4" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          {isOverdue && <span className="text-xs ml-1">(Vencida)</span>}
        </div>

        {/* Quick Status Toggle */}
        <select 
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="text-xs border-none bg-gray-50 text-gray-600 rounded-md focus:ring-0 cursor-pointer hover:bg-gray-100 py-1 pl-2 pr-6"
        >
          {Object.values(TaskStatus).map((status) => (
            <option key={status} value={status}>
              Mover a {StatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TaskCard;