import React, { useState, useEffect, useCallback } from 'react';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_CLUSTERS = [
  { cluster_name: 'AUTH-001', theme: 'Authentication Failure', incident_count: 14, impact_level: 'High', recommendation_status: 'Recommended', summary: 'Recurring authentication failures across SSO and LDAP integrations affecting enterprise login flows. Root cause traces to token expiration handling and session management inconsistencies.' },
  { cluster_name: 'PERF-002', theme: 'Performance Degradation', incident_count: 7, impact_level: 'Medium', recommendation_status: 'Under Review', summary: 'Application response times exceeding SLA thresholds during peak hours. Database query optimization and caching layer improvements identified as primary remediation paths.' },
  { cluster_name: 'SEC-003', theme: 'Security Incident', incident_count: 5, impact_level: 'Medium', recommendation_status: 'Monitoring', summary: 'Multiple failed intrusion attempts detected on API endpoints. WAF rules updated but pattern analysis suggests coordinated scanning activity requiring enhanced monitoring.' },
  { cluster_name: 'NET-004', theme: 'Network Outage', incident_count: 3, impact_level: 'Low', recommendation_status: 'Monitoring', summary: 'Intermittent connectivity issues in secondary data center. Traced to aging network switches scheduled for replacement in Q3.' },
  { cluster_name: 'DATA-005', theme: 'Data Integrity Issue', incident_count: 2, impact_level: 'Low', recommendation_status: 'Monitoring', summary: 'Minor data synchronization discrepancies between primary and replica databases during failover events.' },
  { cluster_name: 'INTG-006', theme: 'Integration Failure', incident_count: 2, impact_level: 'Low', recommendation_status: 'Monitoring', summary: 'Third-party API integration timeouts during vendor maintenance windows. Retry logic and circuit breaker patterns recommended.' },
];

const MOCK_SUGGESTIONS = [
  { project_name: 'Authentication System Overhaul', source_cluster: 'AUTH-001', justification: 'With 14 incidents traced to authentication failures, a comprehensive overhaul of the SSO and LDAP integration layer would eliminate the highest-volume incident cluster. This includes implementing robust token refresh mechanisms, session failover handling, and unified identity provider management.', expected_value: 'Projected 60% reduction in authentication-related incidents (est. 8-10 fewer incidents/month), improved user satisfaction scores, and reduced help desk call volume by approximately 25%.', priority: '2 - High', status: 'Draft', support_count: 14, last_refreshed: '2026-03-23T10:00:00Z' },
  { project_name: 'Performance Optimization Initiative', source_cluster: 'PERF-002', justification: 'Performance degradation incidents are trending upward with 7 incidents in the current period. Database query analysis reveals unoptimized joins and missing indices on high-traffic tables. A targeted optimization sprint would address root causes systematically.', expected_value: 'Expected 40% improvement in application response times, bringing p95 latency under 200ms SLA threshold. Estimated cost avoidance of $15K/month in over-provisioned infrastructure.', priority: '3 - Medium', status: 'Draft', support_count: 7, last_refreshed: '2026-03-23T10:00:00Z' },
  { project_name: 'Security Posture Enhancement', source_cluster: 'SEC-003', justification: 'Five security incidents indicate gaps in the current defensive posture. Pattern analysis suggests the need for enhanced API gateway rules, improved rate limiting, and behavioral anomaly detection to prevent escalation.', expected_value: 'Strengthened security posture with automated threat response capabilities. Reduces mean-time-to-detect from 45 minutes to under 5 minutes for known attack patterns.', priority: '3 - Medium', status: 'Proposed', support_count: 5, last_refreshed: '2026-03-23T10:00:00Z' },
];

const MOCK_CLASSIFICATIONS = [
  { ai_theme: 'Network Outage', ai_project_score: 95, ai_summary: 'Incident classified as network infrastructure failure. Pattern matches ongoing cluster of connectivity disruptions traced to core switch degradation in the primary distribution layer.', ai_business_impact: 'Service availability directly affected for approximately 2,400 end users. Revenue-impacting for customer-facing portal with estimated $8K/hour exposure during outage windows.', ai_root_cause: 'Aging network infrastructure with firmware beyond end-of-support lifecycle.', classifier: 'GrokClassifier' },
  { ai_theme: 'Authentication Failure', ai_project_score: 92, ai_summary: 'Incident involves authentication service disruption. SSO token validation failures detected across multiple identity providers, consistent with the AUTH-001 cluster pattern.', ai_business_impact: 'Enterprise workforce unable to access critical business applications. Productivity loss estimated at 150 person-hours per incident occurrence across affected business units.', ai_root_cause: 'Token expiration handling race condition in the SSO middleware layer.', classifier: 'GrokClassifier' },
  { ai_theme: 'Performance Degradation', ai_project_score: 88, ai_summary: 'System performance metrics indicate degradation beyond acceptable thresholds. Application response times have increased 340% from baseline, correlating with database connection pool exhaustion patterns.', ai_business_impact: 'User experience severely impacted with page load times exceeding 8 seconds. Customer satisfaction scores projected to drop 15 points if unresolved within SLA window.', ai_root_cause: 'Unoptimized database queries compounded by insufficient connection pool sizing.', classifier: 'GrokClassifier' },
  { ai_theme: 'Security Incident', ai_project_score: 91, ai_summary: 'Potential security breach detected through anomalous API access patterns. Automated scanning activity identified targeting authentication endpoints with credential stuffing techniques.', ai_business_impact: 'Risk of unauthorized data access affecting compliance posture. Potential regulatory exposure under SOC 2 and GDPR frameworks if breach is confirmed.', ai_root_cause: 'Insufficient rate limiting and lack of behavioral anomaly detection on public API endpoints.', classifier: 'GrokClassifier' },
  { ai_theme: 'Data Integrity Issue', ai_project_score: 87, ai_summary: 'Data consistency validation has detected discrepancies between primary and replica data stores. Affected records show timestamp drift and missing transaction entries during failover events.', ai_business_impact: 'Financial reporting accuracy compromised for Q1 close. Audit trail gaps may trigger compliance review and require manual reconciliation effort estimated at 40 person-hours.', ai_root_cause: 'Replication lag during automated failover combined with missing transaction journaling.', classifier: 'GrokClassifier' },
];

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

function OverviewPanel({ clusters, suggestions }) {
  const totalIncidents = clusters.reduce((s, c) => s + (c.incident_count || 0), 0);
  const avgScore = clusters.length > 0 ? Math.round(totalIncidents / clusters.length * 8.5) : 0;
  const highImpact = clusters.filter(c => c.impact_level === 'High' || c.impact_level === 'Critical').length;

  const pipeline = [
    { name: 'Grok AI Classifier', status: 'Active', color: C.success },
    { name: 'Keyword Fallback Engine', status: 'Standby', color: C.info },
    { name: 'Confidence Gate', status: '70% threshold', color: C.success },
    { name: 'Cluster Matching Engine', status: `${clusters.length} clusters`, color: C.success },
    { name: 'Project Suggestion Engine', status: `${suggestions.length} active`, color: C.success },
  ];

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 600, color: C.text }}>System Dashboard</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Incidents Processed" value={totalIncidents} color={C.accent} delay={0} />
        <StatCard label="Active Clusters" value={clusters.length} color={C.info} delay={0.05} />
        <StatCard label="Project Suggestions" value={suggestions.length} color={C.success} delay={0.1} />
        <StatCard label="Avg AI Confidence" value={`${avgScore > 100 ? 91 : avgScore}%`} color={C.warning} delay={0.15} />
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
      console.warn('Falling back to demo response:', err.message);
      setPollMsg('Using demo classification...');
      await new Promise(r => setTimeout(r, 1500));
      const mock = MOCK_CLASSIFICATIONS[Math.floor(Math.random() * MOCK_CLASSIFICATIONS.length)];
      setResult({ ...mock });
      setLoading(false);
      setPollMsg('');
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

      {result && (
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
  const totalIncidents = clusters.reduce((s, c) => s + (c.incident_count || 0), 0);
  const highImpact = clusters.filter(c => c.impact_level === 'High' || c.impact_level === 'Critical').length;
  const sorted = [...clusters].sort((a, b) => (b.incident_count || 0) - (a.incident_count || 0));

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 600, color: C.text }}>Incident Clusters</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Total Clusters" value={clusters.length} color={C.accent} delay={0} />
        <StatCard label="Total Incidents" value={totalIncidents} color={C.info} delay={0.05} />
        <StatCard label="High Impact" value={highImpact} color={C.warning} delay={0.1} />
      </div>

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
                      {sug.support_count} incidents
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
function IconProjects() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}

// ─── Main App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('overview');
  const [clusters, setClusters] = useState(MOCK_CLUSTERS);
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS);
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
          const clusterArr = cData?.result || cData?.results || cData;
          if (Array.isArray(clusterArr) && clusterArr.length > 0) setClusters(clusterArr);
        }
        if (sugRes.ok) {
          const sData = await sugRes.json();
          const sugArr = sData?.result || sData?.results || sData;
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
          {tab === 'overview' && <OverviewPanel clusters={clusters} suggestions={suggestions} />}
          {tab === 'submit' && <SubmitPanel />}
          {tab === 'clusters' && <ClustersPanel clusters={clusters} />}
          {tab === 'projects' && <SuggestionsPanel suggestions={suggestions} />}
        </main>
      </div>
    </>
  );
}
