import jwt from "jsonwebtoken";
import { User } from "../models/users.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const authMiddleware = {
  // Verify JWT token and attach user to request
  verifyToken: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const token = authHeader.split(" ")[1];
      if (!token) {
        console.log("No token provided in the request");
        return res.status(401).json({ message: "Authentication required" });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (!user.is_active)
        return res.status(401).json({ message: "Account is deactivated" });
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError")
        return res.status(401).json({ message: "Invalid token" });
      if (error.name === "TokenExpiredError")
        return res.status(401).json({ message: "Token expired" });
      console.error("Auth middleware error:", error);
      res.status(500).json({ message: "Server error during authentication" });
    }
  },
};

export default authMiddleware;
