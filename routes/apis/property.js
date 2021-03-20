const express = require('express');
const router = express.Router();

const { propertyController } = require('../../controllers/property');

router.get('/', propertyController.get);
router.get('/find', propertyController.find);
router.post('/', propertyController.create);
router.put('/add-images', propertyController.addImages);
router.put('/remove-image', propertyController.removeImage);
router.delete('/:id', propertyController.delete);

module.exports = router;
