const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    try {
        const authHeader = req.headers.authorization;

        // 1️⃣ Check if header exists
        if (!authHeader) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        // 2️⃣ Check format: Bearer TOKEN
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid token format."
            });
        }

        // 3️⃣ Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token missing."
            });
        }

        // 4️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5️⃣ Attach user to request
        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        next();

    } catch (error) {

        console.log("Auth Middleware Error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired. Please log in again."
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid token."
            });
        }

        return res.status(500).json({
            message: "Authentication failed."
        });
    }
};

module.exports = authMiddleware;