import { useState, useEffect } from 'react'
import { Plus, Tally5, Timer, Check, Target, Calendar, TrendingUp, Play, Square } from 'lucide-react'
import CreateHabitForm from './CreateHabitForm'
import { useUserContext } from '../context/authContext';
import axios from 'axios';

function keyForDate(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

const Habits = () => {
    const [form, setForm] = useState(false);
    const [state, dispatch] = useUserContext()

    const Habit = ({ habit }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let { name, description, habitType, goal, weeklyGoal, totalCompletions, unit } = habit;
        unit = habitType == "time" ? "minutes" : unit;
        goal = habitType == 'check' ? 1 : goal;
        const [inputValue, setInputValue] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [isTimerRunning, setIsTimerRunning] = useState(false);
        const [timeElapsed, setTimeElapsed] = useState(0);

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

        const [isCompletedState, setIsCompleted] = useState(isCompleted);
        // Check if daily goal is reached for time/count habits
        const isDailyGoalReached = (habitType === "count" || habitType === "time") && todaysProgress >= goal;
        const isGoalReached = habitType !== "check" && totalCompletions >= goal;

        const startTimer = () => {
            setIsTimerRunning(true);
            setTimeElapsed(0);
        };

        const stopTimer = async () => {
            setIsTimerRunning(false);
            if (timeElapsed > 0) {
                await handleSubmit(Math.floor(timeElapsed / 60));
            }
        };

        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        useEffect(() => {
            let interval = null;
            if (isTimerRunning) {
                interval = setInterval(() => {
                    setTimeElapsed(time => time + 1);
                }, 1000);
            } else if (!isTimerRunning) {
                clearInterval(interval);
            }
            return () => clearInterval(interval);
        }, [isTimerRunning]);

        const handleSubmit = async (customAmount = null) => {
            setIsLoading(true);
            try {
                let ammount;

                if (customAmount !== null) {
                    ammount = customAmount;
                } else if (habitType === "count") {
                    ammount = parseInt(inputValue);
                } else if (habitType === "check") {
                    ammount = 1;
                } else if (habitType === "time") {
                    ammount = Math.floor(timeElapsed / 60);
                } else {
                    ammount = 1;
                }

                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/habits/do`, {
                    habitId: habit._id,
                    ammount: ammount
                });

                dispatch({ type: "SET_HABIT", payload: response.data });

                if (habitType === "count") {
                    setInputValue('');
                }

                if (habitType === "check") {
                    setIsCompleted(true);
                }
            } catch (error) {
                alert('Failed to record habit. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        const getHabitTypeStyles = () => {
            switch (habitType) {
                case "time":
                    return {
                        border: isDailyGoalReached ? "border-green-500/50" : "border-emerald-500/30",
                        bg: isDailyGoalReached ? "bg-gradient-to-br from-gray-800 to-green-900/30" : "bg-gradient-to-br from-gray-800 to-emerald-900/20",
                        icon: isDailyGoalReached ? "bg-green-500/20 text-green-400" : "bg-emerald-500/20 text-emerald-400",
                        progress: isDailyGoalReached ? "bg-green-500" : "bg-emerald-500",
                        button: isDailyGoalReached ? "bg-emerald-600 hover:bg-emerald-500" : "bg-emerald-600 hover:bg-emerald-500"
                    };
                case "count":
                    return {
                        border: isDailyGoalReached ? "border-green-500/50" : "border-purple-500/30",
                        bg: isDailyGoalReached ? "bg-gradient-to-br from-gray-800 to-green-900/30" : "bg-gradient-to-br from-gray-800 to-purple-900/20",
                        icon: isDailyGoalReached ? "bg-green-500/20 text-green-400" : "bg-purple-500/20 text-purple-400",
                        progress: isDailyGoalReached ? "bg-green-500" : "bg-purple-500",
                        button: isDailyGoalReached ? "bg-purple-600 hover:bg-purple-500" : "bg-purple-600 hover:bg-purple-500"
                    };
                case "check":
                    return {
                        border: isCompletedState ? "border-green-500/50" : "border-blue-500/30",
                        bg: isCompletedState ? "bg-gradient-to-br from-gray-800 to-green-900/30" : "bg-gradient-to-br from-gray-800 to-blue-900/20",
                        icon: isCompletedState ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400",
                        progress: "bg-blue-500",
                        button: isCompletedState ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-500"
                    };
                default:
                    return {
                        border: "border-gray-700",
                        bg: "bg-gray-800",
                        icon: "bg-gray-600/20 text-gray-400",
                        progress: "bg-gray-500",
                        button: "bg-gray-600 hover:bg-gray-500"
                    };
            }
        };

        const styles = getHabitTypeStyles();

        return (
            <div className={`${styles.bg} ${styles.border} border rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/20`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                            <h2 className="font-bold text-white text-lg sm:text-xl truncate">{name}</h2>
                            {isDailyGoalReached && (
                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0">
                                    <Check size={12} />
                                    <span className="hidden sm:inline">Daily Goal Complete!</span>
                                    <span className="sm:hidden">Complete!</span>
                                </span>
                            )}
                            {isGoalReached && (
                                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0">
                                    <Target size={12} />
                                    <span className="hidden sm:inline">Goal Reached!</span>
                                    <span className="sm:hidden">Goal!</span>
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-sm text-gray-300 mb-3 line-clamp-2">{description}</p>
                        )}
                    </div>

                    <div className={`${styles.icon} p-2 sm:p-3 rounded-xl shrink-0 ml-2`}>
                        {habitType === "time" && <Timer size={18} className="sm:w-5 sm:h-5" />}
                        {habitType === "count" && <Tally5 size={18} className="sm:w-5 sm:h-5" />}
                        {habitType === "check" && <Check size={18} className="sm:w-5 sm:h-5" />}
                    </div>
                </div>

                {(habitType === "time" || habitType === "count") && (
                    <div className="mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1 sm:gap-2">
                            <div className="flex items-center gap-2 text-sm">
                                <TrendingUp size={14} className={`sm:w-4 sm:h-4 ${isDailyGoalReached ? 'text-green-400' : 'text-gray-300'}`} />
                                <span className={`text-xs sm:text-sm ${isDailyGoalReached ? 'text-green-300' : 'text-gray-300'}`}>
                                    Today: {todaysProgress}/{goal} {unit}
                                    {isDailyGoalReached && todaysProgress > goal && (
                                        <span className="text-green-400 ml-1">+{todaysProgress - goal}</span>
                                    )}
                                </span>
                            </div>
                            <span className={`text-base sm:text-lg font-bold self-start sm:self-auto ${isDailyGoalReached ? 'text-green-300' : 'text-white'}`}>
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="w-full h-3 sm:h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${styles.progress} transition-all duration-500 ease-out`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {habitType === "time" && (
                    <div className="mb-4">
                        {isDailyGoalReached && (
                            <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <p className="text-xs text-green-400 text-center">
                                    🎉 Daily goal complete! Keep the momentum going.
                                </p>
                            </div>
                        )}
                        <div className="bg-gray-900/50 border border-gray-600 rounded-xl p-3 sm:p-4 mb-3">
                            <div className="text-center mb-3 sm:mb-4">
                                <div className="text-2xl sm:text-3xl font-mono font-bold text-white mb-2">
                                    {formatTime(timeElapsed)}
                                </div>
                                <p className={`text-xs sm:text-sm ${isDailyGoalReached ? 'text-green-400' : 'text-gray-400'}`}>
                                    {isDailyGoalReached ? "Daily goal complete! Keep going?" :
                                        isTimerRunning ? "Timer running..." : "Ready to start?"}
                                </p>
                            </div>
                            <div className="flex gap-2 sm:gap-3">
                                {!isTimerRunning ? (
                                    <button
                                        onClick={startTimer}
                                        disabled={isLoading}
                                        className={`cursor-pointer flex-1 ${styles.button} text-white py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation`}
                                    >
                                        <Play size={14} className="sm:w-4 sm:h-4" />
                                        <span className="text-sm sm:text-base">Start Timer</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopTimer}
                                        disabled={isLoading}
                                        className="cursor-pointer flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                                    >
                                        {isLoading ? (
                                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Square size={14} className="sm:w-4 sm:h-4" />
                                        )}
                                        <span className="text-sm sm:text-base">Stop & Save</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {habitType === "count" && (
                    <div className="mb-4">
                        {isDailyGoalReached && (
                            <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <p className="text-xs text-green-400 text-center">
                                    🎉 Daily goal complete! You can still add more.
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={isDailyGoalReached ? "Add more..." : "Enter amount..."}
                                className="flex-1 bg-gray-900/50 border border-gray-600 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-gray-400 focus:border-gray-400 focus:outline-none transition-colors text-sm sm:text-base"
                                min="1"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSubmit()}
                                disabled={isLoading || !inputValue}
                                className={`${styles.button} cursor-pointer text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation`}
                            >
                                {isLoading ? (
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Plus size={14} className="sm:w-4 sm:h-4" />
                                )}
                                <span className="text-sm sm:text-base">
                                    {isDailyGoalReached ? "Add More" : "Add"}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {habitType === "check" && (
                    <div className="mb-4">
                        <button
                            onClick={() => handleSubmit()}
                            disabled={isLoading || isCompletedState}
                            className={`w-full ${styles.button} cursor-pointer text-white py-3 sm:py-4 rounded-xl font-medium text-base sm:text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 touch-manipulation`}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check size={18} className="sm:w-5 sm:h-5" />
                            )}
                            <span className="text-sm sm:text-base">
                                {isCompletedState ? "Completed Today!" : "Mark as Complete"}
                            </span>
                        </button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-400 border-t border-gray-700 pt-3 gap-2 sm:gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span className="text-xs">Weekly: {weeklyGoal} days</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Target size={12} />
                            <span className="text-xs">Daily goal: {goal} {unit}</span>
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    const habits = Object.entries(state.user.habits).map(x => x[1])

    return (
        <div className='min-h-screen bg-gray-900'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 border-b border-gray-800 gap-4 sm:gap-0'>
                <div className="min-w-0">
                    <h1 className='text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 sm:mb-2'>My Habits</h1>
                    <p className='text-gray-400 text-sm sm:text-base'>Track your daily progress and build lasting habits</p>
                </div>
                <button
                    onClick={() => setForm(true)}
                    className='bg-blue-600 hover:bg-blue-500 cursor-pointer text-white flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-colors duration-200 font-medium shadow-lg touch-manipulation shrink-0'
                >
                    <Plus size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Add New Habit</span>
                </button>
            </div>

            {form && (
                <div className="p-4 sm:p-6">
                    <CreateHabitForm setForm={setForm} />
                </div>
            )}

            <div className='p-4 sm:p-6'>
                {habits.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                        <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto">
                            <div className="bg-gray-700 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                                <Target className="text-gray-400" size={20} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No habits yet</h3>
                            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Start building your first habit to track your progress</p>
                            <button
                                onClick={() => setForm(true)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base touch-manipulation"
                            >
                                Create Your First Habit
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='grid gap-4 sm:gap-6 max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto grid-cols-1'>
                        {habits.map((habit, i) => <Habit key={habit._id || i} habit={habit} />)}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Habits