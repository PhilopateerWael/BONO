import { useState, useEffect, useRef } from 'react'
import { Plus, Tally5, Timer, Check, Target, Calendar, TrendingUp, Play, Square, Award, Flame } from 'lucide-react'
import CreateHabitForm from './CreateHabitForm'
import { useUserContext } from '../context/authContext';
import axios from 'axios';

function keyForDate(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

const DEFAULT_REWARD = "/reward-default.mp4"

const Habits = () => {
    const [form, setForm] = useState(false);
    const [state, dispatch] = useUserContext()

    const [rewardSrc, setRewardSrc] = useState("")
    const [showReward, setShowReward] = useState(false)
    const [rewardFadeIn, setRewardFadeIn] = useState(false)
    const videoRef = useRef(null)
    useEffect(() => {
        const saved = localStorage.getItem('rewardVideoSrc')
        if (saved) setRewardSrc(saved)
    }, [])

    useEffect(() => {
        if (showReward) {
            const t = setTimeout(() => setRewardFadeIn(true), 10)
            return () => clearTimeout(t)
        } else {
            setRewardFadeIn(false)
        }
    }, [showReward])

    const getTypeStyles = (type) => {
        switch (type) {
            case 'time':
                return {
                    cardBorder: 'border-cyan-500',
                    cardTone: 'bg-gradient-to-br from-cyan-500/10 to-transparent',
                    iconBg: 'bg-cyan-500/10',
                    iconText: 'text-cyan-400',
                    progressFill: 'bg-cyan-500',
                    buttonBg: 'bg-cyan-600 hover:bg-cyan-500',
                }
            case 'count':
                return {
                    cardBorder: 'border-purple-500',
                    cardTone: 'bg-gradient-to-br from-purple-500/10 to-transparent',
                    iconBg: 'bg-purple-500/10',
                    iconText: 'text-purple-400',
                    progressFill: 'bg-purple-500',
                    buttonBg: 'bg-purple-600 hover:bg-purple-500',
                }
            case 'check':
                return {
                    cardBorder: 'border-emerald-500',
                    cardTone: 'bg-gradient-to-br from-emerald-500/10 to-transparent',
                    iconBg: 'bg-emerald-500/10',
                    iconText: 'text-emerald-400',
                    progressFill: 'bg-emerald-500',
                    buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
                }
            default:
                return {
                    cardBorder: 'border-gray-600',
                    cardTone: 'bg-gradient-to-br from-gray-600/10 to-transparent',
                    iconBg: 'bg-gray-600/10',
                    iconText: 'text-gray-300',
                    progressFill: 'bg-gray-400',
                    buttonBg: 'bg-gray-600 hover:bg-gray-500',
                }
        }
    }

    const Habit = ({ habit }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let { name, description, habitType, goal, weeklyGoal, unit } = habit;
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
            isCompleted = todaysData.completed;

            if (habitType === "count" || habitType === "time") {
                progress = (todaysProgress / goal) * 100;
            }
        }

        const isDailyGoalReached = (habitType === "count" || habitType === "time") && todaysProgress >= goal;

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

        const playRewardIfCompleted = (updatedHabit) => {
            const todayKey = keyForDate(new Date())
            const wasCompleted = Boolean(habit?.daysDone && habit.daysDone[todayKey]?.completed)
            const nowCompleted = Boolean(updatedHabit?.daysDone && updatedHabit.daysDone[todayKey]?.completed)
            if (!wasCompleted && nowCompleted) {
                setShowReward(true)
            }
        }

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

                if (ammount <= 0) {
                    setInputValue('')
                    setTimeElapsed(0)
                    setIsLoading(false)
                    return
                };

                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/habits/do`, {
                    habitId: habit._id,
                    ammount: ammount,
                    hour: new Date().getHours()
                });

                dispatch({ type: "SET_HABIT", payload: response.data });
                playRewardIfCompleted(response.data)

                setInputValue('')
                setTimeElapsed(0)
            } catch (error) {
                alert('Failed to record habit. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        const styles = getTypeStyles(habitType);

        return (
            <div className={`glass border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 transition-all duration-300 ${styles.cardTone}`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                            <h2 className="font-bold text-white text-lg sm:text-xl truncate">{name}</h2>
                        </div>
                        {description && (
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{description}</p>
                        )}
                    </div>

                    <div className={`p-2 sm:p-3 rounded-xl shrink-0 ml-2 bg-white/10 border border-white/10`}>
                        {habitType === "time" && <Timer size={18} className={`sm:w-5 sm:h-5 ${styles.iconText}`} />}
                        {habitType === "count" && <Tally5 size={18} className={`sm:w-5 sm:h-5 ${styles.iconText}`} />}
                        {habitType === "check" && <Check size={18} className={`sm:w-5 sm:h-5 ${styles.iconText}`} />}
                    </div>
                </div>

                {(habitType === "time" || habitType === "count") && (
                    <div className="mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1 sm:gap-2">
                            <div className="flex items-center gap-2 text-sm">
                                <TrendingUp size={14} className={`sm:w-4 sm:h-4 ${isDailyGoalReached ? 'text-green-400' : 'text-gray-300'}`} />
                                <span
                                    className={`
                                        text-xs sm:text-sm
                                        ${isDailyGoalReached ? "text-green-300" : "text-gray-300"}
                                        block max-w-[200px] truncate
                                    `}
                                >
                                    Today: {todaysProgress}/{goal} {unit}
                                    {isDailyGoalReached && todaysProgress > goal && (
                                        <span className="text-green-400 ml-1">
                                            +{todaysProgress - goal}
                                        </span>
                                    )}
                                </span>

                            </div>
                            <span className={`text-base sm:text-lg font-bold self-start sm:self-auto ${isDailyGoalReached ? 'text-green-300' : 'text-white'}`}>
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="w-full h-3 sm:h-4 bg-white/10 border border-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ease-out ${styles.progressFill}`}
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
                        <div className="glass rounded-xl p-3 sm:p-4 mb-3 border border-white/10">
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
                                        className={`cursor-pointer flex-1 text-white py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation ${styles.buttonBg}`}
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
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-gray-400 focus:border-white/30 focus:outline-none transition-colors text-sm sm:text-base"
                                min="1"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSubmit()}
                                disabled={isLoading || !inputValue}
                                className={`cursor-pointer text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 shadow-[0_10px_30px_rgba(79,70,229,0.25)]`}
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
                            disabled={isLoading || isCompleted}
                            className={`w-full cursor-pointer text-white py-3 sm:py-4 rounded-xl font-medium text-base sm:text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 touch-manipulation bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 shadow-[0_10px_30px_rgba(79,70,229,0.25)]`}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check size={18} className={`sm:w-5 sm:h-5`} />
                            )}
                            <span className="text-sm sm:text-base">
                                {isCompleted ? "Completed Today!" : "Mark as Complete"}
                            </span>
                        </button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-400 border-t border-white/10 pt-3 gap-2 sm:gap-4">
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
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-md px-2 py-1">
                            <Flame size={12} className="text-amber-400" />
                            <span className="text-xs text-gray-200">Current:</span>
                            <span className="text-xs font-semibold text-white">{habit.currentStreak || 0}</span>
                        </span>
                        <span className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-md px-2 py-1">
                            <Award size={12} className="text-emerald-400" />
                            <span className="text-xs text-gray-200">Longest:</span>
                            <span className="text-xs font-semibold text-white">{habit.longestStreak || 0}</span>
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    const habits = Object.entries(state.user.habits).map(x => x[1])

    const closeReward = () => {
        if (videoRef.current) try { videoRef.current.pause() } catch { }
        setRewardFadeIn(false)
        setTimeout(() => setShowReward(false), 500)
    }

    return (
        <div className='min-h-screen'>
            <div className='border-b border-b-white/10'>
                <div className="max-w-3xl mx-auto w-full flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 gap-4 sm:gap-0">
                    <div className="min-w-0">
                        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 sm:mb-2'>My Habits</h1>
                        <p className='text-gray-300 text-sm sm:text-base'>Track your daily progress and build lasting habits</p>
                        {state?.user && state.user !== 'LOADING' && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                                <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-lg px-2.5 py-1">
                                    <Flame size={14} className="text-amber-400" />
                                    <span className="text-xs text-gray-200">Current Streak:</span>
                                    <span className="text-xs font-semibold text-white">{state.user.currentStreak || 0}</span>
                                </div>
                                <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-lg px-2.5 py-1">
                                    <Award size={14} className="text-emerald-400" />
                                    <span className="text-xs text-gray-200">Longest Streak:</span>
                                    <span className="text-xs font-semibold text-white">{state.user.longestStreak || 0}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setForm(true)}
                        className='cursor-pointer text-white flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-colors duration-200 font-medium touch-manipulation shrink-0 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 shadow-[0_10px_30px_rgba(79,70,229,0.25)] neon-ring'
                    >
                        <Plus size={18} className="sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Add New Habit</span>
                    </button>
                </div>
            </div>

            {form && (
                <div className="p-4 sm:p-6">
                    <CreateHabitForm setForm={setForm} />
                </div>
            )}

            <div className='p-4 sm:p-6'>
                {habits.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                        <div className="glass rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto border border-white/10">
                            <div className="bg-white/10 border border-white/10 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                                <Target className="text-white/80" size={20} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No habits yet</h3>
                            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Start building your first habit to track your progress</p>
                            <button
                                onClick={() => setForm(true)}
                                className="cursor-pointer bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base touch-manipulation shadow-[0_10px_30px_rgba(79,70,229,0.25)]"
                            >
                                Create Your First Habit
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='grid gap-4 sm:gap-6 mx-auto grid-cols-1 max-w-3xl'>
                        {habits.map((habit, i) => <Habit key={habit._id || i} habit={habit} />)}
                    </div>
                )}
            </div>

            {showReward && (
                <div className={`fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-500 ${rewardFadeIn ? 'opacity-100' : 'opacity-0'}`} onClick={closeReward}>
                    <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full rounded-xl border border-white/10"
                            disablePictureInPicture
                            controlsList="nodownload noplaybackrate noremoteplayback"
                            onPause={() => { try { if (videoRef.current && !videoRef.current.ended) videoRef.current.play() } catch { } }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); try { if (videoRef.current && videoRef.current.paused && !videoRef.current.ended) videoRef.current.play() } catch { } }}
                            onEnded={closeReward}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <source src={rewardSrc || DEFAULT_REWARD} type="video/mp4" />
                        </video>
                        <div className="text-center mt-3">
                            <button
                                onClick={closeReward}
                                className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Habits