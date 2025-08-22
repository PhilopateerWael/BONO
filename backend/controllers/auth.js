import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "dotenv";
import { OAuth2Client } from "google-auth-library";

config()

const SECRET_KEY = process.env.SECRET;

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage',
);

export async function getMe(req, res) {
    if (req.user) {
        let atLeastOneHabitDone = false;
        for (let habit of req.user.habits) {
            if (habit.doneToday && habit.today.getTime() - today.getTime() <= 24 * 60 * 60 * 1000) {
                atLeastOneHabitDone = true;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let notToday = today.getTime() != habit.today.getTime();
            
            if (notToday && !habit.doneToday) {
                habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
                habit.currentStreak = 0;
            }

            if (notToday) {
                habit.doneToday = false;
                habit.todayAmmount = 0;
                habit.today = today;
                await habit.save();
            }

        }

        if (!atLeastOneHabitDone) {
            req.user.longestStreak = Math.max(req.user.longestStreak, req.user.currentStreak);
            req.user.currentStreak = 0;
            req.user.doneSomethingToday = false;
        }

        if (atLeastOneHabitDone && !req.user.doneSomethingToday) {
            req.user.doneSomethingToday = true;
            req.user.currentStreak++;
            req.user.longestStreak = Math.max(req.user.longestStreak, req.user.currentStreak);
        }

        await req.user.save();
        return res.status(200).json(req.user);
    }
    return res.status(401).json({ message: "Unauthorized" });
}

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

            return res.json(user)
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

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

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

