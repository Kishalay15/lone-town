import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const rawHeader = req.headers.authorization;
  console.log("Authorization header:", rawHeader);

  const token = rawHeader?.split(" ")[1];
  console.log("Extracted token:", token);

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded successfully:", decoded);

    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(403).json({ message: "Invalid token" });
  }
};
