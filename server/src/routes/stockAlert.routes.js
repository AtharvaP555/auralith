const express = require("express");
const router = express.Router();
const { subscribeToAlert } = require("../controllers/stockAlert.controller");
const { authenticate } = require("../middleware/auth");

router.post("/subscribe", authenticate, subscribeToAlert);

module.exports = router;
