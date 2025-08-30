import { X, Trash2 } from "lucide-react"
import { useState } from "react"
import { useUserContext } from "../context/authContext"
import axios from 'axios'

const EditHabitForm = ({ habit, onClose, onUpdated }) => {
    const [state] = useUserContext()
    const [formValues, setFormValues] = useState({
        name: habit.name || "",
        description: habit.description || "",
        goal: habit.habitType === 'check' ? 1 : (habit.goal || 1),
        weeklyGoal: habit.weeklyGoal || 1,
        unit: habit.habitType === 'count' ? (habit.unit || '') : ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormValues(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                name: formValues.name,
                description: formValues.description,
                goal: habit.habitType === 'check' ? 1 : Number(formValues.goal),
                unit: habit.habitType === 'count' ? formValues.unit : 'X',
                weeklyGoal: Number(formValues.weeklyGoal),
            }
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/habits/edit/${habit._id}`, payload)
            if (res.data?.habit) {
                onUpdated(res.data.habit)
            } else {
                onUpdated(null)
            }
            onClose()
        } catch (err) {
            alert('Failed to update habit')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Delete this habit? This cannot be undone.')) return
        setLoading(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/habits/edit/${habit._id}`, { isDelete: true })
            onUpdated(null)
            onClose()
        } catch (err) {
            alert('Failed to delete habit')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl border border-gray-700 flex flex-col max-h-[90vh] overflow-y-auto">
                <div className="p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                    <h1 className="text-lg sm:text-xl font-semibold text-white">Edit Habit</h1>
                    <button onClick={onClose} className="cursor-pointer bg-gray-800 hover:bg-gray-700 rounded-full p-2 text-gray-300 hover:text-white transition">
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
                            value={formValues.name}
                            onChange={handleChange}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm text-gray-300">Habit Description :</label>
                        <input
                            type="text"
                            name="description"
                            id="description"
                            value={formValues.description}
                            onChange={handleChange}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        />
                    </div>

                    {habit.habitType !== 'check' && (
                        <div className="flex flex-col gap-2">
                            <label htmlFor="goal" className="text-sm text-gray-300">Daily Goal :</label>
                            <input
                                min={1}
                                required
                                type="number"
                                name="goal"
                                id="goal"
                                value={formValues.goal}
                                onChange={handleChange}
                                className="bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                            />
                        </div>
                    )}

                    {habit.habitType === 'count' && (
                        <div className="flex flex-col gap-2">
                            <label htmlFor="unit" className="text-sm text-gray-300">Unit :</label>
                            <input
                                required
                                type="text"
                                name="unit"
                                id="unit"
                                value={formValues.unit}
                                onChange={handleChange}
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
                            id="weeklyGoal"
                            value={formValues.weeklyGoal}
                            onChange={handleChange}
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        />
                    </div>

                    <div className="flex items-center justify-between mt-2 sm:mt-4">
                        <button type="button" onClick={handleDelete} disabled={loading} className="cursor-pointer inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition text-sm">
                            <Trash2 size={16} /> Delete
                        </button>
                        <button type="submit" disabled={loading} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition text-sm">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditHabitForm
