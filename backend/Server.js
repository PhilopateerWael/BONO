import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import habitsRouter from './routes/habits.js';
import cookieParser from 'cookie-parser';
import { createServer } from 'node:http';
dotenv.config();

const app = express();

const server = createServer(app);

app.use(cors({
    credentials: true,
    origin: ["http://localhost:5173", process.env.FRONTEND]
}));


app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRouter);
app.use('/api/habits', habitsRouter);

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        server.listen(PORT, () => {
            console.log(`server listening`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
    });