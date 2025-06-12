import React, { useEffect, useState } from 'react';
import { getSubjects, addSubject, updateSubject, deleteSubject } from './api';

export default function Subjects({ token }) {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line
  }, []);

  async function fetchSubjects() {
    try {
      setSubjects(await getSubjects(token));
    } catch (err) {
      setError('Session expired. Please log in again.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await updateSubject(editing, form, token);
      } else {
        await addSubject(form, token);
      }
      setForm({ name: '', description: '' });
      setEditing(null);
      fetchSubjects();
    } catch (err) {
      setError('Session expired. Please log in again.');
    }
  }

  function handleEdit(subject) {
    setForm({ name: subject.name, description: subject.description });
    setEditing(subject.id);
  }

  async function handleDelete(id) {
    try {
      await deleteSubject(id, token);
      fetchSubjects();
    } catch (err) {
      setError('Session expired. Please log in again.');
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="card-title mb-3">Subjects Manager</h2>
        {error && <div className="alert alert-danger py-1">{error}</div>}
        <form onSubmit={handleSubmit} className="row g-2 align-items-end mb-4" style={{ maxWidth: '100vw', overflowX: 'auto' }}>
          <div className="col-md-5">
            <input
              className="form-control"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-5">
            <input
              className="form-control"
              placeholder="Description (Optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="col-md-2 d-grid gap-2">
            <button type="submit" className="btn btn-primary">
              {editing ? 'Update' : 'Add'}
            </button>
            {editing && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); }}>Cancel</button>
            )}
          </div>
        </form>
        <ul className="list-group" style={{ maxWidth: '100vw', overflowX: 'auto' }}>
          {subjects.map(subj => (
            <li key={subj.id} className="list-group-item d-flex justify-content-between align-items-center" style={{ borderRadius: 12, marginBottom: 8, boxShadow: '0 2px 8px #007aff11', background: 'rgba(255,255,255,0.85)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{
                  display: 'inline-block',
                  background: 'linear-gradient(90deg, #00c6fb 0%, #007aff 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: 8,
                  fontSize: 15,
                  minWidth: 32,
                  textAlign: 'center',
                  padding: '4px 10px',
                  marginRight: 10,
                  boxShadow: '0 1px 4px #007aff22',
                  letterSpacing: '0.03em',
                }}>{subj.id}</span>
                <span style={{ fontWeight: 600, fontSize: 17 }}>{subj.name}</span>
                {subj.description && <span className="text-muted" style={{ fontSize: 14, marginLeft: 8 }}>{subj.description}</span>}
              </div>
              <span>
                <button onClick={() => handleEdit(subj)} className="btn btn-sm btn-outline-primary me-2">Edit</button>
                <button onClick={() => handleDelete(subj.id)} className="btn btn-sm btn-outline-danger">Delete</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
