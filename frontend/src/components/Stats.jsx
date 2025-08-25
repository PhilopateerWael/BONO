import { useUserContext } from '../context/authContext'
import { Check, Target, Timer, Tally5 } from 'lucide-react'

function keyForDate(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

const Stats = () => {
    const [state, dispatch] = useUserContext()
    const habits = Object.entries(state.user.habits).map(x => x[1])
    console.log(state)
    const Habit = ({ habit }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let { name, description, habitType, goal, weeklyGoal, totalCompletions, unit } = habit;
        unit = habitType == "time" ? "minutes" : unit;
        goal = habitType == 'check' ? 1 : goal;

        let progress = 0;
        let todaysProgress = 0;
        let isCompleted = false;

        if (habit?.daysDone && habit?.daysDone[keyForDate(today)]) {
            const todaysData = habit.daysDone[keyForDate(today)];
            todaysProgress = todaysData.ammount;
            isCompleted = todaysData.completed || false;

            if (habitType === "count" || habitType === "time") {
                progress = (todaysProgress / goal) * 100;
            }
        }

        // Check if daily goal is reached for time/count habits
        const isDailyGoalReached = (habitType === "count" || habitType === "time") && todaysProgress >= goal;
        const isGoalReached = habitType !== "check" && totalCompletions >= goal;
        


        const getHabitTypeStyles = () => {
            switch (habitType) {
                case "time":
                    return {
                        border: isDailyGoalReached ? "border-green-500/30" : "border-emerald-500/30",
                        bg: isDailyGoalReached ? "bg-gradient-to-br from-gray-800 to-green-900/20" : "bg-gradient-to-br from-gray-800 to-emerald-900/20",
                        icon: isDailyGoalReached ? "bg-green-500/20 text-green-400" : "bg-emerald-500/20 text-emerald-400",
                        progress: isDailyGoalReached ? "bg-green-500" : "bg-emerald-500"
                    };
                case "count":
                    return {
                        border: isDailyGoalReached ? "border-green-500/30" : "border-purple-500/30",
                        bg: isDailyGoalReached ? "bg-gradient-to-br from-gray-800 to-green-900/20" : "bg-gradient-to-br from-gray-800 to-purple-900/20",
                        icon: isDailyGoalReached ? "bg-green-500/20 text-green-400" : "bg-purple-500/20 text-purple-400",
                        progress: isDailyGoalReached ? "bg-green-500" : "bg-purple-500"
                    };
                case "check":
                    return {
                        border: isCompleted ? "border-green-500/30" : "border-blue-500/30",
                        bg: isCompleted ? "bg-gradient-to-br from-gray-800 to-green-900/20" : "bg-gradient-to-br from-gray-800 to-blue-900/20",
                        icon: isCompleted ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400",
                        progress: "bg-blue-500"
                    };
                default:
                    return {
                        border: "border-gray-700",
                        bg: "bg-gray-800",
                        icon: "bg-gray-600/20 text-gray-400",
                        progress: "bg-gray-500"
                    };
            }
        };

        const styles = getHabitTypeStyles();
        let date = new Date()
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - date.getDay());
        let days = []

        for (let i = 0; i < 7; i++) {
            days.push(habit.daysDone[keyForDate(date)])
            date.setDate(date.getDate() + 1);
        }
        
        return (
            <div className={`${styles.bg} ${styles.border} border rounded-lg p-3 sm:p-4 mb-3 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`${styles.icon} p-2 rounded-lg shrink-0`}>
                            {habitType === "time" && <Timer size={16} />}
                            {habitType === "count" && <Tally5 size={16} />}
                            {habitType === "check" && <Check size={16} />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-white text-sm sm:text-base truncate mb-1">{name}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-400">
                                    Goal: {goal} {unit}
                                </span>
                                {isDailyGoalReached && (
                                    <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-xs font-medium">
                                        ✓ Complete
                                    </span>
                                )}
                                {habitType === "check" && isCompleted && (
                                    <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-xs font-medium">
                                        ✓ Done
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        {(habitType === "time" || habitType === "count") && (
                            <div className="text-sm font-semibold text-white">
                                {todaysProgress}/{goal}
                            </div>
                        )}
                        {habitType === "check" && (
                            <div className={`text-sm font-semibold ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                                {isCompleted ? '✓' : '○'}
                            </div>
                        )}
                    </div>
                </div>

                {(habitType === "time" || habitType === "count") && (
                    <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs ${isDailyGoalReached ? 'text-green-300' : 'text-gray-400'}`}>
                                Daily Progress: {Math.round(progress)}%
                            </span>
                            {todaysProgress > goal && (
                                <span className="text-xs text-green-400">
                                    +{todaysProgress - goal} extra
                                </span>
                            )}
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${styles.progress} transition-all duration-500 ease-out`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700/50">
                    <span>Weekly: {weeklyGoal} days</span>
                    <span>Total: {totalCompletions}</span>
                </div>
                <div>
                    <span className={`text-xs text-gray-400`}>
                        Weekly Progress:
                    </span>

                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-900'>
            <div className='p-4 sm:p-6 border-b border-gray-800'>
                <div className="max-w-3xl mx-auto">
                    <h1 className='text-2xl sm:text-3xl font-bold text-white mb-1'>Statistics</h1>
                    <p className='text-gray-400 text-sm sm:text-base'>Overview of your habit progress</p>
                </div>
            </div>

            <div className='p-4 sm:p-6'>
                <div className="max-w-3xl mx-auto">
                    {habits.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-800 rounded-xl p-6 max-w-sm mx-auto">
                                <div className="bg-gray-700 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                                    <Target className="text-gray-400" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No habits to display</h3>
                                <p className="text-gray-400 text-sm">Create some habits to see your statistics here</p>
                            </div>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {habits.map((habit, i) => <Habit key={habit._id || i} habit={habit} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Stats