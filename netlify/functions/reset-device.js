const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'process.env.SUPABASE_URL';
const SUPABASE_ANON_KEY = 'process.env.SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { key } = JSON.parse(event.body);

  if (!key) {
    return { statusCode: 400, body: JSON.stringify({ success: false }) };
  }

  try {
    const { data, error } = await supabase
      .from('license_keys')
      .update({ device_id: null, used_at: new Date().toISOString() })
      .eq('key', key)
      .eq('is_active', true);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Reset error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false })
    };
  }
};
