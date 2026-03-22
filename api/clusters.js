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

  try {
    const auth = Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64');

    const response = await fetch(
      `${SN_INSTANCE}/api/x_1809368_incide_0/incident_intelligence_api/clusters`,
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

    return res.status(200).json(data);
  } catch (err) {
    console.error('clusters error:', err);
    return res.status(500).json({ error: 'Failed to fetch clusters', message: err.message });
  }
}
