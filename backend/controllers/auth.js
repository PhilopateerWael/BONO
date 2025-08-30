import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "dotenv";
import { OAuth2Client } from "google-auth-library";
import { keyForDate, decryptString } from "../Utils/All.js";

config()

const SECRET_KEY = process.env.SECRET;

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage',
);
// Final
export async function getMe(req, res) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0)
    yesterday.setDate(yesterday.getDate() - 1)

    if (req.user) {
        if (today.getTime() != req.user.lastCheck.getTime()) {
            let atLeastOneHabitDone = false;

            for (let habit of req.user.habits) {
                if (habit?.daysDone[keyForDate(today)]?.completed || habit?.daysDone[keyForDate(yesterday)]?.completed) {
                    atLeastOneHabitDone = true;
                }else{
                    habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
                    habit.currentStreak = 0;
                    await habit.save()
                }
            }

            if (!atLeastOneHabitDone) {
                req.user.longestStreak = Math.max(req.user.longestStreak, req.user.currentStreak);
                req.user.currentStreak = 0;
            }

            req.user.doneSomethingToday = false
            req.user.lastCheck = today;

            await req.user.save();
        }

        // Decrypt habit fields before sending
        const userObj = req.user.toObject();
        if (Array.isArray(userObj.habits)) {
            userObj.habits = userObj.habits.map(h => {
                if (!h) return h;
                const obj = typeof h.toObject === 'function' ? h.toObject() : h;
                if (obj && typeof obj === 'object') {
                    obj.name = decryptString(obj.name);
                    obj.description = decryptString(obj.description);
                    obj.unit = decryptString(obj.unit);
                }
                return obj;
            });
        }

        return res.status(200).json(userObj);
    }
    return res.status(401).json({ message: "Unauthorized" });
}

// Final

export async function Google(req, res) {
    const { code } = req.body;

    try {
        const { tokens } = await client.getToken(code);

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const { sub, email, picture } = payload;

        if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
            throw new Error('Invalid audience');
        }

        if (payload.exp < Date.now() / 1000) {
            throw new Error('Token expired');
        }

        let user = await User.findOne({ googleId: sub });

        if (user) {
            const newToken = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '90d' });

            res.cookie('token', newToken, {
                sameSite: "none",
                maxAge: 90 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
            });

            const userObj = user.toObject();
            if (Array.isArray(userObj.habits)) {
                userObj.habits = userObj.habits.map(h => {
                    if (!h) return h;
                    const obj = typeof h.toObject === 'function' ? h.toObject() : h;
                    if (obj && typeof obj === 'object') {
                        obj.name = decryptString(obj.name);
                        obj.description = decryptString(obj.description);
                        obj.unit = decryptString(obj.unit);
                    }
                    return obj;
                });
            }

            return res.json(userObj)
        }

        user = new User({
            googleId: sub,
            googleEmail: email,
            googleAvatar: picture,
        });
        await user.save();

        const newToken = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '90d' });

        res.cookie('token', newToken, {
            sameSite: "none",
            maxAge: 90 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
        });

        const newUserObj = user.toObject();
        // No habits on first login, but keep consistent structure
        return res.json(newUserObj);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

// Final

export async function Logout(req, res) {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    return res.status(200).json({ message: "Logout successful" });
}