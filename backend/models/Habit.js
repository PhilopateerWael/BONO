import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        default: ""
    },
    daysDone: {
        type: [Date],
        required: true,
        default: []
    },
    currentStreak: {
        type: Number,
        required: true,
        default: 0
    },
    goal: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    isTimeBased: {
        type: Boolean,
        required: true,
        default: false
    },
    isTickBased: {
        type: Boolean,
        required: true,
        default: false
    },
    isCountBased: {
        type: Boolean,
        required: true,
        default: false
    },
    weeklyGoal: {
        type: Number,
        required: true,
        default: 0
    },
    today: {
        type: Date,
        required: true,
        default: () => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            return date;
        },
    },
    todayAmmount: {
        type: Number,
        required: true,
        default: 0
    },
    doneToday: {
        type: Boolean,
        required: true,
        default: false
    },
    currentStreak: {
        type: Number,
        required: true,
        default: 0
    },
    longestStreak: {
        type: Number,
        required: true,
        default: 0
    },
});

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;