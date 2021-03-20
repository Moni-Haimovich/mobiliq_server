const express = require("express");
const router = express.Router();

router.use("/", require("./apis/index"));

module.exports = router;
