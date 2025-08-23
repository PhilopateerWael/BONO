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
        required: true,
    },
    habitType : {
        type : String,
        required : true,
        enum : ['time' , 'count' , 'check']
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
    oldestDay : {
        type: Date,
        required: true,
        default: () => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            return date;
        },
    }
});

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;