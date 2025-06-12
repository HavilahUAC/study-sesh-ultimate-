import React, { useState } from 'react';
import { loginUser, registerUser } from './api';
import ResetPassword from './ResetPassword';

export default function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  if (showReset) return <ResetPassword onBack={() => setShowReset(false)} />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const { token } = await loginUser(form);
        onAuth(token);
      } else {
        await registerUser(form);
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'Error');
    }
  }

  return (
    <div className='main-div'>
      {/* <img src={require('./assets/StudySesh.png')} alt="StudySesh" style={{ width: 38, height: 38, objectFit: 'contain', display: 'block' }} /> */}
      <div className="card shadow-sm mx-auto" style={{ maxWidth: 400, marginTop: 80, width: '100%' }}>
        <div className="card-body">
          <h2 className="card-title mb-3 text-center">{isLogin ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleSubmit} className="mb-3">
            <input
              className="form-control rounded-5 mb-2"
              placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
            <input
              className="form-control rounded-5 mb-2"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            {error && <div className="alert alert-danger py-1">{error}</div>}
            <button type="submit" className="btn btn-primary w-100 mb-2">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <div className="mt-3 text-center">
            <a
              className="links-login"
              href="#"
              onClick={e => { e.preventDefault(); setIsLogin(false); setError(''); }}
              style={{ cursor: 'pointer' }}
            >
              Need an account? Register
            </a><br />
            <a
              className="links-login"
              href="#"
              onClick={e => { e.preventDefault(); setIsLogin(true); setError(''); }}
              style={{ cursor: 'pointer' }}
            >
              Already have an account? Login
            </a><br />
            <a
              className="links-login"
              href="#"
              onClick={e => { e.preventDefault(); setShowReset(true); }}
              style={{ cursor: 'pointer' }}
            >
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
