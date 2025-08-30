import Habit from "../models/Habit.js";
import { isValidObjectId } from "mongoose";
import { keyForDate, iHateYou, validateString, validateNumber, validateHabitType, encryptString, decryptString } from "../Utils/All.js";

// Final (i hope)
async function createHabit(req, res) {
    try {
        let { name, description, goal, unit, habitType, weeklyGoal } = req.body;

        name = validateString(name);
        description = validateString(description)
        goal = validateNumber(goal)
        unit = validateString(unit)
        habitType = validateHabitType(habitType)
        weeklyGoal = validateNumber(weeklyGoal)

        if (!goal) goal = 1;
        if (!unit) unit = "X";

        const habit = await Habit.create({ name: encryptString(name), description: encryptString(description), goal: habitType == "check" ? 1 : goal, unit : habitType == "check" ? encryptString("X") : encryptString(unit), habitType, weeklyGoal });
        req.user.habits.push(habit._id);

        await req.user.save();

        // decrypt for response
        const obj = habit.toObject()
        obj.name = decryptString(obj.name)
        obj.description = decryptString(obj.description)
        obj.unit = decryptString(obj.unit)

        res.status(201).json(obj);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

async function doHabit(req, res) {
    try {
        let { habitId, ammount, hour } = req.body;

        if (!isValidObjectId(habitId)) return iHateYou(res);

        hour = validateNumber(hour)
        ammount = validateNumber(ammount)

        if (hour > 23 || hour < 0) hour = 0
        if (ammount <= 0) ammount = 1

        const habit = req.user.habits.find(habit => habit._id.toString() === habitId);

        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!habit.daysDone[keyForDate(today)]) {
            habit.daysDone[keyForDate(today)] = {
                ammount: 0,
                currentGoal: habit.goal,
                completed: false
            }
        }

        const todaysLog = habit.daysDone[keyForDate(today)];

        todaysLog.ammount += ammount;
        habit.totalAmmount += ammount;
        habit.hours[hour] += ammount;

        if (todaysLog.ammount >= todaysLog.currentGoal && !todaysLog.completed) {
            todaysLog.completed = true;
            habit.currentStreak++;
            habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
            habit.totalCompletions++;

            if (!req.user.doneSomethingToday) {
                req.user.currentStreak++;
                req.user.longestStreak = Math.max(req.user.longestStreak , req.user.currentStreak);
                req.user.doneSomethingToday = true;
            }
        }

        habit.daysDone[keyForDate(today)] = todaysLog;

        // objects dont save automatically becuase nested mutations ... idk ... dont fire events ? for some reason.
        habit.markModified("daysDone");
        habit.markModified("hours");

        await habit.save();
        await req.user.save();

        // decrypt for response
        const obj = habit.toObject()
        obj.name = decryptString(obj.name)
        obj.description = decryptString(obj.description)
        obj.unit = decryptString(obj.unit)

        res.status(200).json(obj);
    } catch (error) {
        console.error('Error in doHabit:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// edits for the future and deletes correctly ! (Final)
async function editHabit(req, res) {
    try {
        const { habitId } = req.params;
        if (!isValidObjectId(habitId)) return iHateYou(res);

        let { name, description, goal, unit, weeklyGoal, isDelete } = req.body;

        name = validateString(name);
        description = validateString(description)
        goal = validateNumber(goal)
        unit = validateString(unit)
        weeklyGoal = validateNumber(weeklyGoal)

        const habit = req.user.habits.find(habit => habit._id.toString() === habitId);

        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        if (isDelete) {
            await Habit.deleteOne({ _id: habitId });

            req.user.habits = req.user.habits.filter(id => id.toString() !== habitId);
            await req.user.save();

            return res.status(200).json({ message: "Habit deleted successfully" });
        }

        habit.name = encryptString(name);
        habit.description = encryptString(description);
        habit.goal = goal;
        habit.unit = encryptString(unit);
        habit.weeklyGoal = weeklyGoal;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (habit.daysDone[keyForDate(today)]?.currentGoal) {
            habit.daysDone[keyForDate(today)].currentGoal = goal;
        }

        await habit.save();

        const obj = habit.toObject()
        obj.name = decryptString(obj.name)
        obj.description = decryptString(obj.description)
        obj.unit = decryptString(obj.unit)

        res.status(200).json({ habit: obj, message: "Habit updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export { createHabit, doHabit, editHabit };