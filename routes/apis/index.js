const express = require("express");
const router = express.Router();

router.use("/", require("./v0/index"));
router.use("/v1", require("./v1/index"));

module.exports = router;
