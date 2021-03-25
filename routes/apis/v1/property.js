const express = require("express");
const router = express.Router();

const { propertyController } = require("../../../controllers/property");

router.put("/remove-image", propertyController.removeImage);
router.delete("/:id", propertyController.delete);

module.exports = router;
