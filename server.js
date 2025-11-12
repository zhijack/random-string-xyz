const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Key dummy (ganti dengan milikmu, atau pindah ke DB)
const validKeys = ['ZHIJACK-2025', 'TEST-KEY-123'];

app.post('/validate', (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.json({ success: false, message: 'Key required' });
  }
  if (validKeys.includes(key)) {
    // Sukses → bisa tambah log user IP dll
    res.json({ success: true, message: 'Key valid' });
  } else {
    res.json({ success: false, message: 'Invalid key' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
