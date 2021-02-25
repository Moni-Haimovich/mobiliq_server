const express = require('express');
const router = express.Router();

const { propertyController } = require('../../controllers/property-controller');

router.get('/', propertyController.get);
router.get('/find', propertyController.find);
router.post('/', propertyController.create);

module.exports = router;
