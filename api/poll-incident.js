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

  const { SN_INSTANCE, SN_USERNAME, SN_PASSWORD } = process.env;

  if (!SN_INSTANCE || !SN_USERNAME || !SN_PASSWORD) {
    return res.status(500).json({ error: 'ServiceNow credentials not configured' });
  }

  const { sys_id } = req.query;

  if (!sys_id) {
    return res.status(400).json({ error: 'sys_id query parameter is required' });
  }

  try {
    const auth = Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64');
    const fields = 'ai_theme,ai_summary,ai_business_impact,ai_root_cause,ai_project_score,status';

    const response = await fetch(
      `${SN_INSTANCE}/api/now/table/x_1809368_incide_0_smart_incident?sysparm_query=sys_id=${sys_id}&sysparm_fields=${fields}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'ServiceNow API error', details: data });
    }

    const record = data.result && data.result[0] ? data.result[0] : null;
    return res.status(200).json({ result: record });
  } catch (err) {
    console.error('poll-incident error:', err);
    return res.status(500).json({ error: 'Failed to poll incident', message: err.message });
  }
}
