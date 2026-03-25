import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [deadlineValue, setDeadlineValue] = useState(() => {
    // Set default deadline to today's date
    const today = new Date().toISOString().split('T')[0];
    return today;
  });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newTodo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        deadline: deadlineValue || null,
        createdAt: new Date().toISOString()
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
      // Reset deadline to today after adding
      const today = new Date().toISOString().split('T')[0];
      setDeadlineValue(today);
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (id, text, deadline) => {
    setEditingId(id);
    setEditText(text);
    setEditDeadline(deadline || '');
  };

  const saveEdit = (id) => {
    if (editText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === id ? { 
          ...todo, 
          text: editText.trim(),
          deadline: editDeadline || null
        } : todo
      ));
      setEditingId(null);
      setEditText('');
      setEditDeadline('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditDeadline('');
  };

  // const getActiveCount = () => {
  //   return todos.filter(todo => !todo.completed).length;
  // };

  const getCompletedCount = () => {
    return todos.filter(todo => todo.completed).length;
  };

  const isOverdue = (deadline, completed) => {
    if (!deadline || completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return deadline < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Sort todos by deadline (earlier deadline first)
  // Tasks without deadline are placed at the end
  const getSortedTodos = (completedStatus) => {
    const filteredTodos = todos.filter(todo => todo.completed === completedStatus);
    return [...filteredTodos].sort((a, b) => {
      // If both have deadlines, compare dates
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      // If only a has deadline, a comes first
      if (a.deadline) return -1;
      // If only b has deadline, b comes first
      if (b.deadline) return 1;
      // If neither has deadline, sort by creation date (oldest first)
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  };

  // const activeCount = getActiveCount();
  const completedCount = getCompletedCount();
  const activeTodos = getSortedTodos(false);
  const completedTodos = getSortedTodos(true);

  return (
    <div className="App">
      {/* Header with Centered Tabs */}
      <div className="app-header">
        <div className="header-tabs-container">
          <button 
            className={`header-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <span className="tab-icon">📝</span>
            <span className="tab-text">Todo List</span>
            {/* {activeCount > 0 && <span className="tab-count active-count">{activeCount}</span>} */}
          </button>
          <button 
            className={`header-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <span className="tab-icon">✅</span>
            <span className="tab-text">Completed</span>
            {/* {completedCount > 0 && <span className="tab-count completed-count">{completedCount}</span>} */}
          </button>
        </div>
      </div>

      <div className="todo-container">
        {/* Add Todo Form - Only show in active tab */}
        {activeTab === 'active' && (
          <form onSubmit={addTodo} className="todo-form">
            <div className="form-group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What needs to be done?"
                className="todo-input"
                required
              />
              <div className="deadline-wrapper">
                <input
                  type="date"
                  value={deadlineValue}
                  onChange={(e) => setDeadlineValue(e.target.value)}
                  className="deadline-input"
                />
                <span className="deadline-icon">📅</span>
              </div>
              <button type="submit" className="add-button">
                <span className="button-icon">+</span>
                Add Task
              </button>
            </div>
          </form>
        )}

        {/* Active Tasks Table */}
        {activeTab === 'active' && (
          <div className="todo-table-container">
            {activeTodos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎯</div>
                <p className="empty-message">No active tasks. Add one above!</p>
                <p className="empty-submessage">Stay productive by adding your first task</p>
              </div>
            ) : (
              <>
                <table className="todo-table">
                  <thead>
                    <tr>
                      <th className="checkbox-column"></th>
                      <th className="task-column">Task</th>
                      <th className="deadline-column">Deadline</th>
                      <th className="actions-column">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTodos.map(todo => {
                      const isTaskOverdue = isOverdue(todo.deadline, todo.completed);
                      
                      return (
                        <tr key={todo.id} className={`todo-row ${isTaskOverdue ? 'overdue-row' : ''}`}>
                          <td className="checkbox-cell">
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() => toggleTodo(todo.id)}
                              className="todo-checkbox"
                            />
                          </td>
                          
                          {editingId === todo.id ? (
                            <>
                              <td className="edit-task-cell" colSpan="2">
                                <div className="edit-form">
                                  <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                                    className="edit-input"
                                    autoFocus
                                  />
                                  <input
                                    type="date"
                                    value={editDeadline}
                                    onChange={(e) => setEditDeadline(e.target.value)}
                                    className="edit-deadline-input"
                                  />
                                </div>
                              </td>
                              <td className="edit-actions-cell">
                                <button onClick={() => saveEdit(todo.id)} className="save-button">Save</button>
                                <button onClick={cancelEdit} className="cancel-button">Cancel</button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className={`task-cell ${isTaskOverdue ? 'overdue-text' : ''}`}>
                                <span 
                                  className="task-text"
                                  onDoubleClick={() => startEditing(todo.id, todo.text, todo.deadline)}
                                >
                                  {todo.text}
                                </span>
                              </td>
                              <td className="deadline-cell">
                                {todo.deadline ? (
                                  <span className={`deadline-date ${isTaskOverdue ? 'overdue-date' : ''}`}>
                                    📅 {formatDate(todo.deadline)}
                                  </span>
                                ) : (
                                  <span className="no-deadline">No deadline</span>
                                )}
                              </td>
                              <td className="actions-cell">
                                <div className="action-buttons">
                                  <button 
                                    onClick={() => startEditing(todo.id, todo.text, todo.deadline)}
                                    className="edit-button"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button 
                                    onClick={() => deleteTodo(todo.id)}
                                    className="delete-button"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* Completed Tasks Table */}
        {activeTab === 'completed' && (
          <div className="todo-table-container">
            {completedTodos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎉</div>
                <p className="empty-message">No completed tasks yet!</p>
                <p className="empty-submessage">Complete some tasks to see them here</p>
              </div>
            ) : (
              <>
                <div className="table-header-info">
                  <span className="completed-tasks-count">Completed Tasks: {completedCount}</span>
                </div>
                <table className="todo-table completed-table">
                  <thead>
                    <tr>
                      <th className="checkbox-column"></th>
                      <th className="task-column">Task</th>
                      <th className="deadline-column">Deadline</th>
                      <th className="actions-column">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTodos.map(todo => {
                      return (
                        <tr key={todo.id} className="todo-row completed-row">
                          <td className="checkbox-cell">
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() => toggleTodo(todo.id)}
                              className="todo-checkbox"
                            />
                          </td>
                          
                          {editingId === todo.id ? (
                            <>
                              <td className="edit-task-cell" colSpan="2">
                                <div className="edit-form">
                                  <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                                    className="edit-input"
                                    autoFocus
                                  />
                                  <input
                                    type="date"
                                    value={editDeadline}
                                    onChange={(e) => setEditDeadline(e.target.value)}
                                    className="edit-deadline-input"
                                  />
                                </div>
                              </td>
                              <td className="edit-actions-cell">
                                <button onClick={() => saveEdit(todo.id)} className="save-button">Save</button>
                                <button onClick={cancelEdit} className="cancel-button">Cancel</button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="task-cell completed-task-text">
                                <span 
                                  className="task-text"
                                  onDoubleClick={() => startEditing(todo.id, todo.text, todo.deadline)}
                                >
                                  {todo.text}
                                </span>
                              </td>
                              <td className="deadline-cell">
                                {todo.deadline ? (
                                  <span className="deadline-date completed-deadline">
                                    📅 {formatDate(todo.deadline)}
                                  </span>
                                ) : (
                                  <span className="no-deadline">No deadline</span>
                                )}
                              </td>
                              <td className="actions-cell">
                                <div className="action-buttons">
                                  <button 
                                    onClick={() => startEditing(todo.id, todo.text, todo.deadline)}
                                    className="edit-button"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button 
                                    onClick={() => deleteTodo(todo.id)}
                                    className="delete-button"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;