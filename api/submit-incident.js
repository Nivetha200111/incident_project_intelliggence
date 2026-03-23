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

  const SN_INSTANCE = (process.env.SN_INSTANCE || '').trim();
  const SN_USERNAME = (process.env.SN_USERNAME || '').trim();
  const SN_PASSWORD = (process.env.SN_PASSWORD || '').trim();

  if (!SN_INSTANCE || !SN_USERNAME || !SN_PASSWORD) {
    return res.status(500).json({ error: 'ServiceNow credentials not configured' });
  }

  try {
    const { short_description, detailed_description } = req.body;

    if (!short_description) {
      return res.status(400).json({ error: 'short_description is required' });
    }

    const auth = Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64');

    const response = await fetch(
      `${SN_INSTANCE}/api/x_1809368_incide_0/incident_intelligence_api/submit-incident`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ short_description, detailed_description })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'ServiceNow API error', details: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('submit-incident error:', err);
    return res.status(500).json({ error: 'Failed to submit incident', message: err.message });
  }
}
