export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { SN_INSTANCE, SN_USERNAME, SN_PASSWORD } = process.env;

  if (!SN_INSTANCE || !SN_USERNAME || !SN_PASSWORD) {
    return res.status(500).json({ error: 'ServiceNow credentials not configured' });
  }

  try {
    const { incidents } = req.body;

    if (!incidents || !Array.isArray(incidents) || incidents.length === 0) {
      return res.status(400).json({ error: 'incidents array is required and must not be empty' });
    }

    if (incidents.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 incidents per batch' });
    }

    const auth = Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64');

    const response = await fetch(
      `${SN_INSTANCE}/api/x_1809368_incide_0/incident_intelligence_api/bulk-submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ incidents })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'ServiceNow API error', details: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('bulk-submit error:', err);
    return res.status(500).json({ error: 'Failed to bulk submit incidents', message: err.message });
  }
}
