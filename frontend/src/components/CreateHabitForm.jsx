import { X } from "lucide-react"
import { useState } from "react"
import { useUserContext } from "../context/authContext"
import axios from 'axios'

const CreateHabitForm = ({ setForm }) => {
    const [type, setType] = useState("check")
    const [state, dispatch] = useUserContext()

    async function handleSubmit(e) {
        e.preventDefault()
        const FD = new FormData(e.target)
        const name = FD.get('name')
        const description = FD.get('description')
        const goal = FD.get('dailyGoal')
        const weeklyGoal = FD.get('weeklyGoal')
        const unit = FD.get('unit')

        const data = { name, description, goal, weeklyGoal, unit, habitType: type }

        try {
            const response = await axios.post(import.meta.env.VITE_BACKEND_URL + "/habits/create", data)
            dispatch({ type: "SET_HABIT", payload: response.data })
            setForm(false)
        } catch {
            alert("ERROR FROM SERVER :D")
        }
    }

    return (
        <div className="bg-black/60 fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm p-4">
            <div className="bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl border border-gray-700 flex flex-col max-h-[90vh] overflow-y-auto">

                <div className="p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                    <h1 className="text-lg sm:text-xl font-semibold text-white">Create Habit</h1>
                    <button
                        onClick={() => setForm(false)}
                        className="cursor-pointer bg-gray-800 hover:bg-gray-700 rounded-full p-2 text-gray-300 hover:text-white transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 w-full p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm text-gray-300">Habit :</label>
                        <input
                            required
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter habit name"
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm text-gray-300">Habit Description :</label>
                        <input
                            type="text"
                            name="description"
                            id="description"
                            placeholder="Enter habit description (Optional)"
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="type" className="text-sm text-gray-300">Habit Type :</label>
                        <select
                            name="type"
                            id="type"
                            onChange={(e) => setType(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        >
                            <option value="check">Check and go (ex : shower)</option>
                            <option value="count">Count based (ex : read X pages)</option>
                            <option value="time">Time based (ex : study X minutes)</option>
                        </select>
                    </div>

                    {type !== "check" && (
                        <div className="flex flex-col gap-2">
                            <label htmlFor="dailyGoal" className="text-sm text-gray-300">Daily Goal :</label>
                            <input
                                min={1}
                                required
                                type="number"
                                name="dailyGoal"
                                id="dailyGoal"
                                placeholder={`I want to do this ${type === "time" ? "for X minutes" : "X (units)"} daily`}
                                className="bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                            />
                        </div>
                    )}

                    {type == "count" && (
                        <div className="flex flex-col gap-2">
                            <label htmlFor="unit" className="text-sm text-gray-300">Unit :</label>
                            <input
                                required
                                type="text"
                                name="unit"
                                id="unit"
                                placeholder="ex : Pages , miles , etc..."
                                className="bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label htmlFor="weeklyGoal" className="text-sm text-gray-300">Weekly Goal :</label>
                        <input
                            min={1}
                            max={7}
                            type="number"
                            name="weeklyGoal"
                            required
                            id="weeklyGoal"
                            placeholder="I want to complete this habit X days a week"
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        className="cursor-pointer mt-2 sm:mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition text-sm sm:text-base"
                    >
                        Create Habit
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateHabitForm
