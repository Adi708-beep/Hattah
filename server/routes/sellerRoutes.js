const express = require("express");
const { createSeller } = require("../controllers/sellerController");

const router = express.Router();

router.post("/", createSeller);

module.exports = router;
