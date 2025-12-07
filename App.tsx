import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskFilter } from './types';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { api } from './services/api'; // <--- IMPORTANTE

import { PlusIcon, CheckCircleIcon, ChartBarSquareIcon, ListBulletIcon, ArrowRightOnRectangleIcon } from './components/Icons';

type ViewMode = 'list' | 'dashboard';
type User = { email: string };

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  
  // State for tasks (Inicializa vacío, ya no lee de localStorage)
  const [tasks, setTasks] = useState<Task[]>([]);

  // State for UI
  const [view, setView] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<TaskFilter>({ status: 'ALL', search: '' });

  // 1. Persistence for Auth (Mantenemos esto para que no te saque al refrescar)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 2. Cargar Tareas desde el Backend cuando hay usuario
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    const data = await api.getTasks();
    setTasks(data);
  };

  // Derived state (Filtered tasks)
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Nota: Asegúrate de que tus TaskStatus en types.ts coincidan con "Pendiente", "En Progreso", etc.
      // Si el backend devuelve strings exactos, el filtro debe coincidir.
      const matchesStatus = filter.status === 'ALL' || task.status === filter.status;
      const matchesSearch = task.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                            (task.description && task.description.toLowerCase().includes(filter.search.toLowerCase()));
      return matchesStatus && matchesSearch;
    }).sort((a, b) => {
      if (a.status === b.status) {
         // Aseguramos que dueDate exista antes de comparar
         return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0; 
    });
  }, [tasks, filter]);

  // Handlers
  const handleLogin = (email: string) => {
    // Aquí podrías conectar el login real con api.login(email, password) en el futuro
    const newUser = { email };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setTasks([]); // Limpiar tareas al salir
  };

  const handleCreateOrUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      // Lógica de Edición (Requiere endpoint PUT en backend)
      // Por ahora actualizamos localmente y simulamos llamada
      await api.updateTask(editingTask.id, taskData);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
    } else {
      // Lógica de Creación (Real con Backend)
      const newTask = await api.createTask({
        ...taskData,
        status: TaskStatus.PENDING // Asegurar estado inicial
      });
      
      if (newTask) {
        setTasks(prev => [...prev, newTask]);
      }
    }
    
    closeModal();
    if (!editingTask && view === 'dashboard') {
        setView('list');
    }
    // Opcional: Recargar todo desde el servidor para estar seguros
    // loadTasks(); 
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      const success = await api.deleteTask(id);
      // Si el backend no tiene el endpoint DELETE aún, esto fallará. 
      // Si falla, puedes comentar la línea de arriba y solo hacer el setTasks para probar visualmente.
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    // Optimistic UI update (actualiza visualmente primero)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    
    // Llamada al backend
    const task = tasks.find(t => t.id === id);
    if (task) {
      await api.updateTask(id, { ...task, status });
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-10 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Gestor Pro</h1>
            </div>

            {/* View Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setView('list')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListBulletIcon className="w-4 h-4 mr-1.5" />
                Lista
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'dashboard' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ChartBarSquareIcon className="w-4 h-4 mr-1.5" />
                Dashboard
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-gray-500">Sesión iniciada como</span>
                <span className="text-sm font-medium text-gray-800">{user.email}</span>
              </div>
              
              <button 
                onClick={openCreateModal}
                className="hidden md:flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Nueva Tarea
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'dashboard' ? (
          <Dashboard tasks={tasks} />
        ) : (
          <>
            {/* Filters */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="w-full md:w-auto flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilter(prev => ({ ...prev, status: 'ALL' }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter.status === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Todas
                </button>
                {/* Asegúrate que TaskStatus.PENDING coincida con lo que viene del backend ("Pendiente") */}
                <button 
                  onClick={() => setFilter(prev => ({ ...prev, status: TaskStatus.PENDING }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter.status === TaskStatus.PENDING ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                >
                  Pendientes
                </button>
                <button 
                  onClick={() => setFilter(prev => ({ ...prev, status: TaskStatus.IN_PROGRESS }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter.status === TaskStatus.IN_PROGRESS ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                >
                  En Progreso
                </button>
                <button 
                  onClick={() => setFilter(prev => ({ ...prev, status: TaskStatus.COMPLETED }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter.status === TaskStatus.COMPLETED ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                >
                  Completadas
                </button>
              </div>

              <div className="w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Buscar tareas..." 
                  value={filter.search}
                  onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Grid de Tareas */}
            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onEdit={openEditModal} 
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                  <PlusIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tareas</h3>
                <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva tarea o ajusta tus filtros.</p>
                <div className="mt-6">
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Crear Tarea
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Botón flotante móvil */}
      <button
        onClick={openCreateModal}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-40 transition-transform active:scale-95"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <TaskForm 
          initialData={editingTask} 
          onSubmit={handleCreateOrUpdateTask} 
          onCancel={closeModal} 
        />
      )}
    </div>
  );
};

export default App;