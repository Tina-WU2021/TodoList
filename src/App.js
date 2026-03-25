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
  const [editPrioritized, setEditPrioritized] = useState(false);
  const [editSettled, setEditSettled] = useState(false);
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
        createdAt: new Date().toISOString(),
        prioritized: false,
        settled: false,
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

  const togglePrioritized = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, prioritized: !todo.prioritized, settled: false } : todo
    ));
  };

  const toggleSettled = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, settled: !todo.settled, prioritized: false } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (id, text, deadline, prioritized, settled) => {
    setEditingId(id);
    setEditText(text);
    setEditDeadline(deadline || '');
    setEditPrioritized(prioritized);
    setEditSettled(settled);
  };

  const saveEdit = (id) => {
    if (editText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === id ? { 
          ...todo, 
          text: editText.trim(),
          deadline: editDeadline || null,
          prioritized: editPrioritized,
          settled: editSettled
        } : todo
      ));
      setEditingId(null);
      setEditText('');
      setEditDeadline('');
      setEditPrioritized(false);
      setEditSettled(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditDeadline('');
    setEditPrioritized(false);
    setEditSettled(false);
  };

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

  // Sort todos with priority: Prioritized > Normal (by date) > Settled
  const getSortedTodos = (completedStatus) => {
    const filteredTodos = todos.filter(todo => todo.completed === completedStatus);
    return [...filteredTodos].sort((a, b) => {
      // Prioritized tasks come first
      if (a.prioritized && !b.prioritized) return -1;
      if (!a.prioritized && b.prioritized) return 1;
      
      // Settled tasks come last
      if (a.settled && !b.settled) return 1;
      if (!a.settled && b.settled) return -1;
      
      // For non-prioritized and non-settled tasks, sort by deadline
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      
      // Sort by creation date if no deadlines
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  };

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
          </button>
          <button 
            className={`header-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <span className="tab-icon">✅</span>
            <span className="tab-text">Completed</span>
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
                      <th className="checkbox-column">Done</th>
                      <th className="task-column">Task</th>
                      <th className="deadline-column">Deadline</th>
                      <th className="priority-column">Priority</th>
                      <th className="settled-column">Settled</th>
                      <th className="actions-column">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTodos.map(todo => {
                      const isTaskOverdue = isOverdue(todo.deadline, todo.completed);
                      
                      return (
                        <tr key={todo.id} className={`todo-row ${isTaskOverdue ? 'overdue-row' : ''} ${todo.prioritized ? 'prioritized-row' : ''} ${todo.settled ? 'settled-row' : ''}`}>
                          <td className="checkbox-cell">
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() => toggleTodo(todo.id)}
                              className="todo-checkbox"
                              title="Mark as completed"
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
                                  <div className="edit-flags">
                                    <label className="edit-priority-label">
                                      <input
                                        type="checkbox"
                                        checked={editPrioritized}
                                        onChange={(e) => {
                                          setEditPrioritized(e.target.checked);
                                          if (e.target.checked) setEditSettled(false);
                                        }}
                                      />
                                      Prioritized
                                    </label>
                                    <label className="edit-settled-label">
                                      <input
                                        type="checkbox"
                                        checked={editSettled}
                                        onChange={(e) => {
                                          setEditSettled(e.target.checked);
                                          if (e.target.checked) setEditPrioritized(false);
                                        }}
                                      />
                                      Settled
                                    </label>
                                  </div>
                                </div>
                              </td>
                              <td className="edit-actions-cell" colSpan="3">
                                <button onClick={() => saveEdit(todo.id)} className="save-button">Save</button>
                                <button onClick={cancelEdit} className="cancel-button">Cancel</button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className={`task-cell ${isTaskOverdue ? 'overdue-text' : ''}`}>
                                <span 
                                  className="task-text"
                                  onDoubleClick={() => startEditing(todo.id, todo.text, todo.deadline, todo.prioritized, todo.settled)}
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
                              <td className="priority-cell">
                                <input
                                  type="checkbox"
                                  checked={todo.prioritized}
                                  onChange={() => togglePrioritized(todo.id)}
                                  className="priority-checkbox"
                                  title="Prioritize task (moves to top)"
                                  disabled={todo.settled}
                                />
                              </td>
                              <td className="settled-cell">
                                <input
                                  type="checkbox"
                                  checked={todo.settled}
                                  onChange={() => toggleSettled(todo.id)}
                                  className="settled-checkbox"
                                  title="Settle task (moves to bottom)"
                                  disabled={todo.prioritized}
                                />
                              </td>
                              <td className="actions-cell">
                                <div className="action-buttons">
                                  <button 
                                    onClick={() => startEditing(todo.id, todo.text, todo.deadline, todo.prioritized, todo.settled)}
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
                      <th className="checkbox-column">Done</th>
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
                                  onDoubleClick={() => startEditing(todo.id, todo.text, todo.deadline, todo.prioritized, todo.settled)}
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
                                    onClick={() => startEditing(todo.id, todo.text, todo.deadline, todo.prioritized, todo.settled)}
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