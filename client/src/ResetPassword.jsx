import React, { useState } from 'react';

export default function ResetPassword({ onBack }) {
  const [form, setForm] = useState({ username: '', newPassword: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:5300/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Reset failed');
      setSuccess(true);
      setForm({ username: '', newPassword: '' });
    } catch (err) {
      setError(err.message || 'Reset failed');
    }
  }

  return (
    <div className="card shadow-sm mx-auto" style={{ maxWidth: 400, marginTop: 80, width: '100%' }}>
      <div className="card-body">
        <h2 className="card-title mb-3 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit} className="mb-3">
          <input
            className="form-control mb-2"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            className="form-control mb-2"
            type="password"
            placeholder="New Password"
            value={form.newPassword}
            onChange={e => setForm({ ...form, newPassword: e.target.value })}
            required
          />
          {error && <div className="alert alert-danger py-1">{error}</div>}
          {success && <div className="alert alert-success py-1">Password reset successful!</div>}
          <button type="submit" className="btn btn-primary w-100 mb-2">Reset Password</button>
        </form>
        <button className="btn btn-link w-100" onClick={onBack}>
          Back to Login
        </button>
      </div>
    </div>
  );
}
