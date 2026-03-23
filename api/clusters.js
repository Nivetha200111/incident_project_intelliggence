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

  console.log('ENV CHECK:', {
    hasInstance: !!SN_INSTANCE,
    hasUsername: !!SN_USERNAME,
    hasPassword: !!SN_PASSWORD,
    instance: SN_INSTANCE,
    username: SN_USERNAME,
    passwordLength: SN_PASSWORD.length
  });

  if (!SN_INSTANCE || !SN_USERNAME || !SN_PASSWORD) {
    return res.status(500).json({ error: 'ServiceNow credentials not configured' });
  }

  try {
    const credentials = `${SN_USERNAME}:${SN_PASSWORD}`;
    const auth = Buffer.from(credentials).toString('base64');
    const url = `${SN_INSTANCE}/api/x_1809368_incide_0/incident_intelligence_api/clusters`;

    console.log('Request URL:', url);
    console.log('Auth header prefix:', `Basic ${auth.substring(0, 10)}...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    console.log('ServiceNow response status:', response.status);

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
