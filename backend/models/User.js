import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: false,
        unique: true
    },
    googleEmail: {
        type: String,
        required: false,
        sparse: true
    },
    googleAvatar: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true,
        default: "Cool Bono User"
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
    habits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Habit"
    }],
    doneSomethingToday: {
        type: Boolean,
        required: true,
        default: false
    },
    lastCheck: {
        type: Date,
        required: true,
        default: () => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            return date;
        },
    },
});

const User = mongoose.model('User', userSchema);

export default User;