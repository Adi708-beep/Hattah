const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "replace-this-admin-jwt-secret";

const protectAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Admin token is missing.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Admin access required.",
      });
    }

    req.admin = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token.",
    });
  }
};

module.exports = {
  protectAdmin,
};
