class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.initializeElements();
        this.setupEventListeners();
        this.loadTheme();
        this.renderTodos();
        this.updateStats();
    }

    initializeElements() {
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.dateInput = document.getElementById('due-date');
        this.prioritySelect = document.getElementById('priority');
        this.todoList = document.getElementById('todo-list');
        this.themeSwitcher = document.querySelector('.theme-switcher');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.sortButtons = document.querySelectorAll('.sort-btn');
        this.clearCompletedBtn = document.getElementById('clear-completed');
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.themeSwitcher.addEventListener('click', () => this.toggleTheme());
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleFilter(btn));
        });
        this.sortButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleSort(btn));
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    }

    handleSubmit(e) {
        e.preventDefault();
        const text = this.input.value.trim();
        const dueDate = this.dateInput.value;
        const priority = this.prioritySelect.value;

        if (text) {
            this.addTodo(text, dueDate, priority);
            this.input.value = '';
            this.dateInput.value = '';
            this.prioritySelect.value = 'low';
        }
    }

    addTodo(text, dueDate, priority) {
        const todo = {
            id: Date.now(),
            text,
            completed: false,
            dueDate,
            priority,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.renderTodos();
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo => 
            todo.id === id ? {...todo, completed: !todo.completed} : todo
        );
        this.saveTodos();
        this.renderTodos();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.renderTodos();
    }

    editTodo(id, newText) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? {...todo, text: newText} : todo
        );
        this.saveTodos();
        this.renderTodos();
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.renderTodos();
    }

    handleFilter(btn) {
        this.filterButtons.forEach(button => button.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.renderTodos();
    }

    handleSort(btn) {
        this.currentSort = btn.dataset.sort;
        this.renderTodos();
    }

    filterTodos() {
        return this.todos.filter(todo => {
            if (this.currentFilter === 'active') return !todo.completed;
            if (this.currentFilter === 'completed') return todo.completed;
            return true;
        });
    }

    sortTodos(todos) {
        return todos.sort((a, b) => {
            if (this.currentSort === 'date') {
                return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
            } else if (this.currentSort === 'priority') {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return 0;
        });
    }

    renderTodos() {
        const filteredTodos = this.filterTodos();
        const sortedTodos = this.sortTodos(filteredTodos);
        
        this.todoList.innerHTML = '';
        sortedTodos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            this.todoList.appendChild(todoElement);
        });
        
        this.updateStats();
    }

    createTodoElement(todo) {
        const li = document.createElement('div');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

        const content = document.createElement('div');
        content.className = 'todo-content';

        const text = document.createElement('div');
        text.className = 'todo-text';
        text.textContent = todo.text;
        text.addEventListener('dblclick', () => this.startEditing(text, todo));

        const details = document.createElement('div');
        details.className = 'todo-details';

        if (todo.dueDate) {
            const date = document.createElement('span');
            date.innerHTML = `<i class="fas fa-calendar"></i> ${todo.dueDate}`;
            details.appendChild(date);
        }

        const priority = document.createElement('span');
        priority.className = `priority-badge priority-${todo.priority}`;
        priority.textContent = todo.priority;
        details.appendChild(priority);

        const actions = document.createElement('div');
        actions.className = 'todo-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        content.appendChild(text);
        content.appendChild(details);

        li.appendChild(checkbox);
        li.appendChild(content);
        li.appendChild(actions);
        actions.appendChild(deleteBtn);

        return li;
    }

    startEditing(textElement, todo) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.text;
        input.className = 'edit-input';
        
        const finishEditing = () => {
            const newText = input.value.trim();
            if (newText) {
                this.editTodo(todo.id, newText);
            }
            textElement.replaceWith(input);
        };

        input.addEventListener('blur', finishEditing);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            }
        });

        textElement.replaceWith(input);
        input.focus();
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const remaining = total - completed;

        document.getElementById('tasks-counter').textContent = `${remaining} tasks remaining`;
        document.getElementById('completed-counter').textContent = `${completed} completed`;
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.loadTheme();
    }

    loadTheme() {
        document.body.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        this.themeSwitcher.innerHTML = this.isDarkMode ? 
            '<i class="fas fa-sun"></i>' : 
            '<i class="fas fa-moon"></i>';
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});