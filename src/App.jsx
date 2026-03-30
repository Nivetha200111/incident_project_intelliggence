import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// ─── No mock data — live ServiceNow data only ──────────────────────────────────

// ─── Colors & Styles ────────────────────────────────────────────────────────────

const C = {
  bg: '#07111f',
  surface: '#0d1a30',
  surfaceHover: '#133459',
  accent: '#74f2ce',
  accentDim: 'rgba(116,242,206,0.14)',
  success: '#74f2ce',
  warning: '#ffb347',
  danger: '#ff6b6b',
  info: '#67b7ff',
  text: '#edf4ff',
  textSecondary: '#8e9db3',
  border: 'rgba(116,242,206,0.12)',
  mint: '#74f2ce',
  slate: '#8e9db3',
  teal: '#1d5b7c',
  prussian: '#0b1730',
  prussianDeep: '#050b16',
  gold: '#ffd36e',
  rose: '#ff8ea1',
  panelGlow: 'rgba(103,183,255,0.15)',
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');`;

const keyframes = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 8px rgba(32,201,160,0.4); }
    50% { box-shadow: 0 0 24px rgba(32,201,160,0.7), 0 0 48px rgba(32,201,160,0.25); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes borderGlow {
    0%, 100% { border-color: rgba(32,201,160,0.10); }
    50% { border-color: rgba(32,201,160,0.35); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes logoSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes ripple {
    0% { box-shadow: 0 0 0 0 rgba(32,201,160,0.3); }
    100% { box-shadow: 0 0 0 12px rgba(32,201,160,0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes textGlow {
    0%, 100% { text-shadow: 0 0 4px rgba(32,201,160,0.3); }
    50% { text-shadow: 0 0 16px rgba(32,201,160,0.6), 0 0 32px rgba(32,201,160,0.2); }
  }
  @keyframes dashFlow {
    to { stroke-dashoffset: -20; }
  }
  @keyframes orbitDot {
    0% { transform: rotate(0deg) translateX(38px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
  }
  @keyframes blink {
    50% { border-color: transparent; }
  }
  @keyframes waveMove {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes particleFloat {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
    25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
    50% { transform: translateY(-10px) translateX(-5px); opacity: 0.6; }
    75% { transform: translateY(-30px) translateX(15px); opacity: 0.3; }
  }
  @keyframes progressFill {
    from { width: 0%; }
    to { width: var(--target-width); }
  }
  @keyframes hexPulse {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.1); opacity: 0.6; }
  }
  @keyframes morphBlob {
    0%, 100% { border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; }
    25% { border-radius: 60% 40% 30% 70% / 40% 60% 70% 30%; }
    50% { border-radius: 30% 70% 50% 50% / 50% 40% 60% 50%; }
    75% { border-radius: 50% 50% 40% 60% / 70% 50% 30% 60%; }
  }
  @keyframes grainDrift {
    0% { transform: translate(0, 0); }
    25% { transform: translate(-1%, 2%); }
    50% { transform: translate(2%, -1%); }
    75% { transform: translate(-2%, 1%); }
    100% { transform: translate(0, 0); }
  }
  @keyframes panelFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
`;

// ─── Utility Components ─────────────────────────────────────────────────────────

function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke={C.teal} strokeWidth="3" fill="none" opacity="0.3" />
      <circle cx="12" cy="12" r="10" stroke={C.accent} strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
    </svg>
  );
}

function Badge({ children, color = C.accent, bg }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11,
      fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, letterSpacing: 0.5,
      color: color, background: bg || `${color}18`, border: `1px solid ${color}30`,
      transition: 'all 0.2s ease', backdropFilter: 'blur(4px)',
    }}>{children}</span>
  );
}

function PretextTitle({ text, width = 420, fontSize = 24, lineHeight = 1, color = C.text, accent = C.accent, align = 'left', eyebrow }) {
  const hostRef = useRef(null);
  const [measuredWidth, setMeasuredWidth] = useState(width);
  const font = `700 ${fontSize}px "Space Grotesk"`;
  const prepared = useMemo(() => prepareWithSegments(text, font), [text, font]);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const update = () => setMeasuredWidth(Math.max(140, Math.floor(node.clientWidth || width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [width]);

  const lines = useMemo(() => {
    const result = layoutWithLines(prepared, measuredWidth, Math.round(fontSize * lineHeight));
    return result.lines.length ? result.lines : [{ text }];
  }, [prepared, measuredWidth, fontSize, lineHeight, text]);

  return (
    <div ref={hostRef} style={{ width: '100%', maxWidth: width, marginBottom: 24 }}>
      {eyebrow && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12,
          color: C.textSecondary, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
          textTransform: 'uppercase', letterSpacing: 2.2,
        }}>
          <span style={{ width: 24, height: 1, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
          {eyebrow}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: 2 }}>
        {lines.map((line, index) => (
          <span key={`${line.text}-${index}`} style={{
            display: 'block',
            fontSize,
            fontWeight: 700,
            lineHeight,
            color,
            textAlign: align,
            letterSpacing: '-0.04em',
            fontFamily: "'Space Grotesk', sans-serif",
            transform: `translateX(${index % 2 === 0 ? 0 : 6}px) rotate(${index % 2 === 0 ? -0.35 : 0.25}deg)`,
            textShadow: `0 0 24px ${accent}22`,
            background: `linear-gradient(135deg, ${color}, ${accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {line.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function PretextInline({ text, width = 140, fontSize = 13, lineHeight = 1.05, color = C.text, accent = C.accent, weight = 600, uppercase = false, mono = false }) {
  const hostRef = useRef(null);
  const [measuredWidth, setMeasuredWidth] = useState(width);
  const renderedText = uppercase ? text.toUpperCase() : text;
  const family = mono ? '"IBM Plex Mono"' : '"Space Grotesk"';
  const font = `${weight} ${fontSize}px ${family}`;
  const prepared = useMemo(() => prepareWithSegments(renderedText, font), [renderedText, font]);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const update = () => setMeasuredWidth(Math.max(60, Math.floor(node.clientWidth || width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [width]);

  const lines = useMemo(() => {
    const result = layoutWithLines(prepared, measuredWidth, Math.round(fontSize * lineHeight));
    return result.lines.length ? result.lines : [{ text: renderedText }];
  }, [prepared, measuredWidth, fontSize, lineHeight, renderedText]);

  return (
    <span ref={hostRef} style={{ display: 'block', width: '100%', maxWidth: width, overflow: 'visible' }}>
      {lines.map((line, index) => (
        <span key={`${line.text}-${index}`} style={{ display: 'block', position: 'relative' }}>
          <span style={{
            position: 'absolute',
            inset: 0,
            fontSize,
            lineHeight,
            fontWeight: weight,
            letterSpacing: uppercase ? '0.18em' : '-0.03em',
            color: accent,
            opacity: 0.3,
            fontFamily: mono ? "'IBM Plex Mono', monospace" : "'Space Grotesk', sans-serif",
            transform: `translateX(${index % 2 === 0 ? 2 : 4}px) translateY(${index % 2 === 0 ? 1 : -1}px) rotate(${index % 2 === 0 ? -0.8 : 0.6}deg)`,
            transformOrigin: 'left center',
            pointerEvents: 'none',
            whiteSpace: 'pre-wrap',
            filter: 'blur(0.2px)',
          }}>
            {line.text}
          </span>
          <span style={{
            display: 'block',
            position: 'relative',
            fontSize,
            lineHeight,
            fontWeight: weight,
            letterSpacing: uppercase ? '0.18em' : '-0.03em',
            color,
            fontFamily: mono ? "'IBM Plex Mono', monospace" : "'Space Grotesk', sans-serif",
            transform: `translateX(${index % 2 === 0 ? 0 : 2}px) rotate(${index % 2 === 0 ? -0.35 : 0.28}deg)`,
            transformOrigin: 'left center',
            textShadow: `0 0 16px ${accent}18`,
            whiteSpace: 'pre-wrap',
          }}>
            {line.text}
          </span>
        </span>
      ))}
    </span>
  );
}

function StatCard({ label, value, color = C.accent, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: `linear-gradient(160deg, rgba(13,26,48,0.92), rgba(6,12,24,0.96))`,
        borderRadius: 18, padding: '22px 24px', flex: '1 1 180px',
        border: `1px solid ${hovered ? color + '44' : C.border}`,
        animation: `scaleIn 0.5s ease ${delay}s both`,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0)',
        boxShadow: hovered ? `0 18px 40px rgba(0,0,0,0.35), 0 0 0 1px ${color}22, 0 0 40px ${color}18` : '0 8px 18px rgba(0,0,0,0.24)',
        position: 'relative', overflow: 'hidden',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
      }} />
      <div style={{ color: C.textSecondary, marginBottom: 10, maxWidth: 150 }}>
        <PretextInline text={label} width={150} fontSize={11} lineHeight={1.05} color={C.textSecondary} accent={color} weight={700} uppercase mono />
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: "'IBM Plex Mono', monospace", transition: 'text-shadow 0.3s', textShadow: hovered ? `0 0 20px ${color}66` : 'none' }}>{value}</div>
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
    { name: 'Grok AI Classifier', status: isConnected ? 'Active' : (loading ? 'Connecting...' : 'Unavailable'), color: isConnected ? C.mint : (loading ? C.warning : C.danger) },
    { name: 'Keyword Fallback Engine', status: 'Standby', color: C.info },
    { name: 'Confidence Gate', status: '70% threshold', color: C.mint },
    { name: 'Cluster Matching Engine', status: isConnected ? `${clusterCount} clusters` : (loading ? 'Loading...' : 'No data'), color: isConnected ? C.mint : (loading ? C.warning : C.textSecondary) },
    { name: 'Project Suggestion Engine', status: isConnected ? `${suggestionCount} active` : (loading ? 'Loading...' : 'No data'), color: isConnected ? C.mint : (loading ? C.warning : C.textSecondary) },
  ];

  return (
    <div>
      <PretextTitle text="System Dashboard" eyebrow="Live Control Surface" width={420} fontSize={38} lineHeight={0.95} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Incidents Processed" value={loading ? '...' : totalIncidents} color={C.accent} delay={0} />
        <StatCard label="Active Clusters" value={loading ? '...' : clusterCount} color={C.info} delay={0.05} />
        <StatCard label="Project Suggestions" value={loading ? '...' : suggestionCount} color={C.success} delay={0.1} />
        <StatCard label="High Impact Clusters" value={loading ? '...' : highImpact} color={C.warning} delay={0.15} />
      </div>

      <div style={{ marginBottom: 16, fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 2, fontFamily: "'IBM Plex Mono', monospace" }}>Classification Pipeline</div>
      <div style={{ background: `linear-gradient(180deg, rgba(13,26,48,0.88), rgba(5,11,22,0.94))`, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden', backdropFilter: 'blur(16px)', boxShadow: '0 18px 40px rgba(0,0,0,0.24)' }}>
        {pipeline.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: i < pipeline.length - 1 ? `1px solid ${C.border}` : 'none',
            animation: `slideIn 0.5s ease ${i * 0.08}s both`,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(32,201,160,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}`, animation: item.status === 'Active' ? 'ripple 2s ease-in-out infinite' : 'none' }} />
              <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item.name}</span>
            </div>
            <span style={{ fontSize: 12, color: item.color, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 }}>{item.status}</span>
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
    borderRadius: 6, color: C.text, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif",
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  return (
    <div>
      <PretextTitle text="Submit Incident" eyebrow="Single Ticket Intake" width={360} fontSize={34} lineHeight={0.95} />
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
            fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.3s',
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
            <div style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text, fontFamily: "'Space Grotesk', sans-serif" }}>Classification Result</div>
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
                background: `linear-gradient(90deg, ${C.teal}, ${C.accent})`,
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
              padding: '14px 18px', background: 'rgba(32,201,160,0.06)', borderLeft: `3px solid ${C.accent}`,
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
      <PretextTitle text="Incident Clusters" eyebrow="Pattern Constellations" width={380} fontSize={34} lineHeight={0.95} />
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
                background: `linear-gradient(135deg, ${C.surface}, ${C.prussianDeep})`, borderRadius: 12,
                border: `1px solid ${isOpen ? C.accent + '33' : C.border}`,
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden',
                animation: `fadeUp 0.5s ease ${i * 0.06}s both`,
                boxShadow: isOpen ? `0 4px 20px rgba(32,201,160,0.1)` : '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent + '44'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isOpen ? C.accent + '33' : C.border; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: ic + '18', color: ic, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 16,
                  border: `1px solid ${ic}22`, transition: 'transform 0.2s',
                }}>{cluster.incident_count}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{cluster.theme}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Badge color={ic}>{cluster.impact_level}</Badge>
                    <Badge color={C.textSecondary}>{cluster.recommendation_status}</Badge>
                  </div>
                </div>
                <div style={{ color: C.textSecondary, fontSize: 18, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>▾</div>
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 16px', animation: 'slideDown 0.3s ease' }}>
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
      <PretextTitle text="Project Suggestions" eyebrow="Remediation Opportunities" width={420} fontSize={34} lineHeight={0.95} />
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
                background: `linear-gradient(135deg, ${C.surface}, ${C.prussianDeep})`, borderRadius: 12,
                border: `1px solid ${isOpen ? C.accent + '33' : C.border}`,
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden',
                animation: `fadeUp 0.5s ease ${i * 0.06}s both`,
                boxShadow: isOpen ? `0 4px 20px rgba(32,201,160,0.1)` : '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent + '44'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isOpen ? C.accent + '33' : C.border; e.currentTarget.style.transform = 'translateX(0)'; }}
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
                <div style={{ color: C.textSecondary, fontSize: 18, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>▾</div>
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 16px', animation: 'slideDown 0.3s ease' }}>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{
                      padding: '14px 18px', background: 'rgba(32,201,160,0.06)', borderLeft: `3px solid ${C.accent}`,
                      borderRadius: '0 6px 6px 0',
                    }}>
                      <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Justification</div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{sug.justification}</div>
                    </div>
                    <div style={{
                      padding: '14px 18px', background: 'rgba(32,201,160,0.04)', borderLeft: `3px solid ${C.mint}`,
                      borderRadius: '0 6px 6px 0',
                    }}>
                      <div style={{ fontSize: 11, color: C.mint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Expected Value</div>
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
function IconDemands() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}
function IconAnalytics() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
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
      <PretextTitle text="Bulk CSV Upload" eyebrow="Batch Intake" width={360} fontSize={34} lineHeight={0.95} />

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
              <div style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text, fontFamily: "'Space Grotesk', sans-serif" }}>Preview</div>
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
              fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.3s',
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
                <div style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {polling ? 'Processing AI Classification...' : 'Classification Complete'}
                </div>
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
              <div style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 2, fontFamily: "'IBM Plex Mono', monospace" }}>
                Theme Distribution
              </div>
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
                        background: `linear-gradient(90deg, ${C.teal}, ${C.accent})`,
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
                    cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s',
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

// ─── Demands Panel ──────────────────────────────────────────────────────────────

function demandPriorityColor(p) {
  if (!p) return C.textSecondary;
  if (p === '1' || p.includes('Critical')) return C.danger;
  if (p === '2' || p.includes('High')) return C.warning;
  if (p === '3' || p.includes('Medium')) return C.info;
  return C.success;
}

function demandPriorityLabel(p) {
  if (!p) return 'Unknown';
  if (p === '1') return 'Critical';
  if (p === '2') return 'High';
  if (p === '3') return 'Medium';
  if (p === '4') return 'Low';
  return p;
}

function demandStateColor(s) {
  if (!s) return C.textSecondary;
  const map = {
    Draft: C.info, Submitted: C.warning, Screening: '#9b59b6',
    Qualified: C.success, Approved: '#1a9c5a', Completed: C.textSecondary,
    Rejected: C.danger, Deferred: '#d4a017',
  };
  return map[s] || C.textSecondary;
}

function DemandsPanel({ demands, isMock, loading }) {
  const [expanded, setExpanded] = useState(null);

  const totalDemands = demands.length;
  const totalIncidents = demands.reduce((s, d) => s + (parseInt(d.u_incident_count) || 0), 0);
  const avgConfidence = totalDemands > 0
    ? Math.round(demands.reduce((s, d) => s + (parseFloat(d.u_ai_confidence) || 0), 0) / totalDemands)
    : 0;
  const categories = new Set(demands.map(d => d.u_category).filter(Boolean)).size;

  const sorted = [...demands].sort((a, b) => {
    const pA = parseInt(a.priority) || (a.priority || '').charCodeAt(0);
    const pB = parseInt(b.priority) || (b.priority || '').charCodeAt(0);
    return pA - pB;
  });

  return (
    <div>
      <PretextTitle text="SPM Demands" eyebrow="Execution Backlog" width={320} fontSize={34} lineHeight={0.95} />

      {isMock && (
        <div style={{
          padding: '10px 16px', marginBottom: 20, borderRadius: 6,
          background: 'rgba(243,156,18,0.08)', border: `1px solid rgba(243,156,18,0.2)`,
          fontSize: 12, color: C.warning, fontFamily: "'IBM Plex Mono', monospace",
        }}>
          ⚠ Mock data — ServiceNow unreachable
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Total Demands" value={loading ? '...' : totalDemands} color={C.accent} delay={0} />
        <StatCard label="Supporting Incidents" value={loading ? '...' : totalIncidents} color={C.info} delay={0.05} />
        <StatCard label="Avg AI Confidence" value={loading ? '...' : `${avgConfidence}%`} color={C.success} delay={0.1} />
        <StatCard label="Categories" value={loading ? '...' : categories} color={C.warning} delay={0.15} />
      </div>

      {sorted.length === 0 && !loading && (
        <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary, fontSize: 14 }}>
          No demands found. Approve project suggestions to generate SPM demands.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((demand, i) => {
          const isOpen = expanded === i;
          const pc = demandPriorityColor(demand.priority);
          const sc = demandStateColor(demand.state);
          const confidence = parseFloat(demand.u_ai_confidence) || 0;
          const confColor = confidence >= 70 ? C.success : C.warning;

          return (
            <div key={demand.sys_id || i}
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{
                background: `linear-gradient(135deg, ${C.surface}, ${C.prussianDeep})`, borderRadius: 12,
                border: `1px solid ${isOpen ? C.accent + '33' : C.border}`,
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden',
                animation: `fadeUp 0.5s ease ${i * 0.06}s both`,
                boxShadow: isOpen ? `0 4px 20px rgba(32,201,160,0.1)` : '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent + '44'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isOpen ? C.accent + '33' : C.border; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: pc + '18', color: pc, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 14,
                }}>{demand.u_incident_count || 0}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>{demand.number}</span>
                    {demand.u_category && <Badge color={C.textSecondary}>{demand.u_category}</Badge>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>{demand.short_description}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge color={pc}>{demandPriorityLabel(demand.priority)}</Badge>
                    <Badge color={sc}>{demand.state || 'Unknown'}</Badge>
                    <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {demand.u_incident_count || 0} incidents
                    </span>
                    <span style={{ fontSize: 12, color: confColor, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                      {confidence}% confidence
                    </span>
                  </div>
                </div>
                <div style={{ color: C.textSecondary, fontSize: 18, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</div>
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 16px', animation: 'slideDown 0.3s ease' }}>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {demand.u_business_case && (
                      <div style={{
                        padding: '14px 18px', background: 'rgba(32,201,160,0.06)', borderLeft: `3px solid ${C.accent}`,
                        borderRadius: '0 6px 6px 0',
                      }}>
                        <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Business Case</div>
                        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{demand.u_business_case}</div>
                      </div>
                    )}
                    {demand.u_value && (
                      <div style={{
                        padding: '14px 18px', background: 'rgba(32,201,160,0.04)', borderLeft: `3px solid ${C.mint}`,
                        borderRadius: '0 6px 6px 0',
                      }}>
                        <div style={{ fontSize: 11, color: C.mint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Expected Value / ROI</div>
                        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{demand.u_value}</div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {demand.u_type && (
                        <div style={{ flex: '1 1 200px' }}>
                          <div style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Type</div>
                          <div style={{ fontSize: 13, color: C.text, textTransform: 'capitalize' }}>{demand.u_type}</div>
                        </div>
                      )}
                      {demand.u_categorization && (
                        <div style={{ flex: '1 1 200px' }}>
                          <div style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Categorization</div>
                          <div style={{ fontSize: 13, color: C.text, textTransform: 'capitalize' }}>{demand.u_categorization}</div>
                        </div>
                      )}
                      {demand.sys_created_on && (
                        <div style={{ flex: '1 1 200px' }}>
                          <div style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Created</div>
                          <div style={{ fontSize: 13, color: C.text }}>{demand.sys_created_on}</div>
                        </div>
                      )}
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

// ─── Analytics Panel ────────────────────────────────────────────────────────────

const THEME_COLORS = {
  'Performance Degradation': '#378ADD',
  'Authentication Failure': '#1D9E75',
  'Network Outage': '#D85A30',
  'Application Error': '#534AB7',
  'Data Integrity Issue': '#D4537E',
  'Infrastructure Capacity': '#BA7517',
  'Provisioning Request': '#639922',
  'Security Incident': '#E24B4A',
};

const FUNNEL_COLORS = ['#378ADD', '#1D9E75', '#534AB7', '#D85A30'];

function ChartCard({ title, height = 230, children, delay = 0 }) {
  return (
    <div style={{
      background: `linear-gradient(160deg, rgba(13,26,48,0.9), rgba(5,11,22,0.95))`,
      borderRadius: 20, border: `1px solid ${C.border}`,
      padding: '18px 20px', animation: `fadeUp 0.5s ease ${delay}s both`,
      boxShadow: '0 18px 40px rgba(0,0,0,0.22)', backdropFilter: 'blur(16px)',
    }}>
      <div style={{ color: C.textSecondary, marginBottom: 14, maxWidth: 220 }}>
        <PretextInline text={title} width={240} fontSize={13} lineHeight={1.05} color={C.text} accent={C.info} weight={700} uppercase mono />
      </div>
      <div style={{ height, position: 'relative' }}>{children}</div>
    </div>
  );
}

function CustomLegend({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ minWidth: 0, maxWidth: 180 }}>
            <PretextInline text={item.label} width={180} fontSize={11} lineHeight={1.05} color={C.textSecondary} accent={item.color || C.info} weight={600} />
          </span>
          {item.value != null && <span style={{ fontSize: 11, color: C.text, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{item.value}</span>}
        </div>
      ))}
    </div>
  );
}

function getNiceStep(maxValue, targetSteps = 4) {
  if (!maxValue || maxValue <= 0) return 1;
  const rough = maxValue / targetSteps;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const niceBase = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceBase * magnitude;
}

function buildTicks(maxValue, targetSteps = 4) {
  const step = getNiceStep(maxValue, targetSteps);
  const upper = Math.max(step, Math.ceil(maxValue / step) * step);
  const ticks = [];
  for (let value = 0; value <= upper; value += step) ticks.push(value);
  return ticks;
}

function VerticalAxisChart({ chart, labels, ticks, tickFormatter = (value) => value, labelWidth = 80, bottomHeight = 58 }) {
  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '42px minmax(0, 1fr)', gridTemplateRows: `minmax(0, 1fr) ${bottomHeight}px`, gap: 0 }}>
      <div style={{
        display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between',
        padding: '4px 8px 8px 0', borderRight: `1px solid ${C.border}`,
      }}>
        {ticks.map((tick) => (
          <div key={tick} style={{ textAlign: 'right' }}>
            <PretextInline text={String(tickFormatter(tick))} width={34} fontSize={10} lineHeight={1} color={C.textSecondary} accent={C.info} weight={600} mono />
          </div>
        ))}
      </div>
      <div style={{ minWidth: 0, minHeight: 0, paddingLeft: 10 }}>{chart}</div>
      <div />
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))`,
        alignItems: 'start', gap: 0, padding: '10px 0 0 10px',
      }}>
        {labels.map((label, index) => (
          <div key={`${label}-${index}`} style={{ display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
            <div style={{ width: labelWidth, transform: 'rotate(-24deg)', transformOrigin: 'top center' }}>
              <PretextInline text={label} width={labelWidth} fontSize={11} lineHeight={1.05} color={C.textSecondary} accent={C.info} weight={600} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalAxisChart({ chart, labels, ticks, tickFormatter = (value) => value, leftWidth = 168 }) {
  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: `${leftWidth}px minmax(0, 1fr)`, gridTemplateRows: 'minmax(0, 1fr) 34px', gap: 0 }}>
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
        alignItems: 'flex-end', padding: '8px 12px 18px 0', borderRight: `1px solid ${C.border}`,
      }}>
        {labels.map((label, index) => (
          <div key={`${label}-${index}`} style={{ width: leftWidth - 20, textAlign: 'right' }}>
            <PretextInline text={label} width={leftWidth - 20} fontSize={11} lineHeight={1.05} color={C.textSecondary} accent={C.info} weight={600} />
          </div>
        ))}
      </div>
      <div style={{ minWidth: 0, minHeight: 0, paddingLeft: 10 }}>{chart}</div>
      <div />
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${ticks.length}, minmax(0, 1fr))`,
        padding: '8px 0 0 10px', borderTop: `1px solid ${C.border}`,
      }}>
        {ticks.map((tick) => (
          <div key={tick} style={{ textAlign: 'center' }}>
            <PretextInline text={String(tickFormatter(tick))} width={64} fontSize={10} lineHeight={1} color={C.textSecondary} accent={C.info} weight={600} mono />
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPanel({ loading }) {
  const [analytics, setAnalytics] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          if (data._mock) setIsMock(true);
          setAnalytics(data.result || data);
        } else {
          setError('Failed to load analytics');
        }
      } catch (err) {
        setError('Failed to load analytics');
      }
    };
    fetchAnalytics();
  }, []);

  if (!analytics && !error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
        <Spinner size={24} />
        <span style={{ color: C.textSecondary, fontSize: 14 }}>Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: 40, color: C.danger, fontSize: 14 }}>{error}</div>;
  }

  const { summary, incidents_by_category, cluster_impact, confidence_distribution, demand_roi, pipeline_funnel } = analytics;

  const gridLight = 'rgba(255,255,255,0.06)';
  const tickColor = '#7D8699';

  const baseScaleOpts = {
    ticks: { color: tickColor, font: { size: 11, family: "'Space Grotesk', sans-serif" } },
    grid: { color: gridLight, drawBorder: false },
  };

  // --- Incidents by Category (vertical bar) ---
  const categoryData = {
    labels: incidents_by_category.map(d => d.theme.split(' ').slice(0, 2).join(' ')),
    datasets: [{
      data: incidents_by_category.map(d => d.count),
      backgroundColor: incidents_by_category.map(d => THEME_COLORS[d.theme] || '#378ADD'),
      borderRadius: 4, barPercentage: 0.65,
    }],
  };
  const categoryOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { title: (ctx) => incidents_by_category[ctx[0].dataIndex]?.theme } } },
    scales: {
      x: { ...baseScaleOpts, ticks: { display: false }, grid: { ...baseScaleOpts.grid, display: false } },
      y: { ...baseScaleOpts, beginAtZero: true, ticks: { display: false } },
    },
  };

  // --- Cluster Impact (grouped bar) ---
  const impactMap = { Low: 1, Medium: 2, High: 3, Critical: 4 };
  const clusterImpactData = {
    labels: cluster_impact.map(d => d.theme.split(' ').slice(0, 2).join(' ')),
    datasets: [
      {
        label: 'Incidents',
        data: cluster_impact.map(d => d.incident_count),
        backgroundColor: '#378ADD',
        borderRadius: 4, barPercentage: 0.7,
      },
      {
        label: 'Impact Level',
        data: cluster_impact.map(d => impactMap[d.impact_level] || 0),
        backgroundColor: '#D85A30',
        borderRadius: 4, barPercentage: 0.7,
      },
    ],
  };
  const clusterImpactOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {
      callbacks: {
        title: (ctx) => cluster_impact[ctx[0].dataIndex]?.theme,
        label: (ctx) => {
          if (ctx.datasetIndex === 1) {
            const labels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
            return `Impact: ${labels[ctx.raw] || ctx.raw}`;
          }
          return `Incidents: ${ctx.raw}`;
        },
      },
    }},
    scales: {
      x: { ...baseScaleOpts, ticks: { display: false }, grid: { ...baseScaleOpts.grid, display: false } },
      y: { ...baseScaleOpts, beginAtZero: true, ticks: { display: false } },
    },
  };

  // --- Confidence Distribution (doughnut) ---
  const confTotal = confidence_distribution.high + confidence_distribution.medium + confidence_distribution.low;
  const confData = {
    labels: ['High (>80%)', 'Medium (60-80%)', 'Low (<60%)'],
    datasets: [{
      data: [confidence_distribution.high, confidence_distribution.medium, confidence_distribution.low],
      backgroundColor: ['#1D9E75', '#BA7517', '#E24B4A'],
      borderWidth: 0,
    }],
  };
  const confOpts = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: { legend: { display: false }, tooltip: {
      callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / confTotal * 100)}%)` },
    }},
  };

  // --- Demand ROI (horizontal bar) ---
  const roiData = {
    labels: demand_roi.map(d => d.name.replace(/ — Remediation Initiative/, '')),
    datasets: [{
      data: demand_roi.map(d => d.estimated_roi),
      backgroundColor: demand_roi.map((d) => {
        const cat = d.name.split(' — ')[0];
        return THEME_COLORS[cat] || '#378ADD';
      }),
      borderRadius: 4, barPercentage: 0.65,
    }],
  };
  const roiOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: { legend: { display: false }, tooltip: {
      callbacks: { label: (ctx) => `$${ctx.raw.toLocaleString()}` },
    }},
    scales: {
      x: { ...baseScaleOpts, ticks: { display: false } },
      y: { ...baseScaleOpts, ticks: { display: false }, grid: { ...baseScaleOpts.grid, display: false } },
    },
  };

  // --- Pipeline Funnel (bar) ---
  const funnelData = {
    labels: ['Incidents', 'Clusters', 'Suggestions', 'Demands'],
    datasets: [{
      data: [pipeline_funnel.incidents, pipeline_funnel.clusters, pipeline_funnel.suggestions, pipeline_funnel.demands],
      backgroundColor: FUNNEL_COLORS,
      borderRadius: 4, barPercentage: 0.55,
    }],
  };
  const funnelOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {} },
    scales: {
      x: { ...baseScaleOpts, ticks: { display: false }, grid: { ...baseScaleOpts.grid, display: false } },
      y: { ...baseScaleOpts, beginAtZero: true, ticks: { display: false } },
    },
  };

  const categoryTicks = buildTicks(Math.max(...incidents_by_category.map((d) => d.count), 0));
  const clusterImpactTicks = buildTicks(Math.max(...cluster_impact.map((d) => Math.max(d.incident_count, impactMap[d.impact_level] || 0)), 0));
  const roiTicks = buildTicks(Math.max(...demand_roi.map((d) => d.estimated_roi), 0));
  const funnelTicks = buildTicks(Math.max(pipeline_funnel.incidents, pipeline_funnel.clusters, pipeline_funnel.suggestions, pipeline_funnel.demands, 0));

  const metricCards = [
    { label: 'Total Incidents', value: summary.total_incidents, color: '#378ADD' },
    { label: 'Active Clusters', value: summary.total_clusters, color: '#1D9E75' },
    { label: 'Demands Generated', value: summary.total_demands, color: '#534AB7' },
    { label: 'Avg AI Confidence', value: `${summary.avg_confidence}%`, color: '#BA7517' },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.5s ease both' }}>
      <PretextTitle text="Analytics Dashboard" eyebrow="Signal Map" width={440} fontSize={38} lineHeight={0.95} />
      {isMock && (
        <div style={{
          background: 'rgba(186,117,23,0.12)', border: '1px solid rgba(186,117,23,0.3)',
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13,
          color: '#BA7517', fontFamily: "'IBM Plex Mono', monospace",
          animation: 'fadeUp 0.3s ease both',
        }}>
          Showing sample data — ServiceNow instance is hibernated
        </div>
      )}

      {/* Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {metricCards.map((m, i) => (
          <StatCard key={m.label} label={m.label} value={m.value} color={m.color} delay={i * 0.08} />
        ))}
      </div>

      {/* Row 2: Incidents by Category + Cluster Impact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Incidents by Category" delay={0.1}>
          <VerticalAxisChart
            labels={incidents_by_category.map((d) => d.theme)}
            ticks={categoryTicks}
            chart={<Bar data={categoryData} options={categoryOpts} />}
          />
          <CustomLegend items={incidents_by_category.map(d => ({ color: THEME_COLORS[d.theme], label: d.theme, value: d.count }))} />
        </ChartCard>
        <ChartCard title="Cluster Impact Escalation" delay={0.15}>
          <VerticalAxisChart
            labels={cluster_impact.map((d) => d.theme)}
            ticks={clusterImpactTicks}
            chart={<Bar data={clusterImpactData} options={clusterImpactOpts} />}
          />
          <CustomLegend items={[{ color: '#378ADD', label: 'Incidents' }, { color: '#D85A30', label: 'Impact Level (1-4)' }]} />
        </ChartCard>
      </div>

      {/* Row 3: Confidence Distribution + ROI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 16 }}>
        <ChartCard title="AI Confidence Distribution" height={240} delay={0.2}>
          <div style={{ position: 'relative', height: '100%' }}>
            <Doughnut data={confData} options={confOpts} />
            <div style={{
              position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>{summary.avg_confidence}%</div>
              <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 2 }}>avg confidence</div>
            </div>
          </div>
          <CustomLegend items={[
            { color: '#1D9E75', label: 'High (>80%)', value: confidence_distribution.high },
            { color: '#BA7517', label: 'Medium', value: confidence_distribution.medium },
            { color: '#E24B4A', label: 'Low (<60%)', value: confidence_distribution.low },
          ]} />
        </ChartCard>
        <ChartCard title="Estimated ROI by Demand" height={240} delay={0.25}>
          <HorizontalAxisChart
            labels={demand_roi.map((d) => d.name.replace(/ â€” Remediation Initiative/, ''))}
            ticks={roiTicks}
            tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            chart={<Bar data={roiData} options={roiOpts} />}
          />
          <CustomLegend items={demand_roi.map((d) => ({
            color: THEME_COLORS[d.name.split(' â€” ')[0]] || '#378ADD',
            label: d.name.replace(/ â€” Remediation Initiative/, ''),
            value: `$${d.estimated_roi.toLocaleString()}`,
          }))} />
        </ChartCard>
      </div>

      {/* Row 4: Pipeline Funnel */}
      <ChartCard title="Pipeline Compression Funnel" height={180} delay={0.3}>
        <VerticalAxisChart
          labels={['Incidents', 'Clusters', 'Suggestions', 'Demands']}
          ticks={funnelTicks}
          chart={<Bar data={funnelData} options={funnelOpts} />}
          labelWidth={92}
          bottomHeight={46}
        />
        <CustomLegend items={['Incidents', 'Clusters', 'Suggestions', 'Demands'].map((label, i) => ({
          color: FUNNEL_COLORS[i], label, value: [pipeline_funnel.incidents, pipeline_funnel.clusters, pipeline_funnel.suggestions, pipeline_funnel.demands][i],
        }))} />
      </ChartCard>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('overview');
  const [clusters, setClusters] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [demands, setDemands] = useState([]);
  const [demandsMock, setDemandsMock] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clusterRes, sugRes, demandRes] = await Promise.all([
          fetch('/api/clusters'),
          fetch('/api/suggestions'),
          fetch('/api/demands'),
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
        if (demandRes.ok) {
          const dData = await demandRes.json();
          if (dData._mock) setDemandsMock(true);
          const demandArr = dData?.result || dData?.results || dData;
          if (Array.isArray(demandArr) && demandArr.length > 0) setDemands(demandArr);
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
    { key: 'demands', label: 'Demands', icon: <IconDemands /> },
    { key: 'analytics', label: 'Analytics', icon: <IconAnalytics /> },
  ];

  return (
    <>
      <style>{fontImport}{keyframes}{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { background: ${C.bg}; }
        body { background:
          radial-gradient(circle at 15% 20%, rgba(103,183,255,0.14), transparent 24%),
          radial-gradient(circle at 85% 15%, rgba(116,242,206,0.10), transparent 20%),
          radial-gradient(circle at 70% 75%, rgba(255,211,110,0.08), transparent 22%),
          linear-gradient(180deg, #08101d, #050913 52%, #07111f);
          color: ${C.text}; font-family: 'Space Grotesk', sans-serif; -webkit-font-smoothing: antialiased; }
        #root { min-height: 100vh; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.prussianDeep}; }
        ::-webkit-scrollbar-thumb { background: ${C.accent}44; border-radius: 3px; transition: background 0.2s; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.accent}88; }
        ::selection { background: ${C.accent}44; }
        button:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.3, mixBlendMode: 'screen',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 0.8px, transparent 0.8px)',
          backgroundSize: '22px 22px', animation: 'grainDrift 12s steps(10) infinite',
        }} />
        {/* Sidebar */}
        <aside style={{
          width: 252, background: `linear-gradient(180deg, rgba(11,23,48,0.88), rgba(5,11,22,0.98))`,
          borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10,
          boxShadow: '20px 0 60px rgba(0,0,0,0.28)', backdropFilter: 'blur(18px)',
        }}>
          {/* Logo & Branding */}
          <div style={{ padding: '28px 22px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${C.accent}, ${C.info})`,
                boxShadow: `0 8px 22px rgba(103,183,255,0.28)`,
                animation: 'float 4s ease-in-out infinite',
                overflow: 'hidden',
              }}>
                <img src="/logo.svg" alt="Logo" style={{ width: 28, height: 28 }} />
              </div>
              <div>
                <span style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.5, display: 'block' }}>Incident Intel</span>
                <span style={{ fontSize: 10, color: C.slate, fontFamily: "'IBM Plex Mono', monospace" }}>v2.0 · Grok Powered</span>
              </div>
            </div>
          </div>

          {/* Decorative line */}
          <div style={{
            height: 1, margin: '0 20px 8px',
            background: `linear-gradient(90deg, transparent, ${C.accent}44, transparent)`,
          }} />

          <nav style={{ flex: 1, padding: '12px 14px' }}>
            {navItems.map((item, idx) => {
              const active = tab === item.key;
              return (
                <button key={item.key} onClick={() => setTab(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px',
                    background: active ? `linear-gradient(90deg, ${C.accentDim}, rgba(103,183,255,0.04))` : 'transparent',
                    border: 'none',
                    borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent',
                    borderRadius: 14, cursor: 'pointer',
                    color: active ? C.accent : C.textSecondary,
                    fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: "'Space Grotesk', sans-serif",
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: 2,
                    animation: `slideIn 0.4s ease ${idx * 0.05}s both`,
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(32,201,160,0.06)'; e.currentTarget.style.color = C.text; e.currentTarget.style.paddingLeft = '20px'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.paddingLeft = '16px'; } }}
                >
                  {item.icon}
                  <span style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                    <PretextInline
                      text={item.label}
                      width={120}
                      fontSize={14}
                      lineHeight={1.05}
                      color={active ? C.text : C.textSecondary}
                      accent={active ? C.accent : C.info}
                      weight={active ? 700 : 600}
                    />
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Status bar */}
          <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.mint, boxShadow: `0 0 8px ${C.mint}`, animation: 'ripple 2.5s ease-in-out infinite' }} />
              <span style={{ fontSize: 11, color: C.slate, fontFamily: "'IBM Plex Mono', monospace" }}>ServiceNow + Grok Pipeline</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ marginLeft: 252, flex: 1, padding: '40px 44px 48px', minHeight: '100vh', animation: 'fadeUp 0.6s ease', position: 'relative' }}>
          {tab === 'overview' && <OverviewPanel clusters={clusters} suggestions={suggestions} loading={!dataLoaded} />}
          {tab === 'submit' && <SubmitPanel />}
          {tab === 'upload' && <UploadPanel onNavigate={setTab} />}
          {tab === 'clusters' && <ClustersPanel clusters={clusters} />}
          {tab === 'projects' && <SuggestionsPanel suggestions={suggestions} />}
          {tab === 'demands' && <DemandsPanel demands={demands} isMock={demandsMock} loading={!dataLoaded} />}
          {tab === 'analytics' && <AnalyticsPanel loading={!dataLoaded} />}
        </main>
      </div>
    </>
  );
}
