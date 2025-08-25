import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getMe, Google, Logout } from "../controllers/auth.js";

const SECRET_KEY = process.env.SECRET;
const router = express.Router();

router.get("/me", authenticationMiddleware, getMe);
router.post("/google", Google);
router.post("/logout", authenticationMiddleware, Logout);

export async function authenticationMiddleware(req, res, next) {
    try {
        const token = req?.cookies?.token;
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.userId).populate("habits");
        req.user = user;

        return next();
    } catch (err) {
        req.user = null;
        return next();
    }
}

export default router;