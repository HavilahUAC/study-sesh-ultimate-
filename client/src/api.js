// API helper for backend requests
const API_BASE = 'http://localhost:5300';

export async function getSubjects(token) {
  const res = await fetch(`${API_BASE}/subjects`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function addSubject(subject, token) {
  const res = await fetch(`${API_BASE}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(subject),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function updateSubject(id, subject, token) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(subject),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function deleteSubject(id, token) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function loginUser({ username, password }) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  return res.json();
}

export async function registerUser({ username, password }) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
  return res.json();
}

export async function askAI(messages, token) {
  const res = await fetch(`${API_BASE}/ai-assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ messages })
  });
  if (!res.ok) {
    let errObj = { message: 'AI error' };
    try {
      const errJson = await res.json();
      errObj = { ...errObj, ...errJson };
    } catch {}
    const error = new Error(errObj.message);
    error.response = errObj;
    throw error;
  }
  return res.json();
}

// ASSIGNMENTS
export async function getAssignments(token) {
  const res = await fetch(`${API_BASE}/assignments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function addAssignment(assignment, token) {
  const res = await fetch(`${API_BASE}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(assignment),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function updateAssignment(id, assignment, token) {
  const res = await fetch(`${API_BASE}/assignments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(assignment),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function deleteAssignment(id, token) {
  const res = await fetch(`${API_BASE}/assignments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

// NOTES
export async function getNotes(token) {
  const res = await fetch(`${API_BASE}/notes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function addNote(note, token) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function updateNote(id, note, token) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function deleteNote(id, token) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

// TESTS
export async function getTests(token) {
  const res = await fetch(`${API_BASE}/tests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function addTest(test, token) {
  const res = await fetch(`${API_BASE}/tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(test),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function updateTest(id, test, token) {
  const res = await fetch(`${API_BASE}/tests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(test),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}

export async function deleteTest(id, token) {
  const res = await fetch(`${API_BASE}/tests/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Unauthorized');
  return res.json();
}
