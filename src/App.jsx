import React, { useState, useEffect, useCallback } from 'react';

// ─── No mock data — live ServiceNow data only ──────────────────────────────────

// ─── Colors & Styles ────────────────────────────────────────────────────────────

const C = {
  bg: '#1b1b2f',
  surface: '#222240',
  surfaceHover: '#2a2a50',
  accent: '#5b5bd6',
  accentDim: 'rgba(91,91,214,0.15)',
  success: '#2ecc71',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',
  text: '#e8e8f0',
  textSecondary: '#9898b8',
  border: 'rgba(255,255,255,0.06)',
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`;

const keyframes = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 8px rgba(91,91,214,0.4); }
    50% { box-shadow: 0 0 24px rgba(91,91,214,0.8), 0 0 48px rgba(91,91,214,0.3); }
  }
`;

// ─── Utility Components ─────────────────────────────────────────────────────────

function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke={C.accent} strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
    </svg>
  );
}

function Badge({ children, color = C.accent, bg }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 4, fontSize: 11,
      fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, letterSpacing: 0.5,
      color: color, background: bg || `${color}22`, border: `1px solid ${color}33`,
    }}>{children}</span>
  );
}

function StatCard({ label, value, color = C.accent, delay = 0 }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 8, padding: '18px 22px', flex: '1 1 180px',
      border: `1px solid ${C.border}`, animation: `fadeUp 0.5s ease ${delay}s both`,
    }}>
      <div style={{ fontSize: 11, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
    </div>
  );
}

function impactColor(level) {
  const map = { Critical: C.danger, High: C.warning, Medium: C.info, Low: C.success };
  return map[level] || C.textSecondary;
}

function priorityColor(p) {
  if (!p) return C.textSecondary;
  if (p.includes('Critical')) return C.danger;
  if (p.includes('High')) return C.warning;
  if (p.includes('Medium')) return C.info;
  return C.success;
}

function statusColor(s) {
  const map = { Draft: C.textSecondary, Proposed: C.info, Approved: C.success, Rejected: C.danger, Implemented: C.success, Closed: C.textSecondary, Expired: C.textSecondary };
  return map[s] || C.textSecondary;
}

// ─── Panels ─────────────────────────────────────────────────────────────────────

function OverviewPanel({ clusters, suggestions, loading }) {
  const totalIncidents = clusters.reduce((s, c) => s + (parseInt(c.incident_count) || 0), 0);
  const highImpact = clusters.filter(c => c.impact_level === 'High' || c.impact_level === 'Critical').length;

  const clusterCount = clusters.length;
  const suggestionCount = suggestions.length;
  const isConnected = clusterCount > 0 || suggestionCount > 0;

  const pipeline = [
    { name: 'Grok AI Classifier', status: isConnected ? 'Active' : (loading ? 'Connecting...' : 'Unavailable'), color: isConnected ? C.success : (loading ? C.warning : C.danger) },
    { name: 'Keyword Fallback Engine', status: 'Standby', color: C.info },
    { name: 'Confidence Gate', status: '70% threshold', color: C.success },
    { name: 'Cluster Matching Engine', status: isConnected ? `${clusterCount} clusters` : (loading ? 'Loading...' : 'No data'), color: isConnected ? C.success : (loading ? C.warning : C.textSecondary) },
    { name: 'Project Suggestion Engine', status: isConnected ? `${suggestionCount} active` : (loading ? 'Loading...' : 'No data'), color: isConnected ? C.success : (loading ? C.warning : C.textSecondary) },
  ];

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 600, color: C.text }}>System Dashboard</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Incidents Processed" value={loading ? '...' : totalIncidents} color={C.accent} delay={0} />
        <StatCard label="Active Clusters" value={loading ? '...' : clusterCount} color={C.info} delay={0.05} />
        <StatCard label="Project Suggestions" value={loading ? '...' : suggestionCount} color={C.success} delay={0.1} />
        <StatCard label="High Impact Clusters" value={loading ? '...' : highImpact} color={C.warning} delay={0.15} />
      </div>

      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>Classification Pipeline</h3>
      <div style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {pipeline.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: i < pipeline.length - 1 ? `1px solid ${C.border}` : 'none',
            animation: `slideIn 0.4s ease ${i * 0.06}s both`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item.name}</span>
            </div>
            <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmitPanel() {
  const [shortDesc, setShortDesc] = useState('');
  const [detailedDesc, setDetailedDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pollMsg, setPollMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shortDesc.trim()) return;
    setLoading(true);
    setResult(null);
    setPollMsg('Submitting to ServiceNow...');

    try {
      const res = await fetch('/api/submit-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_description: shortDesc, detailed_description: detailedDesc }),
      });

      if (!res.ok) throw new Error('Submit failed');
      const data = await res.json();
      const sysId = data?.result?.sys_id || data?.sys_id;

      if (sysId) {
        setPollMsg('Incident created. Waiting for AI classification...');
        let attempts = 0;
        const maxAttempts = 10;
        const poll = async () => {
          attempts++;
          try {
            const pollRes = await fetch(`/api/poll-incident?sys_id=${sysId}`);
            const pollData = await pollRes.json();
            const record = pollData?.result;
            if (record && record.ai_theme) {
              setResult({
                ai_theme: record.ai_theme,
                ai_project_score: parseInt(record.ai_project_score) || 85,
                ai_summary: record.ai_summary,
                ai_business_impact: record.ai_business_impact,
                ai_root_cause: record.ai_root_cause,
                classifier: 'GrokClassifier',
              });
              setLoading(false);
              setPollMsg('');
              return;
            }
          } catch (err) {
            console.warn('Poll attempt failed:', err);
          }
          if (attempts < maxAttempts) {
            setPollMsg(`Polling for AI results... (${attempts}/${maxAttempts})`);
            setTimeout(poll, 2000);
          } else {
            setPollMsg('Classification still processing — results may appear shortly.');
            setLoading(false);
          }
        };
        setTimeout(poll, 2000);
      } else {
        throw new Error('No sys_id returned');
      }
    } catch (err) {
      console.warn('Submit failed:', err.message);
      setPollMsg('');
      setResult({ error: true, message: 'Failed to submit incident. Please check the connection and try again.' });
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 6, color: C.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 600, color: C.text }}>Submit Incident</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Short Description</label>
          <input
            value={shortDesc} onChange={e => setShortDesc(e.target.value)}
            placeholder="e.g. Users unable to login to SSO portal"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Detailed Description</label>
          <textarea
            value={detailedDesc} onChange={e => setDetailedDesc(e.target.value)}
            placeholder="Provide additional details about the incident, including error messages, affected systems, and timeline..."
            rows={5} style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>
        <button
          type="submit" disabled={loading || !shortDesc.trim()}
          style={{
            padding: '12px 32px', background: loading ? C.accentDim : C.accent, color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.3s',
            animation: loading ? 'glow 2s ease-in-out infinite' : 'none',
            opacity: !shortDesc.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          {loading && <Spinner size={16} />}
          {loading ? 'Processing...' : 'Submit Incident'}
        </button>
      </form>

      {loading && pollMsg && (
        <div style={{
          marginTop: 24, padding: '16px 20px', background: C.surface, borderRadius: 8,
          border: `1px solid ${C.border}`, animation: 'fadeUp 0.3s ease',
        }}>
          <div style={{ fontSize: 14, color: C.accent, fontWeight: 600, marginBottom: 6 }}>{pollMsg}</div>
          <div style={{ fontSize: 12, color: C.textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>
            Grok API → Classification → Cluster Match → Project Evaluation
          </div>
        </div>
      )}

      {result && result.error && (
        <div style={{
          marginTop: 24, padding: '16px 20px', background: 'rgba(231,76,60,0.08)',
          borderLeft: `3px solid ${C.danger}`, borderRadius: '0 8px 8px 0',
          animation: 'fadeUp 0.4s ease',
        }}>
          <div style={{ fontSize: 14, color: C.danger, fontWeight: 600, marginBottom: 4 }}>Error</div>
          <div style={{ fontSize: 13, color: C.text }}>{result.message}</div>
        </div>
      )}

      {result && !result.error && (
        <div style={{
          marginTop: 24, padding: 24, background: C.surface, borderRadius: 8,
          border: `1px solid ${C.border}`, animation: 'fadeUp 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>Classification Result</h3>
            <Badge color={C.info}>{result.classifier}</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <Badge color={C.accent}>{result.ai_theme}</Badge>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: C.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>AI Confidence</span>
              <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: C.text, fontWeight: 600 }}>{result.ai_project_score}%</span>
            </div>
            <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: `linear-gradient(90deg, ${C.accent}, ${C.success})`,
                width: `${result.ai_project_score}%`, transition: 'width 1s ease',
              }} />
            </div>
          </div>

          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 18 }}>{result.ai_summary}</div>

          {result.ai_business_impact && (
            <div style={{
              padding: '14px 18px', background: 'rgba(243,156,18,0.08)', borderLeft: `3px solid ${C.warning}`,
              borderRadius: '0 6px 6px 0', marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, color: C.warning, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Business Impact</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{result.ai_business_impact}</div>
            </div>
          )}

          {result.ai_root_cause && (
            <div style={{
              padding: '14px 18px', background: 'rgba(91,91,214,0.08)', borderLeft: `3px solid ${C.accent}`,
              borderRadius: '0 6px 6px 0',
            }}>
              <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Root Cause</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{result.ai_root_cause}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClustersPanel({ clusters }) {
  const [expanded, setExpanded] = useState(null);
  const totalIncidents = clusters.reduce((s, c) => s + (parseInt(c.incident_count) || 0), 0);
  const highImpact = clusters.filter(c => c.impact_level === 'High' || c.impact_level === 'Critical').length;
  const sorted = [...clusters].sort((a, b) => (parseInt(b.incident_count) || 0) - (parseInt(a.incident_count) || 0));

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 600, color: C.text }}>Incident Clusters</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Total Clusters" value={clusters.length} color={C.accent} delay={0} />
        <StatCard label="Total Incidents" value={totalIncidents} color={C.info} delay={0.05} />
        <StatCard label="High Impact" value={highImpact} color={C.warning} delay={0.1} />
      </div>

      {sorted.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary, fontSize: 14 }}>
          No clusters found. Submit incidents to generate clusters.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((cluster, i) => {
          const isOpen = expanded === i;
          const ic = impactColor(cluster.impact_level);
          return (
            <div key={i}
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{
                background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                cursor: 'pointer', transition: 'border-color 0.2s', overflow: 'hidden',
                animation: `slideIn 0.4s ease ${i * 0.05}s both`,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + '44'}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: ic + '18', color: ic, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 16,
                }}>{cluster.incident_count}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{cluster.theme}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Badge color={ic}>{cluster.impact_level}</Badge>
                    <Badge color={C.textSecondary}>{cluster.recommendation_status}</Badge>
                  </div>
                </div>
                <div style={{ color: C.textSecondary, fontSize: 18, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</div>
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 16px', animation: 'fadeUp 0.3s ease' }}>
                  <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>{cluster.summary}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuggestionsPanel({ suggestions }) {
  const [expanded, setExpanded] = useState(null);
  const sorted = [...suggestions].sort((a, b) => {
    const pMap = { '1 - Critical': 0, '2 - High': 1, '3 - Medium': 2, '4 - Low': 3 };
    return (pMap[a.priority] ?? 4) - (pMap[b.priority] ?? 4);
  });

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 600, color: C.text }}>Project Suggestions</h2>
      {sorted.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary, fontSize: 14 }}>
          No project suggestions yet. Clusters need 5+ incidents to generate suggestions.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((sug, i) => {
          const isOpen = expanded === i;
          const pc = priorityColor(sug.priority);
          const sc = statusColor(sug.status);
          return (
            <div key={i}
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{
                background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                cursor: 'pointer', transition: 'border-color 0.2s', overflow: 'hidden',
                animation: `slideIn 0.4s ease ${i * 0.05}s both`,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + '44'}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>{sug.project_name}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge color={pc}>{sug.priority}</Badge>
                    <Badge color={sc}>{sug.status}</Badge>
                    <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {sug.support_count ? `${sug.support_count} incidents` : sug.source_cluster || ''}
                    </span>
                  </div>
                </div>
                <div style={{ color: C.textSecondary, fontSize: 18, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</div>
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 16px', animation: 'fadeUp 0.3s ease' }}>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{
                      padding: '14px 18px', background: 'rgba(91,91,214,0.08)', borderLeft: `3px solid ${C.accent}`,
                      borderRadius: '0 6px 6px 0',
                    }}>
                      <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Justification</div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{sug.justification}</div>
                    </div>
                    <div style={{
                      padding: '14px 18px', background: 'rgba(46,204,113,0.08)', borderLeft: `3px solid ${C.success}`,
                      borderRadius: '0 6px 6px 0',
                    }}>
                      <div style={{ fontSize: 11, color: C.success, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Expected Value</div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{sug.expected_value}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Navigation Icons (inline SVG) ──────────────────────────────────────────────

function IconOverview() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function IconSubmit() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function IconClusters() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><line x1="7" y1="7" x2="9.5" y2="9.5"/><line x1="14.5" y1="9.5" x2="17" y2="7"/><line x1="7" y1="17" x2="9.5" y2="14.5"/><line x1="14.5" y1="14.5" x2="17" y2="17"/></svg>;
}
function IconUpload() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function IconProjects() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}

// ─── CSV Parser ─────────────────────────────────────────────────────────────────

function parseCSV(text) {
  const rows = [];
  const lines = text.split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (inQuotes) {
        if (ch === '"' && line[j + 1] === '"') { current += '"'; j++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { fields.push(current.trim()); current = ''; }
        else { current += ch; }
      }
    }
    fields.push(current.trim());
    if (fields[0]) {
      rows.push({ short_description: fields[0], detailed_description: fields[1] || '' });
    }
  }
  return rows;
}

// ─── Upload Panel ───────────────────────────────────────────────────────────────

function UploadPanel({ onNavigate }) {
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadResults, setUploadResults] = useState(null);
  const [pollTracker, setPollTracker] = useState([]);
  const [polling, setPolling] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) return;
    setFileName(file.name);
    setUploadResults(null);
    setPollTracker([]);
    setAllDone(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      setParsedRows(rows.slice(0, 50));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleUpload = async () => {
    if (parsedRows.length === 0) return;
    setUploading(true);
    setUploadProgress(`Uploading ${parsedRows.length} incidents...`);

    try {
      const res = await fetch('/api/bulk-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidents: parsedRows }),
      });
      if (!res.ok) throw new Error('Bulk submit failed');
      const data = await res.json();
      const results = data?.result || data;
      const incidents = results?.incidents || [];
      setUploadResults({ total: results.total || parsedRows.length, created: results.created || incidents.length, failed: results.failed || 0 });
      const tracker = incidents.map(inc => ({
        sys_id: inc.sys_id || inc.staging_id,
        short_description: inc.short_description || '',
        status: 'processing',
        ai_theme: null,
      }));
      setPollTracker(tracker);
      setUploading(false);
      startPolling(tracker);
    } catch (err) {
      console.warn('Bulk submit failed:', err.message);
      setUploadProgress('');
      setUploadResults({ total: parsedRows.length, created: 0, failed: parsedRows.length, error: 'Failed to upload incidents. Please check the connection and try again.' });
      setUploading(false);
    }
  };

  const startPolling = (tracker) => {
    setPolling(true);
    let remaining = [...tracker];
    let attempts = 0;
    const maxAttempts = 15;

    const pollBatch = async () => {
      attempts++;
      const pending = remaining.filter(r => r.status === 'processing');
      if (pending.length === 0 || attempts > maxAttempts) {
        setPolling(false);
        setAllDone(true);
        if (attempts > maxAttempts) {
          setPollTracker(prev => prev.map(r => r.status === 'processing' ? { ...r, status: 'timeout' } : r));
        }
        return;
      }
      const batch = pending.slice(0, 5);
      const results = await Promise.all(batch.map(async (item) => {
        try {
          const res = await fetch(`/api/poll-incident?sys_id=${item.sys_id}`);
          const data = await res.json();
          const record = data?.result;
          if (record && record.ai_theme) {
            return { ...item, status: 'classified', ai_theme: record.ai_theme };
          }
        } catch (err) {
          console.warn('Poll failed for', item.sys_id);
        }
        return item;
      }));
      remaining = remaining.map(r => {
        const updated = results.find(u => u.sys_id === r.sys_id);
        return updated || r;
      });
      setPollTracker([...remaining]);
      setTimeout(pollBatch, 3000);
    };
    setTimeout(pollBatch, 3000);
  };

  const themeDistribution = () => {
    const dist = {};
    pollTracker.filter(r => r.ai_theme).forEach(r => { dist[r.ai_theme] = (dist[r.ai_theme] || 0) + 1; });
    const max = Math.max(...Object.values(dist), 1);
    return Object.entries(dist).sort((a, b) => b[1] - a[1]).map(([theme, count]) => ({ theme, count, pct: (count / max) * 100 }));
  };

  const statusIcon = (s) => {
    if (s === 'classified') return '\u2705';
    if (s === 'timeout' || s === 'failed') return '\u274C';
    return '\u23F3';
  };

  const dropZoneStyle = {
    border: `2px dashed ${dragOver ? C.accent : C.border}`,
    borderRadius: 8, padding: '40px 24px', textAlign: 'center',
    background: dragOver ? C.accentDim : 'transparent',
    transition: 'all 0.2s', cursor: 'pointer', marginBottom: 24,
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 600, color: C.text }}>Bulk CSV Upload</h2>

      {/* Drop zone */}
      <div
        style={dropZoneStyle}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])} />
        <div style={{ marginBottom: 12 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div style={{ fontSize: 14, color: C.text, fontWeight: 500, marginBottom: 4 }}>
          {fileName ? fileName : 'Drop CSV file here or click to browse'}
        </div>
        <div style={{ fontSize: 12, color: C.textSecondary }}>
          Format: short_description, detailed_description (max 50 rows)
        </div>
      </div>

      {/* Preview table */}
      {parsedRows.length > 0 && !uploadResults && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Preview</h3>
              <Badge color={C.info}>{parsedRows.length} rows</Badge>
            </div>
          </div>
          <div style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ display: 'flex', padding: '10px 16px', borderBottom: `1px solid ${C.border}`, background: C.bg }}>
              <div style={{ width: 40, fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>#</div>
              <div style={{ flex: 1, fontSize: 11, color: C.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Short Description</div>
              <div style={{ flex: 1, fontSize: 11, color: C.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Detailed Description</div>
            </div>
            {parsedRows.slice(0, 20).map((row, i) => (
              <div key={i} style={{
                display: 'flex', padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
                animation: `slideIn 0.3s ease ${i * 0.03}s both`,
              }}>
                <div style={{ width: 40, fontSize: 12, color: C.textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</div>
                <div style={{ flex: 1, fontSize: 13, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                  {row.short_description.length > 60 ? row.short_description.slice(0, 60) + '...' : row.short_description}
                </div>
                <div style={{ flex: 1, fontSize: 13, color: C.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.detailed_description.length > 80 ? row.detailed_description.slice(0, 80) + '...' : row.detailed_description}
                </div>
              </div>
            ))}
            {parsedRows.length > 20 && (
              <div style={{ padding: '10px 16px', fontSize: 12, color: C.textSecondary, textAlign: 'center' }}>
                + {parsedRows.length - 20} more rows
              </div>
            )}
          </div>
          <button onClick={handleUpload} disabled={uploading}
            style={{
              padding: '12px 28px', background: uploading ? C.accentDim : C.accent, color: '#fff',
              border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: uploading ? 'wait' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.3s',
              animation: uploading ? 'glow 2s ease-in-out infinite' : 'none',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            {uploading && <Spinner size={16} />}
            {uploading ? uploadProgress : `Upload ${parsedRows.length} Incidents to Pipeline`}
          </button>
        </div>
      )}

      {/* Upload results */}
      {uploadResults && (
        <div style={{ animation: 'fadeUp 0.4s ease', marginBottom: 24 }}>
          {uploadResults.error && (
            <div style={{
              padding: '16px 20px', background: 'rgba(231,76,60,0.08)',
              borderLeft: `3px solid ${C.danger}`, borderRadius: '0 8px 8px 0',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 14, color: C.danger, fontWeight: 600, marginBottom: 4 }}>Upload Failed</div>
              <div style={{ fontSize: 13, color: C.text }}>{uploadResults.error}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <StatCard label="Created" value={uploadResults.created} color={C.success} delay={0} />
            {uploadResults.failed > 0 && <StatCard label="Failed" value={uploadResults.failed} color={C.danger} delay={0.05} />}
          </div>

          {/* Poll tracker */}
          {pollTracker.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>
                  {polling ? 'Processing AI Classification...' : 'Classification Complete'}
                </h3>
                {polling && <Spinner size={16} />}
              </div>
              <div style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 24 }}>
                {pollTracker.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                    borderBottom: i < pollTracker.length - 1 ? `1px solid ${C.border}` : 'none',
                    animation: `slideIn 0.3s ease ${i * 0.03}s both`,
                  }}>
                    <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{statusIcon(item.status)}</span>
                    <span style={{ flex: 1, fontSize: 13, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.short_description.length > 50 ? item.short_description.slice(0, 50) + '...' : item.short_description}
                    </span>
                    {item.ai_theme ? (
                      <Badge color={C.accent}>{item.ai_theme}</Badge>
                    ) : (
                      <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {item.status === 'timeout' ? 'Timed out' : 'Processing...'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Theme distribution */}
          {allDone && themeDistribution().length > 0 && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                Theme Distribution
              </h3>
              <div style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, padding: 20, marginBottom: 20 }}>
                {themeDistribution().map((item, i) => (
                  <div key={i} style={{ marginBottom: i < themeDistribution().length - 1 ? 14 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item.theme}</span>
                      <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>{item.count}</span>
                    </div>
                    <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3, transition: 'width 0.8s ease',
                        background: `linear-gradient(90deg, ${C.accent}, ${C.info})`,
                        width: `${item.pct}%`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, color: C.success, fontWeight: 600 }}>
                  {pollTracker.filter(r => r.status === 'classified').length} incidents classified
                </span>
                <button onClick={() => onNavigate('clusters')}
                  style={{
                    padding: '8px 20px', background: 'transparent', color: C.accent,
                    border: `1px solid ${C.accent}`, borderRadius: 6, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.accentDim; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  View Clusters →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('overview');
  const [clusters, setClusters] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clusterRes, sugRes] = await Promise.all([
          fetch('/api/clusters'),
          fetch('/api/suggestions'),
        ]);
        if (clusterRes.ok) {
          const cData = await clusterRes.json();
          const clusterArr = cData?.result?.clusters || cData?.result || cData?.results || cData;
          if (Array.isArray(clusterArr) && clusterArr.length > 0) setClusters(clusterArr);
        }
        if (sugRes.ok) {
          const sData = await sugRes.json();
          const sugArr = sData?.result?.project_suggestions || sData?.result || sData?.results || sData;
          if (Array.isArray(sugArr) && sugArr.length > 0) setSuggestions(sugArr);
        }
      } catch (err) {
        console.warn('Using mock data — ServiceNow unavailable:', err.message);
      }
      setDataLoaded(true);
    };
    fetchData();
  }, []);

  const navItems = [
    { key: 'overview', label: 'Overview', icon: <IconOverview /> },
    { key: 'submit', label: 'Submit', icon: <IconSubmit /> },
    { key: 'upload', label: 'Upload', icon: <IconUpload /> },
    { key: 'clusters', label: 'Clusters', icon: <IconClusters /> },
    { key: 'projects', label: 'Projects', icon: <IconProjects /> },
  ];

  return (
    <>
      <style>{fontImport}{keyframes}{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.accent}44; border-radius: 3px; }
        ::selection { background: ${C.accent}44; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, background: C.surface, borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10,
        }}>
          <div style={{ padding: '24px 20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, #7b68ee)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>⚡</div>
              <span style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Incident Intel</span>
            </div>
            <div style={{ fontSize: 11, color: C.textSecondary, fontFamily: "'IBM Plex Mono', monospace", paddingLeft: 42 }}>v2.0 · Grok Powered</div>
          </div>

          <nav style={{ flex: 1, padding: '8px 10px' }}>
            {navItems.map(item => {
              const active = tab === item.key;
              return (
                <button key={item.key} onClick={() => setTab(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 14px',
                    background: active ? C.accentDim : 'transparent', border: 'none',
                    borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent',
                    borderRadius: '0 6px 6px 0', cursor: 'pointer', color: active ? C.text : C.textSecondary,
                    fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s', marginBottom: 2,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.surfaceHover; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.success, boxShadow: `0 0 6px ${C.success}` }} />
              <span style={{ fontSize: 11, color: C.textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>ServiceNow + Grok Pipeline</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ marginLeft: 220, flex: 1, padding: '32px 40px', minHeight: '100vh' }}>
          {tab === 'overview' && <OverviewPanel clusters={clusters} suggestions={suggestions} loading={!dataLoaded} />}
          {tab === 'submit' && <SubmitPanel />}
          {tab === 'upload' && <UploadPanel onNavigate={setTab} />}
          {tab === 'clusters' && <ClustersPanel clusters={clusters} />}
          {tab === 'projects' && <SuggestionsPanel suggestions={suggestions} />}
        </main>
      </div>
    </>
  );
}
