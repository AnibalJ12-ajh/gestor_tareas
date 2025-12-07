// Ubicación: GESTOR_TAREAS/types.ts

// 1. Enum de Estados
export enum TaskStatus {
  PENDING = 'Pendiente',
  IN_PROGRESS = 'En Progreso',
  COMPLETED = 'Completada',
}

// 2. Colores (Para que las tarjetas se vean bonitas)
export const StatusColors = {
  [TaskStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
};

// 3. Etiquetas (ESTO ES LO QUE FALTABA AHORA)
export const StatusLabels = {
  [TaskStatus.PENDING]: 'Pendiente',
  [TaskStatus.IN_PROGRESS]: 'En Progreso',
  [TaskStatus.COMPLETED]: 'Completada',
};

// 4. Interfaces de Datos
export interface Task {
  id: string | number;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string; // Formato YYYY-MM-DD
  createdAt: number;
}

export type TaskFilter = {
  status: TaskStatus | 'ALL';
  search: string;
};