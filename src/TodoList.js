import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function TodoList() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [newDueDate, setNewDueDate] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [filter, setFilter] = useState('all');
    const [editingIndex, setEditingIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const history = useRef({ past: [], present: todos, future: [] });

    useEffect(() => {
        const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
        setTodos(storedTodos);
        history.current.present = storedTodos;
    }, []);

    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(history.current.present));
    }, [history.current.present]);

    const addToHistory = (newPresent) => {
        history.current = {
            past: [...history.current.past, history.current.present],
            present: newPresent,
            future: [],
        };
    };

    const handleUndo = () => {
        if (history.current.past.length === 0) return;
        const previous = history.current.past[history.current.past.length - 1];
        const newPresent = previous;
        const newPast = history.current.past.slice(0, -1);
        const newFuture = [history.current.present, ...history.current.future];
        history.current = { past: newPast, present: newPresent, future: newFuture };
        setTodos(newPresent);
    };

    const handleRedo = () => {
        if (history.current.future.length === 0) return;
        const next = history.current.future[0];
        const newPresent = next;
        const newPast = [...history.current.past, history.current.present];
        const newFuture = history.current.future.slice(1);
        history.current = { past: newPast, present: newPresent, future: newFuture };
        setTodos(newPresent);
    };

    const handleAddTodo = () => {
        if (newTodo) {
            const newTodoItem = {
                text: newTodo,
                completed: false,
                priority: newPriority,
                dueDate: newDueDate,
                category: newCategory,
                notes: newNotes,
            };
            const newTodos = [...todos, newTodoItem];
            addToHistory(newTodos);
            setTodos(newTodos);
            setNewTodo('');
            setNewPriority('medium');
            setNewDueDate('');
            setNewCategory('');
            setNewNotes('');
        }
    };

    const handleDeleteTodo = (index) => {
        const newTodos = [...todos];
        newTodos.splice(index, 1);
        addToHistory(newTodos);
        setTodos(newTodos);
    };

    const handleToggleComplete = (index) => {
        const newTodos = [...todos];
        newTodos[index].completed = !newTodos[index].completed;
        addToHistory(newTodos);
        setTodos(newTodos);
    };

    const getTaskClassName = (completed) => {
        return completed ? 'completed-task' : '';
    };

    const handleEditStart = (index) => {
        setEditingIndex(index);
    };

    const handleEditChange = (e, index) => {
        const newTodos = [...todos];
        newTodos[index].text = e.target.value;
        setTodos(newTodos);
    };

    const handleEditBlur = (index) => {
        setEditingIndex(null);
    };

    const handleEditKeyPress = (e, index) => {
        if (e.key === 'Enter') {
            setEditingIndex(null);
        }
    };

    const sortTasksBy = (key) => {
        const sortedTodos = [...todos];
        if (key === 'dueDate') {
            sortedTodos.sort((a, b) => {
                const dateA = a.dueDate ? new Date(a.dueDate) : null;
                const dateB = b.dueDate ? new Date(b.dueDate) : null;
                return (dateA || Infinity) - (dateB || Infinity);
            });
        } else if (key === 'priority') {
            const priorityOrder = { low: 1, medium: 2, high: 3 };
            sortedTodos.sort((a, b) =>
                priorityOrder[a.priority] - priorityOrder[b.priority]
            );
        }
        addToHistory(sortedTodos);
        setTodos(sortedTodos);
    };

    const prioritizeTasks = () => {
        const sortedTodos = [...todos];
        sortedTodos.sort((a, b) => {
            const priorityOrder = { low: 1, medium: 2, high: 3 };

            const urgencyA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const urgencyB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            const importanceA = priorityOrder[a.priority];
            const importanceB = priorityOrder[b.priority];

            const quadrantA = urgencyA + importanceA;
            const quadrantB = urgencyB + importanceB;

            return quadrantA - quadrantB;
        });
        addToHistory(sortedTodos);
        setTodos(sortedTodos);
    };

    return (
        <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
            <h1>To-Do List</h1>
            <button onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
            <div className="input-container">
                <label htmlFor="newTodo">Task</label>
                <input
                    type="text"
                    id="newTodo"
                    placeholder="Add a new task"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                />
            </div>
            <div className="input-container">
                <label htmlFor="newPriority">Priority</label>
                <select
                    id="newPriority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                </select>
            </div>
            <div className="input-container">
                <label htmlFor="newDueDate">Due Date</label>
                <input
                    type="date"
                    id="newDueDate"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                />
            </div>
            <div className="input-container">
                <label htmlFor="newCategory">Category</label>
                <select
                    id="newCategory"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                >
                    <option value="">Select Category</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="shopping">Shopping</option>
                </select>
            </div>
            <div className="input-container">
                <label htmlFor="newNotes">Notes</label>
                <textarea
                    id="newNotes"
                    placeholder="Notes"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                />
            </div>
            <button onClick={handleAddTodo}>Add</button>
            <div>
                <select onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="incomplete">Incomplete</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="shopping">Shopping</option>
                </select>
                <input
                    type="text"
                    placeholder="Search tasks"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <p>Total Tasks: {todos.length}</p>
            <p>Completed Tasks: {todos.filter((todo) => todo.completed).length}</p>
            <ul>
                {todos
                    .filter((todo) => {
                        if (filter === 'completed') return todo.completed;
                        if (filter === 'incomplete') return !todo.completed;
                        if (filter === 'work') return todo.category === 'work';
                        if (filter === 'personal') return todo.category === 'personal';
                        if (filter === 'shopping') return todo.category === 'shopping';
                        return true;
                    })
                    .filter((todo) => {
                        return todo.text.toLowerCase().includes(searchQuery.toLowerCase());
                    })
                    .map((todo, index) => (
                        <li key={index} className={getTaskClassName(todo.completed)}>
                            {editingIndex === index ? (
                                <input
                                    type="text"
                                    value={todo.text}
                                    onChange={(e) => handleEditChange(e, index)}
                                    onBlur={() => handleEditBlur(index)}
                                    onKeyPress={(e) => handleEditKeyPress(e, index)}
                                    autoFocus
                                />
                            ) : (
                                <span onDoubleClick={() => handleEditStart(index)}>
                                    {todo.text} (Priority: {todo.priority}, Due Date: {todo.dueDate}, Category: {todo.category})
                                    <p>Notes: {todo.notes}</p>
                                </span>
                            )}
                            <button onClick={() => handleDeleteTodo(index)}>Delete</button>
                            <button onClick={() => handleToggleComplete(index)}>
                                Toggle Complete
                            </button>
                        </li>
                    ))}
            </ul>
            <div>
                <button onClick={() => sortTasksBy('dueDate')}>Sort by Due Date</button>
                <button onClick={() => sortTasksBy('priority')}>Sort by Priority</button>
                <button onClick={prioritizeTasks}>Prioritize Tasks</button>
                <button onClick={handleUndo} disabled={history.current.past.length === 0}>Undo</button>
                <button onClick={handleRedo} disabled={history.current.future.length === 0}>Redo</button>
            </div>
        </div>
    );
}

export default TodoList;
