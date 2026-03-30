export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SN_INSTANCE = (process.env.SN_INSTANCE || '').trim();
  const SN_USERNAME = (process.env.SN_USERNAME || '').trim();
  const SN_PASSWORD = (process.env.SN_PASSWORD || '').trim();

  if (!SN_INSTANCE || !SN_USERNAME || !SN_PASSWORD) {
    return res.status(500).json({ error: 'ServiceNow credentials not configured' });
  }

  try {
    const auth = Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64');

    const url = `${SN_INSTANCE}/api/x_1809368_incide_0/incident_intelligence/analytics`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'ServiceNow API error', details: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('analytics error:', err);

    // Fallback mock data when ServiceNow is unreachable (e.g. PDI hibernated)
    return res.status(200).json({
      result: {
        summary: {
          total_incidents: 55,
          total_clusters: 8,
          total_suggestions: 6,
          total_demands: 6,
          avg_confidence: 70
        },
        incidents_by_category: [
          { theme: "Performance Degradation", count: 8 },
          { theme: "Authentication Failure", count: 8 },
          { theme: "Network Outage", count: 6 },
          { theme: "Application Error", count: 6 },
          { theme: "Data Integrity Issue", count: 6 },
          { theme: "Infrastructure Capacity", count: 5 },
          { theme: "Provisioning Request", count: 4 },
          { theme: "Security Incident", count: 4 }
        ],
        cluster_impact: [
          { theme: "Performance Degradation", incident_count: 8, impact_level: "Medium", recommendation_status: "Recommended" },
          { theme: "Authentication Failure", incident_count: 8, impact_level: "Medium", recommendation_status: "Recommended" },
          { theme: "Network Outage", incident_count: 6, impact_level: "Medium", recommendation_status: "Recommended" },
          { theme: "Application Error", incident_count: 6, impact_level: "Medium", recommendation_status: "Recommended" },
          { theme: "Data Integrity Issue", incident_count: 6, impact_level: "Medium", recommendation_status: "Recommended" },
          { theme: "Infrastructure Capacity", incident_count: 5, impact_level: "Medium", recommendation_status: "Recommended" },
          { theme: "Provisioning Request", incident_count: 4, impact_level: "Low", recommendation_status: "Monitoring" },
          { theme: "Security Incident", incident_count: 4, impact_level: "Low", recommendation_status: "Monitoring" }
        ],
        confidence_distribution: { high: 15, medium: 32, low: 8 },
        demand_roi: [
          { name: "Performance Degradation — Remediation Initiative", incident_count: 36, priority: "1 - Critical", category: "Infrastructure", estimated_roi: 17280, state: "Draft" },
          { name: "Application Error — Remediation Initiative", incident_count: 27, priority: "2 - High", category: "Application", estimated_roi: 7695, state: "Draft" },
          { name: "Network Outage — Remediation Initiative", incident_count: 20, priority: "2 - High", category: "Infrastructure", estimated_roi: 5700, state: "Draft" },
          { name: "Authentication Failure — Remediation Initiative", incident_count: 17, priority: "2 - High", category: "Security", estimated_roi: 4845, state: "Draft" },
          { name: "Security Incident — Remediation Initiative", incident_count: 16, priority: "2 - High", category: "Security", estimated_roi: 4560, state: "Draft" },
          { name: "Data Integrity Issue — Remediation Initiative", incident_count: 6, priority: "3 - Medium", category: "Data Management", estimated_roi: 900, state: "Draft" }
        ],
        pipeline_funnel: { incidents: 55, clusters: 8, suggestions: 6, demands: 6 }
      },
      _mock: true
    });
  }
}
