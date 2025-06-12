import React, { useEffect, useState } from 'react';
import { getNotes, addNote, updateNote, deleteNote } from './api';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

// Lexical Editor Configuration
const editorConfig = {
  namespace: 'NotesEditor',
  theme: {
    paragraph: 'my-paragraph-class',
    text: {
      bold: 'font-bold',
      italic: 'fst-italic',
      underline: 'text-decoration-underline',
    },
  },
  onError(error) {
    console.error(error);
  },
};

function LexicalNoteEditor({ value, onChange }) {
  const initialConfig = {
    namespace: 'NotesEditor',
    theme: {},
    onError(error) {
      console.error(error);
    },
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="form-control" style={{ minHeight: 120 }} />}
        placeholder={<div className="text-muted">Write your note...</div>}
      />
      <HistoryPlugin />
      <OnChangePlugin
        onChange={(editorState) => {
          editorState.read(() => {
            // Get plain text for now (can be changed to HTML/Markdown as needed)
            const text = editorState.toJSON();
            onChange(JSON.stringify(text));
          });
        }}
      />
    </LexicalComposer>
  );
}

function getPlainTextFromLexicalState(state) {
  try {
    const json = JSON.parse(state);
    let text = '';
    function extractText(node) {
      if (!node) return;
      if (node.text) text += node.text + ' ';
      if (Array.isArray(node.children)) {
        node.children.forEach(extractText);
      }
    }
    if (json && json.root) {
      extractText(json.root);
    }
    return text.trim();
  } catch {
    return '';
  }
}

export default function Notes({ token, onEditorOpen }) {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', subject_id: '', tags: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [viewingNote, setViewingNote] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorState, setEditorState] = useState('');

  useEffect(() => {
    loadNotes();
  }, [token]);

  useEffect(() => {
    if (onEditorOpen) onEditorOpen(editorOpen);
  }, [editorOpen, onEditorOpen]);

  async function loadNotes() {
    try {
      const fetchedNotes = await getNotes(token);
      setNotes(fetchedNotes);
    } catch (e) {
      setError(e.message);
    }
  }

  const handleInputChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedForm = { ...form, content: editorState };
      if (editing) {
        await updateNote(editing, updatedForm, token);
      } else {
        await addNote(updatedForm, token);
      }
      resetForm();
      loadNotes();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEdit = (note) => {
    setForm({
      title: note.title,
      content: note.content,
      subject_id: note.subject_id,
      tags: note.tags || '',
    });
    setEditorState(note.content);
    setEditing(note.id);
    setEditorOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(id, token);
      loadNotes();
    } catch (e) {
      setError(e.message);
    }
  };

  const resetForm = () => {
    setForm({ title: '', content: '', subject_id: '', tags: '' });
    setEditing(null);
    setEditorState('');
    setEditorOpen(false);
  };

  const wordCount = editorState
    ? editorState.replace(/<[^>]+>/g, '').trim().split(/\s+/).length
    : 0;

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-md-2 border-end bg-white vh-100 p-3">
          <ul className="list-group">
            <li className="list-group-item active">
              <i className="fa-solid fa-book me-2"></i>All Notes
            </li>
            <li className="list-group-item">
              <i className="fa-regular fa-star me-2"></i>Favorites
            </li>
            <li className="list-group-item">
              <i className="fa-solid fa-trash me-2"></i>Trash
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="col-md-10 p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">My Notes</h4>
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={() => {
                resetForm();
                setEditorOpen(true);
              }}
            >
              <i className="fa-solid fa-plus me-2"></i>New Note
            </button>
          </div>
          {notes.length === 0 ? (
            <div className="text-center text-muted my-5">
              <i className="bi bi-journal-text" style={{ fontSize: 48 }}></i>
              <div className="mt-3">No notes yet. Click <strong>New Note</strong> to get started!</div>
            </div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject ID</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note.id}>
                    <td>{note.title}</td>
                    <td>{note.subject_id}</td>
                    <td>{note.tags}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => setViewingNote(note)}
                          title="View"
                        >
                          <i className="fa-regular fa-eye me-1"></i>View
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(note)}
                          title="Edit"
                        >
                          <i className="fa-regular fa-pen-to-square me-1"></i>Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(note.id)}
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash me-1"></i>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>

      {/* Lexical Editor Modal */}
      {editorOpen && (
        <div
          className="modal show fade"
          style={{ display: 'block', background: '#0008' }}
          tabIndex="-1"
          onClick={resetForm}
        >
          <div
            className="modal-dialog modal-fullscreen"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header justify-content-end">
                <button
                  type="button"
                  className="btn-close"
                  onClick={resetForm}
                  aria-label="Close"
                  title="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      className="form-control"
                      placeholder="Title"
                      value={form.title}
                      onChange={handleInputChange('title')}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      className="form-control"
                      placeholder="Subject ID"
                      value={form.subject_id}
                      onChange={handleInputChange('subject_id')}
                      required
                    />
                  </div>
                  <div className="mb-3 border rounded p-2 bg-white">
                    <LexicalNoteEditor
                      value={form.content}
                      onChange={(val) => setEditorState(val)}
                    />
                  </div>
                  <div className="mb-3">
                    <label>
                      <i className="fa-solid fa-tags me-1"></i>Tags (comma-separated):
                    </label>
                    <input
                      className="form-control"
                      placeholder="e.g. urgent, homework, personal"
                      value={form.tags}
                      onChange={handleInputChange('tags')}
                    />
                  </div>
                  <div className="mb-3 d-flex justify-content-between">
                    <span>
                      <i className="fa-solid fa-hashtag me-1"></i>
                      <strong>Word count:</strong>{' '}
                      {editorState
                        ? JSON.parse(editorState).root.children.reduce(
                            (acc, node) => acc + (node.text ? node.text.split(/\s+/).length : 0),
                            0
                          )
                        : 0}
                    </span>
                    <div>
                      <button type="button" className="btn btn-outline-primary btn-sm me-2">
                        <i className="fa-solid fa-share me-1"></i>Share
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm">
                        <i className="fa-solid fa-floppy-disk me-1"></i>
                        {editing ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {viewingNote && (
        <div
          className="modal show fade"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 2000, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
          tabIndex="-1"
          onClick={() => setViewingNote(null)}
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: 540, width: '100%', borderRadius: 18, boxShadow: '0 8px 32px #0003', background: '#fff', padding: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: 18, overflow: 'hidden', boxShadow: 'none', border: 'none' }}>
              <div className="modal-header" style={{ borderBottom: 'none', padding: '1.5rem 2rem 0.5rem 2rem', background: 'transparent' }}>
                <h4 className="modal-title" style={{ fontWeight: 700 }}>{viewingNote.title}</h4>
                <button
                  type="button"
                  className="btn-close btn btn-primary btn-lg ms-auto"
                  onClick={() => setViewingNote(null)}
                  aria-label="Close"
                  style={{ border: 'none', background: 'none', fontSize: 28, color: '#888', marginLeft: 16 }}
                  title="Close"
                >
                </button>
              </div>
              <div className="modal-body" style={{ padding: '0.5rem 2rem 2rem 2rem' }}>
                <div className="mb-2"><span className="fw-bold">Subject ID:</span> {viewingNote.subject_id}</div>
                <div className="mb-2">
                  <span className="fw-bold">Content:</span>
                  <div style={{ whiteSpace: 'pre-wrap', background: '#f8f9fa', borderRadius: 8, padding: 12, marginTop: 4 }}>
                    {getPlainTextFromLexicalState(viewingNote.content) || <span className="text-muted">(No content)</span>}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="fw-bold"><i className="fa-solid fa-tags me-1"></i>Tags:</span> {viewingNote.tags}
                </div>
                <div className="d-flex justify-content-end mt-4">
                  <button
                    className="btn btn-primary px-4 py-2 d-flex align-items-center"
                    onClick={() => setViewingNote(null)}
                    title="Close"
                    style={{ fontSize: 18, borderRadius: 24 }}
                  >
                    <i className="fa-solid fa-xmark me-2"></i>Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
