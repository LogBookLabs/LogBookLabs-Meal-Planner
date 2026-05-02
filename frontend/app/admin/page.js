'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(null); // null = checking
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [actioning, setActioning] = useState(null);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  function showToast(msg, type = 'success') {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    setAuthorized(null);
    try {
      const res = await fetch('/api/community/pending');
      if (res.ok) {
        setAuthorized(true);
        loadSubmissions();
      } else {
        setAuthorized(false);
      }
    } catch {
      setAuthorized(false);
    }
  }

  async function loadSubmissions() {
    setLoading(true);
    try {
      const res = await fetch('/api/community/pending');
      const data = await res.json();
      if (data.submissions) setSubmissions(data.submissions);
    } catch {
      showToast('Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    if (actioning) return;
    setActioning(id);
    try {
      const res = await fetch(`/api/community/approve/${id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approve failed');
      showToast('Submission approved!');
      setSubmissions(prev => prev.filter(s => s.id !== id));
      setExpanded(null);
    } catch (err) {
      showToast(err.message || 'Approve failed', 'error');
    } finally {
      setActioning(null);
    }
  }

  async function handleReject(id) {
    if (actioning) return;
    if (!confirm('Reject this submission? This cannot be undone.')) return;
    setActioning(id);
    try {
      const res = await fetch(`/api/community/reject/${id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reject failed');
      showToast('Submission rejected');
      setSubmissions(prev => prev.filter(s => s.id !== id));
      setExpanded(null);
    } catch (err) {
      showToast(err.message || 'Reject failed', 'error');
    } finally {
      setActioning(null);
    }
  }

  if (authorized === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#5A7180', fontSize: '0.9rem' }}>Checking access…</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#ffffff', borderRadius: 20, padding: '2.5rem', textAlign: 'center', maxWidth: 420, width: '100%', boxShadow: '0 4px 24px rgba(11,29,46,0.08)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#1E2A33', marginBottom: '0.5rem' }}>Admin Access Required</h2>
          <p style={{ color: '#5A7180', fontSize: '0.875rem', lineHeight: 1.6 }}>
            The admin panel requires a valid GitHub PAT with <code style={{ background: '#F7FAFB', padding: '0.1rem 0.3rem', borderRadius: 4 }}>repo</code> scope configured in <code style={{ background: '#F7FAFB', padding: '0.1rem 0.3rem', borderRadius: 4 }}>GH_PAT</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFB', padding: '2rem 1rem 4rem' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          background: toastType === 'error' ? '#DC2626' : '#059669',
          color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 12,
          fontSize: '0.9rem', fontWeight: 600, zIndex: 200,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)', maxWidth: 480, width: '90%',
          textAlign: 'center',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ maxWidth: 800, margin: '0 auto 1.5rem' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#1A8BA5', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1.25rem' }}>
          ← Back to Planner
        </a>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: '1.75rem', color: '#1E2A33', margin: '0 0 0.25rem' }}>Community Submissions</h1>
            <p style={{ color: '#5A7180', fontSize: '0.875rem', margin: 0 }}>{submissions.length} pending review</p>
          </div>
          <button onClick={loadSubmissions} disabled={loading}
            style={{ padding: '0.625rem 1.25rem', background: '#E8F4F8', color: '#1A8BA5', border: '1.5px solid #D1E3EA', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading && submissions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#5A7180', padding: '3rem' }}>Loading…</p>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: 16, border: '1.5px solid #D1E3EA' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</p>
            <p style={{ color: '#5A7180', fontSize: '0.9rem' }}>No pending submissions. Check back later.</p>
          </div>
        ) : submissions.map(sub => (
          <div key={sub.id} style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #D1E3EA', overflow: 'hidden' }}>
            {/* Row header — always visible */}
            <div
              onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              {sub.imageUrl ? (
                <img src={sub.imageUrl} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 10, background: '#E8F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>🍽️</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1E2A33', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</p>
                <p style={{ fontSize: '0.8rem', color: '#5A7180' }}>
                  {sub.submittedBy} · {sub.date ? new Date(sub.date).toLocaleDateString() : 'Unknown date'} · {sub.category}
                </p>
              </div>
              <div style={{ color: '#1A8BA5', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>
                {expanded === sub.id ? '▲ Hide' : '▼ Review'}
              </div>
            </div>

            {/* Expanded details */}
            {expanded === sub.id && (
              <div style={{ borderTop: '1px solid #E8F4F8', padding: '1.25rem', background: '#F7FAFB' }}>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {sub.imageUrl && (
                    <img src={sub.imageUrl} style={{ width: 180, height: 140, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.75rem', color: '#5A7180', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Recipe Details</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <DetailRow label="Category" value={sub.category} />
                      <DetailRow label="Submitted by" value={sub.submittedBy} />
                      <DetailRow label="Date" value={sub.date ? new Date(sub.date).toLocaleDateString() : '—'} />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApprove(sub.id); }}
                    disabled={actioning === sub.id}
                    style={{
                      flex: 1, padding: '0.75rem',
                      background: actioning === sub.id ? '#D1E3EA' : '#059669',
                      color: actioning === sub.id ? '#5A7180' : '#ffffff',
                      border: 'none', borderRadius: 10,
                      fontSize: '0.9rem', fontWeight: 700,
                      cursor: actioning === sub.id ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                      minWidth: 120,
                    }}>
                    {actioning === sub.id ? 'Processing…' : '✅ Approve'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReject(sub.id); }}
                    disabled={actioning === sub.id}
                    style={{
                      flex: 1, padding: '0.75rem',
                      background: actioning === sub.id ? '#D1E3EA' : '#DC2626',
                      color: actioning === sub.id ? '#5A7180' : '#ffffff',
                      border: 'none', borderRadius: 10,
                      fontSize: '0.9rem', fontWeight: 700,
                      cursor: actioning === sub.id ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                      minWidth: 120,
                    }}>
                    {actioning === sub.id ? 'Processing…' : '❌ Reject'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
      <span style={{ fontSize: '0.8rem', color: '#5A7180', minWidth: 80 }}>{label}</span>
      <span style={{ fontSize: '0.875rem', color: '#1E2A33', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}
