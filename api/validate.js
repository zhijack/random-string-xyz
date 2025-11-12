const validKeys = ['ZHIJACK-2025']; // Nanti ganti DB

export default function handler(req, res) {

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ success: false, message: 'Key required' });
  }

  if (validKeys.includes(key)) {
    return res.status(200).json({ success: true, message: 'Key valid' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid key' });
  }
}
