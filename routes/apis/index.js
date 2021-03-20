const express = require("express");
const router = express.Router();

router.use("/properties", require("./property"));

module.exports = router;
