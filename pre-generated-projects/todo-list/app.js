// TaskManager class to handle all CRUD operations and local storage
class TaskManager {
    constructor() {
        // Load tasks from localStorage or initialize empty array
        this.tasks = this.loadFromLocalStorage();
    }

    // Add new task
    addTask(text) {
        const task = {
            id: Date.now(),
            text: text.trim(),
            completed: false
        };
        this.tasks.push(task);
        this.saveToLocalStorage();
        return task;
    }

    // Edit existing task
    editTask(id, newText) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.text = newText.trim();
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Delete task
    deleteTask(id) {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== id);
        if (this.tasks.length < initialLength) {
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Toggle task completion status
    toggleComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Get all tasks
    getAllTasks() {
        return this.tasks;
    }

    // Get completed tasks
    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    // Clear completed tasks
    clearCompleted() {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => !task.completed);
        if (this.tasks.length < initialLength) {
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Save tasks to localStorage
    saveToLocalStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    // Load tasks from localStorage
    loadFromLocalStorage() {
        const stored = localStorage.getItem('todoTasks');
        return stored ? JSON.parse(stored) : [];
    }
}

// Initialize TaskManager instance
const taskManager = new TaskManager();

// Global functions for UI operations

// Render all tasks
function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    const tasks = taskManager.getAllTasks();
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
    
    updateTaskCounter();
}

// Create task element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';
    li.dataset.taskId = task.id;

    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';

    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;

    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';

    // Complete button
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
    completeBtn.onclick = () => handleToggleComplete(task.id);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => handleEditTask(task.id);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => handleDeleteTask(task.id);

    taskActions.appendChild(completeBtn);
    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);

    taskContent.appendChild(taskText);
    taskContent.appendChild(taskActions);
    li.appendChild(taskContent);

    return li;
}

// Handle adding new task
function handleAddTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }
    
    taskManager.addTask(taskText);
    taskInput.value = '';
    renderTasks();
}

// Handle editing task
function handleEditTask(id) {
    const task = taskManager.getAllTasks().find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
        taskManager.editTask(id, newText.trim());
        renderTasks();
    }
}

// Handle toggling task completion
function handleToggleComplete(id) {
    taskManager.toggleComplete(id);
    renderTasks();
}

// Handle deleting task
function handleDeleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        taskManager.deleteTask(id);
        renderTasks();
    }
}

// Handle clearing completed tasks
function handleClearCompleted() {
    const completedCount = taskManager.getCompletedTasks().length;
    if (completedCount === 0) {
        alert('No completed tasks to clear!');
        return;
    }
    
    if (confirm(`Are you sure you want to clear ${completedCount} completed task(s)?`)) {
        taskManager.clearCompleted();
        renderTasks();
    }
}

// Update task counter
function updateTaskCounter() {
    const allTasks = taskManager.getAllTasks();
    const completedTasks = taskManager.getCompletedTasks();
    const remainingTasks = allTasks.length - completedTasks.length;
    
    const counterElement = document.getElementById('task-counter');
    
    if (allTasks.length === 0) {
        counterElement.textContent = '0 tasks';
    } else if (remainingTasks === 0) {
        counterElement.textContent = 'All tasks completed!';
    } else {
        counterElement.textContent = `${remainingTasks} of ${allTasks.length} tasks remaining`;
    }
    
    // Enable/disable clear completed button
    const clearButton = document.getElementById('clear-completed');
    clearButton.disabled = completedTasks.length === 0;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    renderTasks();
    
    // Add task form submission
    const taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddTask();
    });
    
    // Clear completed button
    const clearButton = document.getElementById('clear-completed');
    clearButton.addEventListener('click', handleClearCompleted);
    
    // Allow Enter key to add task (additional to form submission)
    const taskInput = document.getElementById('task-input');
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddTask();
        }
    });
});