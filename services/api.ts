import { Task, TaskStatus } from '../types';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

interface ApiTaskInput {
  title: string;
  description: string;
  deadline: string;
  status: string;
}

const mapToFrontend = (apiTask: any): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description,
  status: apiTask.status as TaskStatus,
  dueDate: apiTask.deadline,
  createdAt: Date.now()
});

// Helper para enviar el token en cada petición
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

export const api = {
  // --- LOGIN REAL ---
  login: async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      // Si el servidor responde 400 o 401, es error (retorna false)
      if (!response.ok) return false;
      
      const data = await response.json();
      if (data.access_token) {
        // Guardamos el token real
        localStorage.setItem("token", data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error de conexión:", error);
      return false;
    }
  },

  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Error al cargar tareas");
      const data = await response.json();
      return data.map(mapToFrontend);
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createTask: async (task: { title: string; description: string; dueDate: string; status: string }) => {
    try {
      const payload: ApiTaskInput = {
        title: task.title,
        description: task.description,
        status: task.status,
        deadline: task.dueDate 
      };

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al crear tarea");
      return mapToFrontend(await response.json());
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  updateTask: async (id: string | number, task: any) => {
    try {
      const payload = {
        title: task.title,
        description: task.description,
        status: task.status,
        deadline: task.dueDate 
      };

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al actualizar tarea");
      return mapToFrontend(await response.json());
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  deleteTask: async (id: string | number) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};