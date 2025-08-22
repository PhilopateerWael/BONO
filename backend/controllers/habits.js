import Habit from "../models/Habit.js";
import Record from "../models/Record.js";

async function createHabit(req, res) {
    const { name, description, goal, unit, isTimeBased, isTickBased, isCountBased, weeklyGoal } = req.body;
    const habit = await Habit.create({ name, description, goal, unit, isTimeBased, isTickBased, isCountBased, weeklyGoal });
    req.user.habits.push(habit._id);
    await req.user.save();

    res.status(201).json(habit);
}

async function doHabit(req, res) {
    const { habitId, ammount } = req.body;
    const habit = req.user.habits.find(habit => habit._id.toString() === habitId);

    if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (habit.today.getTime() !== today.getTime()) {
        habit.today = today;
        habit.todayAmmount = 0;
    }

    if (habit.isCountBased || habit.isTimeBased) {
        const record = await Record.create({
            date: habit.today,
            ammount,
            habitId
        });

        req.user.records.push(record);
        habit.todayAmmount += ammount;

        if (habit.todayAmmount >= habit.goal && !habit.doneToday) {
            habit.currentStreak++;
            habit.longestStreak = Math.max(habit.currentStreak, habit.longestStreak);
            habit.daysDone.push(today);
        }

    } else if (habit.isTickBased) {
        const record = await Record.create({
            date: habit.today,
            ammount: 1,
            habitId
        });

        if (!habit.doneToday) {
            habit.currentStreak++;
            habit.longestStreak = Math.max(habit.currentStreak, habit.longestStreak);
            habit.doneToday = true;
        }
        
        req.user.records.push(record);
        habit.daysDone.push(today);
    } else {
        return res.status(400).json({ message: "Invalid habit type" });
    }

    habit.lastRecord = today;
    await habit.save();
    await req.user.save();

    res.status(200).json(habit);
}

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

    await habit.save();
}

export { createHabit, doHabit, editHabit };