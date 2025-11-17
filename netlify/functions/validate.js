const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const RATE_LIMIT = new Map();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const ip = event.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const limit = RATE_LIMIT.get(ip) || { count: 0, reset: now + 60000 };

  if (now > limit.reset) {
    limit.count = 0;
    limit.reset = now + 60000;
  }
  if (limit.count >= 10) {
    return { statusCode: 429, body: JSON.stringify({ success: false, message: 'Too many requests' }) };
  }
  limit.count++;
  RATE_LIMIT.set(ip, limit);

  const { key, device_id } = JSON.parse(event.body || '{}');
  if (!key || !device_id) {
    return { statusCode: 400, body: JSON.stringify({ success: false }) };
  }

  try {
    const { data: keyData, error } = await supabase
      .from('license_keys')
      .select('*')
      .eq('key', key.trim())
      .eq('is_active', true)
      .single();

    if (error || !keyData) {
      return { statusCode: 403, body: JSON.stringify({ success: false }) };
    }

    if (keyData.device_id && keyData.device_id !== device_id) {
      return { statusCode: 403, body: JSON.stringify({ success: false, message: 'Key sudah dipakai di perangkat lain.' }) };
    }

    if (!keyData.device_id) {
      await supabase
        .from('license_keys')
        .update({ device_id, used_at: new Date().toISOString() })
        .eq('key', key.trim());
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Validate error:', err);
    return { statusCode: 500, body: JSON.stringify({ success: false }) };
  }
};
