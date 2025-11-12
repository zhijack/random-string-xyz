const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const validKeys = ['ZHIJACK-2025'];

app.post('/validate', (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.json({ success: false, message: 'Key required' });
  }
  if (validKeys.includes(key)) {
    res.json({ success: true, message: 'Key valid' });
  } else {
    res.json({ success: false, message: 'Invalid key' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
