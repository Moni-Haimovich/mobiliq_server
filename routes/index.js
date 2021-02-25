const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  return res.json({ message: 'success' });
});

router.use('/api', require('./apis/index'));

module.exports = router;
