import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createHabit, doHabit, editHabit } from "../controllers/habits.js";

const SECRET_KEY = process.env.SECRET;
const router = express.Router();

router.post("/create", authenticationMiddleware, createHabit);
router.post("/do", authenticationMiddleware, doHabit);
router.post("/edit/:habitId", authenticationMiddleware, editHabit);

export async function authenticationMiddleware(req, res, next) {
    try {
        const token = req?.cookies?.token;
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.userId).populate("habits");

        if (!user) return res.status(401).json({ message: "Unauthorized" });

        req.user = user;

        return next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}


export default router;