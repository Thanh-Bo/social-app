import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
	try {
		// You need a valid boarding pass (JWT) to enter the gate.
		const token = req.cookies.jwt;
		
		if (!token) {
			return res.status(401).json({ error: "Unauthorized: No Token Provided" });
		}
		// Verify the Boarding Pass (Token Verification)
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		
		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized: Invalid Token" });
		}
		// Scan Your ID to Confirm You Are the Person on the Boarding Pass 
		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		// Allow Entry to the Gate
		req.user = user;
		next();
	} catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Unauthorized: Token Expired" });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};