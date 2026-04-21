const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Seller = require("../models/Seller");

const ADMIN_EMAIL = "sahaadi708@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@Hattah2026";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "replace-this-admin-jwt-secret";
const JWT_EXPIRES_IN = "12h";

const buildStatusSummary = (rows) => {
  const summary = {
    new: 0,
    processing: 0,
    fulfilled: 0,
    cancelled: 0,
  };

  rows.forEach((row) => {
    const key = row._id;

    if (Object.prototype.hasOwnProperty.call(summary, key)) {
      summary[key] = row.count;
    }
  });

  return summary;
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      {
        role: "admin",
        email: ADMIN_EMAIL,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        token,
        admin: {
          email: ADMIN_EMAIL,
          name: "HATTAH Admin",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to login as admin",
      error: error.message,
    });
  }
};

const getAdminOverview = async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalSellers, latestOrders, statusRows] =
      await Promise.all([
        Order.countDocuments(),
        Product.countDocuments(),
        Seller.countDocuments(),
        Order.find()
          .populate("productId", "name price sellerName category")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        Order.aggregate([
          {
            $group: {
              _id: {
                $ifNull: ["$orderStatus", "new"],
              },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    const orderAmounts = latestOrders.map((order) => {
      const price = order.productId && order.productId.price ? order.productId.price : 0;
      return price * order.quantity;
    });

    const pipelineRevenue = orderAmounts.reduce((sum, current) => sum + current, 0);

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalOrders,
          totalProducts,
          totalSellers,
          pipelineRevenue,
        },
        statusSummary: buildStatusSummary(statusRows),
        latestOrders,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin overview",
      error: error.message,
    });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "all").trim().toLowerCase();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const query = {};

    if (status && status !== "all") {
      if (status === "new") {
        query.$or = [{ orderStatus: "new" }, { orderStatus: { $exists: false } }];
      } else {
        query.orderStatus = status;
      }
    }

    if (search) {
      const searchClause = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchClause }];
        delete query.$or;
      } else {
        query.$or = searchClause;
      }
    }

    const [total, orders, statusRows] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .populate("productId", "name price sellerName category")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.aggregate([
        {
          $group: {
            _id: {
              $ifNull: ["$orderStatus", "new"],
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        pages,
        limit,
      },
      statusSummary: buildStatusSummary(statusRows),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, adminNotes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (typeof adminNotes === "string") {
      order.adminNotes = adminNotes.trim();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update order",
      error: error.message,
    });
  }
};

const getAdminSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 }).limit(20).lean();

    return res.status(200).json({
      success: true,
      data: sellers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller applications",
      error: error.message,
    });
  }
};

module.exports = {
  adminLogin,
  getAdminOverview,
  getAdminOrders,
  updateOrderStatus,
  getAdminSellers,
};
