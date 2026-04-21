const express = require("express");
const {
  adminLogin,
  getAdminOverview,
  getAdminOrders,
  updateOrderStatus,
  getAdminSellers,
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/adminAuth");

const router = express.Router();

router.post("/login", adminLogin);

router.use(protectAdmin);

router.get("/overview", getAdminOverview);
router.get("/orders", getAdminOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/sellers", getAdminSellers);

module.exports = router;
