const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { key, device_id } = JSON.parse(event.body || '{}');
  if (!key || !device_id) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Key & device required' }) };
  }

  try {
    const { data: keyData, error: keyError } = await supabase
      .from('license_keys')
      .select('id, is_active, device_id')
      .eq('key', key.trim())
      .single();

    if (keyError || !keyData || !keyData.is_active) {
      return { statusCode: 401, body: JSON.stringify({ success: false, message: 'Invalid key' }) };
    }

    if (keyData.device_id) {
      if (keyData.device_id !== device_id) {
        return { statusCode: 403, body: JSON.stringify({ success: false, message: 'Key already used on another device' }) };
      }
    } else {
      await supabase
        .from('license_keys')
        .update({ device_id, used_at: new Date().toISOString() })
        .eq('key', key.trim());
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false }) };
  }
};
