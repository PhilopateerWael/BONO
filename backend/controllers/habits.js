import Habit from "../models/Habit.js";
import Record from "../models/Record.js";

async function createHabit(req, res) {
    try {
        let { name, description, goal, unit, habitType, weeklyGoal } = req.body;

        if (!goal) goal = 1
        if (!unit) unit = "X"

        const habit = await Habit.create({ name, description, goal, unit, habitType, weeklyGoal });
        req.user.habits.push(habit._id);

        await req.user.save();

        res.status(201).json(habit);
    } catch {
        res.status(500).end("SERVER ERROR")
    }
}

async function doHabit(req, res) {
    const { habitId, ammount } = req.body;
    if (!ammount) ammount = 1;

    const habit = req.user.habits.find(habit => habit._id.toString() === habitId);

    if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!habit.daysDone[today]) {
        habit.daysDone[today] = {
            ammount: 0,
            currentGoal: habit.goal,
            completed: false
        }
    }

    const todaysLog = habit.daysDone[today];

    const record = await Record.create({
        date: new Date(),
        ammount,
        habitId
    });

    todaysLog.ammount += ammount;

    if (todaysLog.ammount >= todaysLog.currentGoal && !todaysLog.completed) {
        todaysLog.completed = true;
        habit.currentStreak++;
        habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
        habit.totalCompletions++;

        if (!req.user.doneSomethingToday) {
            user.currentStreak++;
            user.doneSomethingToday = true;
        }
    }

    req.user.records.push(record);
    await habit.save();
    await req.user.save();

    res.status(200).json(habit);
}

// edits for the future and deletes correctly !
async function editHabit(req, res) {
    const { habitId } = req.params;
    const { name, description, goal, unit, weeklyGoal, isDelete } = req.body;
    const habit = req.user.habits.find(habit => habit._id.toString() === habitId);

    if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
    }

    if (isDelete) {
        await Habit.deleteOne({ _id: habitId });
        await Record.deleteMany({ habitId })
        return res.status(200).end();
    }

    habit.name = name;
    habit.description = description;
    habit.goal = goal;
    habit.unit = unit;
    habit.weeklyGoal = weeklyGoal;

    if (habit.daysDone[today]) {
        habit.daysDone[today].currentGoal = goal
    }

    await habit.save();
}

export { createHabit, doHabit, editHabit };