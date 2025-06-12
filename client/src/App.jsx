import React, { useState } from 'react';
import Subjects from './Subjects';
import Auth from './Auth';
import Assignments from './Assignments';
import Notes from './Notes';
import Tests from './Tests';
import AIAssistant from './AIAssistant';
import 'bootstrap/dist/css/bootstrap.min.css';
import './dashboard.css';

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [section, setSection] = useState('overview');
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile
  const [notesEditorOpen, setNotesEditorOpen] = useState(false); // for notes editor modal
  const user = parseJwt(token);

  function handleAuth(newToken) {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem('token');
  }

  if (!token) {
    return <Auth onAuth={handleAuth} />;
  }

  // Responsive: detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 769;

  return (
    <div style={{ fontSize: '0.9rem' }}>
      {/* Only show sidebar/navbar/main if notes editor is not open */}
      {!notesEditorOpen && (
        <>
          {/* Sidebar overlay for mobile */}
          {isMobile && sidebarOpen && (
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          )}
          {/* Sidebar */}
          <div className={`sidebar${isMobile ? (sidebarOpen ? ' mobile-visible' : ' mobile-hidden') : ''}`}
            style={isMobile ? { zIndex: 1200 } : {}}>
            <h4 className="mb-4">My Dashboard</h4>
            <ul className="nav flex-column">
              <li className="nav-item">
                <button className={`nav-link btn btn-link w-100 text-start text-light${section === 'overview' ? ' active' : ''}`} onClick={() => { setSection('overview'); setSidebarOpen(false); }}>Overview</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link btn btn-link w-100 text-start text-light${section === 'subjects' ? ' active' : ''}`} onClick={() => { setSection('subjects'); setSidebarOpen(false); }}>Subjects</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link btn btn-link w-100 text-start text-light${section === 'assignments' ? ' active' : ''}`} onClick={() => { setSection('assignments'); setSidebarOpen(false); }}>Assignments</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link btn btn-link w-100 text-start text-light${section === 'notes' ? ' active' : ''}`} onClick={() => { setSection('notes'); setSidebarOpen(false); }}>Notes</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link btn btn-link w-100 text-start text-light${section === 'tests' ? ' active' : ''}`} onClick={() => { setSection('tests'); setSidebarOpen(false); }}>Tests</button>
              </li>
            </ul>
          </div>

          {/* Top Navbar */}
          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom px-3">
            <div className="container-fluid">
              {/* Hamburger for mobile */}
              {isMobile && (
                <button className="hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Open menu" type="button">
                  <span aria-hidden="true">Menu</span>
                </button>
              )}
              <img src='assets/studdy-buddy-remove.png' alt="StudySesh"/>
              <div className="ms-auto">
                <button className="btn btn-outline-primary" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </nav>
        </>
      )}
      {/* Main Content */}
      <main className="content" style={isMobile ? { marginLeft: 0 } : {}}>
        {section === 'overview' && !notesEditorOpen && (
          <>
            <h2>Welcome, {user?.username || 'User'}</h2>
            <div className="row mt-4">
              <div className="col-md-4">
                <div className="card text-bg-primary mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Subjects</h5>
                    <p className="card-text">Manage your subjects</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-bg-success mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Assignments</h5>
                    <p className="card-text">Track your assignments</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-bg-warning mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Notes</h5>
                    <p className="card-text">Organize your notes</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {section === 'subjects' && !notesEditorOpen && <Subjects token={token} />}
        {section === 'assignments' && !notesEditorOpen && <Assignments token={token} />}
        {section === 'notes' && <Notes token={token} onEditorOpen={setNotesEditorOpen} />}
        {section === 'tests' && !notesEditorOpen && <Tests token={token} />}
      </main>
      {/* Floating Study Buddy Button */}
      {!notesEditorOpen && (
        <button
          className="btn btn-success shadow-lg"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 2100,
            borderRadius: '50%',
            width: 60,
            height: 60,
            display: aiOpen ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            boxShadow: '0 4px 16px #0002',
            transition: 'background 0.2s, box-shadow 0.2s',
            padding: 0,
          }}
          onClick={() => setAiOpen(true)}
          title="Open Study Buddy"
          aria-label="Open Study Buddy"
        >
          <span>🤖</span>
        </button>
      )}
      <AIAssistant token={token} open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

export default App;
