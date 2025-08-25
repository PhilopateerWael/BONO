import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false,
        default: ""
    },
    goal: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true,
    },
    habitType: {
        type: String,
        required: true,
        enum: ['time', 'count', 'check']
    },
    weeklyGoal: {
        type: Number,
        required: true,
        default: 0
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
    totalCompletions: {
        type: Number,
        default: 0
    },
    daysDone: {
        type: Object,
        default: {}
    },
    totalAmmount: {
        type: Number,
        default: 0
    },
    hours: {
        type: [Number],
        default: () => Array(24).fill(0)
    }
});

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;