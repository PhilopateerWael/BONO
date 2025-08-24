import { useState } from 'react'
import { Plus, Tally5, Timer, Check } from 'lucide-react'
import CreateHabitForm from './CreateHabitForm'
import { useUserContext } from '../context/authContext';

const Habits = () => {
    const [form, setForm] = useState(false);
    const [state, dispatch] = useUserContext()

    const Habit = ({ habit }) => {
        const { name, description, habitType, goal, weeklyGoal, totalCompletions } = habit;

        // For progress-based habits
        const progress = habitType !== "check" ? Math.min((totalCompletions / goal) * 100, 100) : 0;

        return (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 mb-3 flex flex-col gap-3 hover:bg-gray-700/60 transition">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-white text-lg">{name}</h2>
                        {description && (
                            <p className="text-sm text-gray-400">{description}</p>
                        )}
                    </div>

                    {/* Icon based on type */}
                    <span className="bg-blue-600/20 p-2 rounded-xl text-blue-400">
                        {habitType === "time" && <Timer size={18} />}
                        {habitType === "count" && <Tally5 size={18} />}
                        {habitType === "check" && <Check size={18} />}
                    </span>
                </div>

                {/* Body depending on type */}
                {habitType === "check" && (
                    <button
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 text-gray-300 hover:bg-blue-600 hover:text-white transition"
                    >
                        Mark as done
                    </button>
                )}

                {(habitType === "time" || habitType === "count") && (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>{habitType === "time" ? "Minutes" : "Count"}: {totalCompletions}/{goal}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-700 rounded-xl overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Weekly Goal Info */}
                <div className="text-xs text-gray-400">
                    Weekly goal: {weeklyGoal} days
                </div>
            </div>
        )
    }

    const habits = Object.entries(state.user.habits).map(x => x[1])

    return (
        <div className='bg-gray-900'>
            <div className='flex justify-between p-4'>
                <h1 className='text-3xl font-black'>Habits</h1>
                <button onClick={() => setForm(true)}
                    className='text-gray-300 cursor-pointer bg-blue-500 hover:text-white flex items-center justify-center gap-3 p-3 rounded-2xl transition-all duration-300 max-sm:p-2'> <Plus /> Add habit</button>
            </div>
            {form && <CreateHabitForm setForm={setForm} />}
            <div className='flex flex-col gap-4 p-4'>
                {habits.map((x, i) => <Habit key={i} habit={x} />)}
            </div>
        </div>
    )
}

export default Habits