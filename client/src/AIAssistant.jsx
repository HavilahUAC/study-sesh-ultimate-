import React, { useState } from 'react';
import { askAI } from './api';

export default function AIAssistant({ token, open, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are Study Buddy, a helpful study assistant.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAsk(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const newMessages = [
      ...messages,
      { role: 'user', content: prompt }
    ];
    setMessages(newMessages);
    try {
      const res = await askAI(newMessages, token);
      setMessages([...newMessages, { role: 'assistant', content: res.response }]);
      setPrompt('');
    } catch (err) {
      // Show full error details if available
      let msg = err.message || 'AI error';
      if (err.response) {
        msg += '\n' + JSON.stringify(err.response, null, 2);
      }
      setError(msg);
      console.error('AI error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Swipe-to-close for mobile
  React.useEffect(() => {
    if (!open) return;
    let startX = null, startY = null, swiped = false;
    function onTouchStart(e) {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        swiped = false;
      }
    }
    function onTouchMove(e) {
      if (startX !== null && startY !== null && !swiped) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy)) {
          swiped = true;
          onClose();
        }
      }
    }
    function onTouchEnd() {
      startX = null; startY = null; swiped = false;
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ai-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.25)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeInBg 0.3s',
      inset: 0
    }}>
      <div className="ai-panel-animate card shadow-sm mb-4"
        style={{
          maxWidth: '98vw', width: '100%', margin: '0 auto', animation: 'slideUp 0.4s',
          borderRadius: 16,
          boxShadow: '0 8px 32px #0002',
          minWidth: 0,
          ...(window.innerWidth < 600 ? { minHeight: '60vh', maxHeight: '90vh', padding: 0 } : { minHeight: 400 })
        }}>
        <div className="card-body d-flex flex-column p-2 p-md-4" style={{ minHeight: window.innerWidth < 600 ? '60vh' : 400 }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4 className="card-title mb-0 text-center w-100" style={{ fontSize: window.innerWidth < 600 ? 18 : 24 }}>Study Buddy <span style={{ fontSize: 16, color: '#6c757d' }}>(AI)</span></h4>
            <button className="rounded-3 border-0 btn-special bg-danger ms-2 text-light" onClick={onClose} title="Close" style={{ position: 'absolute', right: 18, top: 18, zIndex: 2 }}>
              ✕
            </button>
          </div>
          {/* Mobile tip for closing modal */}
          {window.innerWidth < 600 && (
            <div className="text-center text-muted mb-2" style={{ fontSize: 13 }}>
              Swipe right or tap outside to close
            </div>
          )}
          <div className="ai-chat-area">
            <div className="ai-chat-scroll">
              {messages.filter(m => m.role !== 'system').map((m, i) => (
                <div key={i} className={`ai-chat-bubble${m.role === 'user' ? ' user' : ''}`}> 
                  <div className="ai-chat-msg">
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setMessages([{ role: 'system', content: 'You are Study Buddy, a helpful study assistant.' }])} disabled={loading}>
              Clear Chat
            </button>
            {loading && <span className="text-muted ms-2">Study Buddy is thinking...</span>}
          </div>
          <form onSubmit={handleAsk} className="d-flex gap-2 mt-auto" style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
            <textarea
              className="form-control"
              style={{ resize: 'none', borderRadius: 20, fontSize: window.innerWidth < 600 ? 15 : 16, background: '#f7f7fa', border: '1px solid #ddd', minHeight: 40, maxHeight: 80 }}
              rows={1}
              placeholder="Type your message..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              required
              disabled={loading}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (prompt.trim() && !loading) handleAsk(e);
                }
              }}
            />
            <button type="submit" className="btn btn-primary px-4" style={{ borderRadius: 20 }} disabled={loading || !prompt.trim()}>
              <span role="img" aria-label="Send">➤</span>
            </button>
          </form>
          {error && <div className="alert alert-danger py-1 mt-2">{error}</div>}
        </div>
      </div>
      <style>{`
        @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0; } to { transform: none; opacity: 1; } }
        .ai-overlay { overscroll-behavior: contain; }
        @media (max-width: 600px) {
          .ai-panel-animate { border-radius: 0 !important; min-height: 60vh !important; }
        }
      `}</style>
    </div>
  );
}
