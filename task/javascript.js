// Clase para manejar la aplicación de tareas
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
    }

    // Inicializar elementos del DOM
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.dateInput = document.getElementById('dateInput');
        this.addButton = document.getElementById('addButton');
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.min = today;
        this.dateInput.value = today;
    }

    // Vincular eventos
    bindEvents() {
        this.addButton.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Agregar efecto de focus automático
        this.taskInput.focus();
    }

    // Cargar tareas desde localStorage
    loadTasks() {
        try {
            // NOTA: En Claude.ai artifacts, localStorage no está disponible
            // En tu proyecto local, descomenta la siguiente línea:
            // const stored = localStorage.getItem('todoTasks');
            
            // Para la demostración, usamos un array vacío
            const stored = null; // Simular localStorage vacío
            
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            return [];
        }
    }

    // Guardar tareas en localStorage
    saveTasks() {
        try {
            // NOTA: En Claude.ai artifacts, localStorage no está disponible
            // En tu proyecto local, descomenta la siguiente línea:
            // localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            
            console.log('Tareas guardadas:', this.tasks); // Para debugging
        } catch (error) {
            console.error('Error al guardar tareas:', error);
        }
    }

    // Agregar nueva tarea
    addTask() {
        const taskText = this.taskInput.value.trim();
        const taskDate = this.dateInput.value;

        if (!taskText) {
            this.showValidationError('Por favor, ingresa una tarea');
            return;
        }

        if (!taskDate) {
            this.showValidationError('Por favor, selecciona una fecha');
            return;
        }

        const newTask = {
            id: this.generateId(),
            text: taskText,
            date: taskDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.clearForm();
        
        // Mostrar feedback de éxito
        this.showSuccessAnimation();
    }

    // Eliminar tarea
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        
        // Mostrar animación de eliminación
        this.showDeleteAnimation();
    }

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Limpiar formulario
    clearForm() {
        this.taskInput.value = '';
        this.taskInput.focus();
        
        // Mantener la fecha actual
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
    }

    // Formatear fecha para mostrar
    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const taskDate = new Date(date);
        
        if (this.isSameDay(taskDate, today)) {
            return 'Hoy';
        } else if (this.isSameDay(taskDate, tomorrow)) {
            return 'Mañana';
        } else {
            return date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Verificar si dos fechas son el mismo día
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    // Renderizar todas las tareas
    renderTasks() {
        if (this.tasks.length === 0) {
            this.tasksList.style.display = 'none';
            this.emptyState.style.display = 'block';
            return;
        }

        this.tasksList.style.display = 'flex';
        this.emptyState.style.display = 'none';

        // Ordenar tareas por fecha
        const sortedTasks = [...this.tasks].sort((a, b) => new Date(a.date) - new Date(b.date));

        this.tasksList.innerHTML = sortedTasks.map(task => this.createTaskHTML(task)).join('');

        // Agregar event listeners para los botones de eliminar
        this.tasksList.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                this.deleteTask(taskId);
            });
        });
    }

    // Crear HTML para una tarea
    createTaskHTML(task) {
        const formattedDate = this.formatDate(task.date);
        
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-info">
                        <h3>${this.escapeHtml(task.text)}</h3>
                        <div class="task-date">${formattedDate}</div>
                    </div>
                    <div class="task-actions">
                        <button class="delete-button" data-task-id="${task.id}">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Mostrar error de validación
    showValidationError(message) {
        this.taskInput.style.borderColor = 'var(--danger-color)';
        this.taskInput.placeholder = message;
        
        setTimeout(() => {
            this.taskInput.style.borderColor = '';
            this.taskInput.placeholder = '¿Qué necesitas hacer hoy?';
        }, 3000);
    }

    // Mostrar animación de éxito
    showSuccessAnimation() {
        this.addButton.style.background = 'var(--success-color)';
        this.addButton.innerHTML = '<span>✓</span> ¡Agregada!';
        
        setTimeout(() => {
            this.addButton.style.background = '';
            this.addButton.innerHTML = '<span>+</span> Agregar';
        }, 2000);
    }

    // Mostrar animación de eliminación
    showDeleteAnimation() {
        // Crear un elemento de notificación temporal
        const notification = document.createElement('div');
        notification.textContent = 'Tarea eliminada';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
}

// Agregar estilos de animación para las notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
});