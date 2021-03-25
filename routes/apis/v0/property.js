const express = require("express");
const router = express.Router();

const { propertyController } = require("../../../controllers/property");

router.get("/", propertyController.get);
router.get("/find-by-name", propertyController.findByName);
router.post("/", propertyController.create);
router.put("/add-images", propertyController.addImages);

module.exports = router;
