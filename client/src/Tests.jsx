import React, { useEffect, useState } from 'react';
import { getTests, addTest, updateTest, deleteTest } from './api';

export default function Tests({ token }) {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ title: '', test_date: '', subject_id: '', score: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setTests(await getTests(token));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await updateTest(editing, form, token);
      } else {
        await addTest(form, token);
      }
      setForm({ title: '', test_date: '', subject_id: '', score: '' });
      setEditing(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  function handleEdit(t) {
    setForm({ title: t.title, test_date: t.test_date, subject_id: t.subject_id, score: t.score });
    setEditing(t.id);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this test?')) return;
    try {
      await deleteTest(id, token);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="container mt-4">
      <h3>Tests & Practice</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="mb-3" onSubmit={handleSubmit} style={{ maxWidth: '100vw',}}>
        <div className="row g-2">
          <div className="col-md-3">
            <input className="form-control" placeholder="Test Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="col-md-2">
            <input type="date" className="form-control" value={form.test_date} onChange={e => setForm(f => ({ ...f, test_date: e.target.value }))} required />
          </div>
          <div className="col-md-2">
            <input className="form-control" placeholder="Subject ID" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))} required />
          </div>
          <div className="col-md-3">
            <input className="form-control" placeholder="Score" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} />
          </div>
          <div className="col-md-2">
            <button className="btn-fresh" type="submit">{editing ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </form>
      <table className="table table-striped">
        <thead>
          <tr>
            <th style={{ width: '200px'}}>Title</th>
            <th style={{ width: '200px'}}>Date</th>
            <th style={{ width: '100px'}}>Subject ID</th>
            <th style={{ width: '100px'}}>Score</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tests.map(t => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.test_date}</td>
              <td>{t.subject_id}</td>
              <td>{t.score}</td>
              <td>
                <button className="btn btn-sm btn-secondary me-2" onClick={() => handleEdit(t)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
