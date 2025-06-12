import React, { useEffect, useState } from 'react';
import { getAssignments, addAssignment, updateAssignment, deleteAssignment } from './api';

export default function Assignments({ token }) {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', due_date: '', subject_id: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState({});

  async function load() {
    try {
      setAssignments(await getAssignments(token));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, [token]);

  useEffect(() => {
    // Load completed state from localStorage (per user)
    const saved = localStorage.getItem('assignments-completed');
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Save completed state to localStorage
    localStorage.setItem('assignments-completed', JSON.stringify(completed));
  }, [completed]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await updateAssignment(editing, form, token);
      } else {
        await addAssignment(form, token);
      }
      setForm({ title: '', due_date: '', subject_id: '', description: '' });
      setEditing(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  function handleEdit(a) {
    setForm({ title: a.title, due_date: a.due_date, subject_id: a.subject_id, description: a.description });
    setEditing(a.id);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await deleteAssignment(id, token);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  function handleCheck(id) {
    setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0"><i className="fa-solid fa-list-check me-2 text-primary"></i>Assignments</h3>
        <span className="badge bg-info text-dark fs-6">{assignments.length} {assignments.length === 1 ? 'Assignment' : 'Assignments'}</span>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-4 p-3 rounded shadow-sm bg-white">
        <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Title</label>
            <input className="form-control" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="col-md-2">
            <label className="form-label fw-semibold">Due Date</label>
            <input type="date" className="form-control" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required />
          </div>
          <div className="col-md-2">
            <label className="form-label fw-semibold">Subject ID</label>
            <input className="form-control" placeholder="Subject ID" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))} required />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Description</label>
            <input className="form-control" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className={`btn btn-${editing ? 'warning' : 'primary'} w-100 fw-bold d-flex align-items-center justify-content-center`} type="submit">
              <i className={`fa-solid fa-${editing ? 'pen-to-square' : 'plus'} me-2`}></i>{editing ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </form>
      {assignments.length === 0 ? (
        <div className="text-center text-muted my-5">
          <i className="fa-solid fa-folder-open fa-3x mb-3"></i>
          <div>No assignments yet. Add your first assignment above!</div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle shadow-sm bg-white rounded">
            <thead className="table-light">
              <tr>
                <th><i className="fa-solid fa-heading me-1"></i>Title</th>
                <th><i className="fa-solid fa-calendar-day me-1"></i>Due Date</th>
                <th><i className="fa-solid fa-book me-1"></i>Subject ID</th>
                <th><i className="fa-solid fa-align-left me-1"></i>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id} className={editing === a.id ? 'table-warning' : completed[a.id] ? 'table-success' : ''}>
                  <td className="fw-semibold">
                    <input type="checkbox" className="form-check-input me-2" checked={!!completed[a.id]} onChange={() => handleCheck(a.id)} title="Mark as done" />
                    <span style={{ textDecoration: completed[a.id] ? 'line-through' : 'none', color: completed[a.id] ? '#888' : undefined }}>{a.title}</span>
                  </td>
                  <td>{a.due_date}</td>
                  <td>{a.subject_id}</td>
                  <td>{a.description}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary me-2 d-inline-flex align-items-center" onClick={() => handleEdit(a)} disabled={completed[a.id]}>
                      <i className="fa-regular fa-pen-to-square me-1"></i>Edit
                    </button>
                    <button className="btn btn-sm btn-danger d-inline-flex align-items-center" onClick={() => handleDelete(a.id)}>
                      <i className="fa-solid fa-trash me-1"></i>Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
