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

    const fields = [
      'sys_id', 'number', 'short_description', 'description', 'state', 'priority',
      'u_type', 'u_categorization', 'u_business_case', 'u_value', 'u_category',
      'u_source_cluster', 'u_source_suggestion', 'u_incident_count', 'u_ai_confidence',
      'sys_created_on', 'sys_updated_on', 'assignment_group'
    ].join(',');

    const url = `${SN_INSTANCE}/api/now/table/x_1809368_incide_0_demand?sysparm_fields=${fields}&sysparm_display_value=true&sysparm_limit=50&sysparm_order_by=priority`;

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
    console.error('demands error:', err);

    // Fallback mock data when ServiceNow is unreachable (e.g. PDI hibernated)
    return res.status(200).json({
      result: [
        {
          sys_id: 'mock-001', number: 'TASK0020870', short_description: 'Network Outage — Remediation Initiative',
          state: 'Draft', priority: '1 - Critical', u_type: 'project', u_categorization: 'strategic',
          u_category: 'Infrastructure', u_incident_count: '20', u_ai_confidence: '70',
          u_business_case: 'The cluster Network Outage has accumulated 20 incidents with High impact. Pattern analysis suggests a systemic infrastructure issue requiring a dedicated remediation project.',
          u_value: 'Based on 20 incidents at High impact: 20 × 3.0h × $95/h = $5,700.00 estimated cost avoidance per quarter.',
          u_source_cluster: 'Network Outage', u_source_suggestion: 'Network Outage — Remediation Initiative',
          sys_created_on: '2026-03-30 05:45:23', sys_updated_on: '2026-03-30 05:45:23', assignment_group: ''
        },
        {
          sys_id: 'mock-002', number: 'TASK0020872', short_description: 'Application Error — Remediation Initiative',
          state: 'Draft', priority: '2 - High', u_type: 'project', u_categorization: 'operational',
          u_category: 'Application', u_incident_count: '27', u_ai_confidence: '70',
          u_business_case: 'The cluster Application Error has accumulated 27 incidents. Recurring application failures indicate a need for systematic code review and stability improvements.',
          u_value: 'Based on 27 incidents at High impact: 27 × 3.0h × $95/h = $7,695.00 estimated cost avoidance per quarter.',
          u_source_cluster: 'Application Error', u_source_suggestion: 'Application Error — Remediation Initiative',
          sys_created_on: '2026-03-30 05:45:23', sys_updated_on: '2026-03-30 05:45:23', assignment_group: ''
        },
        {
          sys_id: 'mock-003', number: 'TASK0020873', short_description: 'Security Incident — Remediation Initiative',
          state: 'Submitted', priority: '2 - High', u_type: 'project', u_categorization: 'strategic',
          u_category: 'Security', u_incident_count: '16', u_ai_confidence: '70',
          u_business_case: 'The cluster Security Incident has accumulated 16 incidents. Security vulnerabilities require immediate attention to prevent potential breaches.',
          u_value: 'Based on 16 incidents at Critical impact: 16 × 4.0h × $120/h = $7,680.00 estimated cost avoidance per quarter.',
          u_source_cluster: 'Security Incident', u_source_suggestion: 'Security Incident — Remediation Initiative',
          sys_created_on: '2026-03-30 05:46:01', sys_updated_on: '2026-03-30 05:46:01', assignment_group: ''
        },
        {
          sys_id: 'mock-004', number: 'TASK0020875', short_description: 'Performance Degradation — Remediation Initiative',
          state: 'Draft', priority: '1 - Critical', u_type: 'enhancement', u_categorization: 'operational',
          u_category: 'Infrastructure', u_incident_count: '36', u_ai_confidence: '70',
          u_business_case: 'The cluster Performance Degradation has accumulated 36 incidents. Systemic performance issues are impacting user productivity and require infrastructure upgrades.',
          u_value: 'Based on 36 incidents at High impact: 36 × 3.0h × $95/h = $10,260.00 estimated cost avoidance per quarter.',
          u_source_cluster: 'Performance Degradation', u_source_suggestion: 'Performance Degradation — Remediation Initiative',
          sys_created_on: '2026-03-30 05:46:30', sys_updated_on: '2026-03-30 05:46:30', assignment_group: ''
        }
      ],
      _mock: true
    });
  }
}
