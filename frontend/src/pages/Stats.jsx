import { useState } from 'react'
import { Tally5, Timer, Check, Target, X, Pencil } from 'lucide-react'
import { useUserContext } from '../context/authContext';
import EditHabitForm from '../components/EditHabitForm'
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function keyForDate(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

const Stats = () => {
    const [form, setForm] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [state, dispatch] = useUserContext()

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

        let { name, description, habitType, unit } = habit;
        unit = habitType == "time" ? "minutes" : unit;

        const styles = getTypeStyles(habitType);
        let days = Array(7).fill(undefined)

        let date = new Date()
        date.setHours(0, 0, 0, 0)
        date.setDate(date.getDate() - date.getDay())

        let daysCompleted = 0;

        for (let i = 0; i < 7; i++) {
            days[i] = ({ data: habit.daysDone ? habit.daysDone[keyForDate(date)] : undefined, date: `${date.getDate()} / ${date.getMonth() + 1}` })
            date.setDate(date.getDate() + 1)
            if (days[i].data && days[i].data.completed) daysCompleted++;
        }

        let achievedWeeklyGoal = daysCompleted >= habit.weeklyGoal;
        
        const DaysComponent = () => {
            return (
                <div className="flex gap-2 mt-4 justify-center">
                    {days.map((day, idx) => {
                        const value = day && day.data ? day.data.ammount : 0;
                        const currentGoal = day && day.data ? day.data.currentGoal : 0;
                        const percent = currentGoal > 0 ? Math.min(100, Math.round((value / currentGoal))) : 0;
                        const active = percent > 0;
                        const viewedPercent = currentGoal > 0 ? Math.round((value / currentGoal) * 100) : 0;
                        return (
                            <div key={idx} className="flex flex-col items-center">
                                <div className={`w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative flex items-center justify-center ${active ? 'neon-ring' : ''}`}>
                                    <div
                                        className={`absolute inset-x-0 bottom-0 ${styles.progressFill} h-full`}
                                        style={{ opacity: `${percent}` }}
                                    />
                                    <div className="relative z-10 text-white text-xs sm:text-sm md:text-base font-medium text-center leading-tight">
                                        {day.data ? `${viewedPercent}%` : '0%'}
                                    </div>
                                </div>
                                <div className="text-gray-400 text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-2 truncate max-w-[40px] sm:max-w-[48px] md:max-w-[64px] lg:max-w-[80px] text-center">
                                    {day ? day.date : ''}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )
        }

        return (
            <div
                className={`glass border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 transition-all duration-300 ${styles.cardTone} cursor-pointer`}
                onClick={() => setSelectedHabit(habit)}
            >
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
                {achievedWeeklyGoal && (
                    <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-xs text-green-400 text-center">
                            🎯 Weekly goal achieved!
                        </p>
                    </div>
                )}
                <DaysComponent />
            </div>
        )
    }

    const HabitOverlay = ({ habit, onClose }) => {
        if (!habit) return null;

        const styles = getTypeStyles(habit.habitType);
        const [isEditing, setIsEditing] = useState(false);
        let days = Array(7).fill(undefined)
        let date = new Date()
        date.setHours(0, 0, 0, 0)
        date.setDate(date.getDate() - date.getDay())

        for (let i = 0; i < 7; i++) {
            days[i] = ({ data: habit.daysDone ? habit.daysDone[keyForDate(date)] : undefined, date: `${date.getDate()} / ${date.getMonth() + 1}` })
            date.setDate(date.getDate() + 1)
        }

        const getHourlyDensity = () => {
            if (!habit.hours || !Array.isArray(habit.hours)) {
                return Array(24).fill(0);
            }
            return habit.hours;
        }

        const { total, completedDays } = { total: habit.totalAmmount, completedDays: habit.totalCompletions };
        const hourlyData = getHourlyDensity();

        return (
            <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
                <div className={`glass border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${styles.cardTone}`}>
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl bg-white/10 border border-white/10`}>
                                    {habit.habitType === "time" && <Timer size={24} className={`${styles.iconText}`} />}
                                    {habit.habitType === "count" && <Tally5 size={24} className={`${styles.iconText}`} />}
                                    {habit.habitType === "check" && <Check size={24} className={`${styles.iconText}`} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{habit.name}</h2>
                                    {habit.description && (
                                        <p className="text-gray-400 mt-1">{habit.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Habit"
                                >
                                    <Pencil size={18} className="text-gray-300" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 mb-6">
                            <div className="glass rounded-xl p-4 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-3">Hourly Activity Pattern</h3>
                                <div className="h-48">
                                    <Line
                                        data={{
                                            labels: Array.from({ length: 24 }, (_, i) => `${i}`),
                                            datasets: [
                                                {
                                                    label: 'Activity',
                                                    data: hourlyData,
                                                    borderColor: styles.progressFill.replace('bg-', '').split('-')[0] === 'cyan' ? '#06b6d4' :
                                                        styles.progressFill.replace('bg-', '').split('-')[0] === 'purple' ? '#a855f7' :
                                                            styles.progressFill.replace('bg-', '').split('-')[0] === 'emerald' ? '#10b981' : '#6b7280',
                                                    backgroundColor: styles.progressFill.replace('bg-', '').split('-')[0] === 'cyan' ? 'rgba(6, 182, 212, 0.1)' :
                                                        styles.progressFill.replace('bg-', '').split('-')[0] === 'purple' ? 'rgba(168, 85, 247, 0.1)' :
                                                            styles.progressFill.replace('bg-', '').split('-')[0] === 'emerald' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                                    fill: true,
                                                    tension: 0.4,
                                                    pointRadius: 3,
                                                    pointHoverRadius: 5,
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    display: false
                                                },
                                                tooltip: {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                    titleColor: '#ffffff',
                                                    bodyColor: '#ffffff',
                                                    borderColor: styles.progressFill.replace('bg-', '').split('-')[0] === 'cyan' ? '#06b6d4' :
                                                        styles.progressFill.replace('bg-', '').split('-')[0] === 'purple' ? '#a855f7' :
                                                            styles.progressFill.replace('bg-', '').split('-')[0] === 'emerald' ? '#10b981' : '#6b7280',
                                                    borderWidth: 1,
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    grid: {
                                                        color: 'rgba(75, 85, 99, 0.3)',
                                                    },
                                                    ticks: {
                                                        color: '#9ca3af',
                                                        maxRotation: 45,
                                                        minRotation: 45,
                                                    }
                                                },
                                                y: {
                                                    grid: {
                                                        color: 'rgba(75, 85, 99, 0.3)',
                                                    },
                                                    ticks: {
                                                        color: '#9ca3af',
                                                    },
                                                    beginAtZero: true
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-gray-400 text-xs text-center mt-3">
                                    Shows when you're most likely to complete this habit
                                </p>
                            </div>

                            <div className="glass rounded-xl p-4 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-3">Overall Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Progress:</span>
                                        <span className="text-white font-medium">{total} {habit.habitType === "time" ? "minutes" : habit.unit || 'units'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Completed Days:</span>
                                        <span className="text-white font-medium">{completedDays}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Current Streak:</span>
                                        <span className="text-white font-medium">{habit.currentStreak || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Longest Streak:</span>
                                        <span className="text-white font-medium">{habit.longestStreak || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Habit Type:</span>
                                        <span className="text-white font-medium capitalize">{habit.habitType}</span>
                                    </div>
                                    {habit.goal && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Daily Goal:</span>
                                            <span className="text-white font-medium">{habit.goal} {habit.habitType === "time" ? "minutes" : habit.unit || 'units'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-xl p-4 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                            <div className="space-y-2">
                                {habit.daysDone ? Object.entries(habit.daysDone).slice(-5).reverse().map(([date, data]) => (
                                    <div key={date} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                                        <span className="text-gray-400 text-sm">{date}</span>
                                        <span className="text-white font-medium">
                                            {data.ammount} {habit.unit || 'units'}
                                            {data.completed && <span className="text-green-400 ml-2">✓</span>}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-gray-400 text-center py-4">No activity recorded yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isEditing && (
                <EditHabitForm
                    habit={habit}
                    onClose={() => setIsEditing(false)}
                    onUpdated={(updated) => {
                        if (updated === null) {
                            dispatch({ type: 'DELETE_HABIT', payload: habit._id })
                            onClose()
                        } else {
                            dispatch({ type: 'SET_HABIT', payload: updated })
                        }
                    }}
                />
            )}
            </>
        );
    };

    const habits = Object.entries(state.user.habits).map(x => x[1])

    return (
        <div className='min-h-screen'>
            <div className='glass-strong border-b border-white/10'>
                <div className='max-w-3xl mx-auto w-full flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 gap-4 sm:gap-0'>
                    <div className="min-w-0">
                        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 sm:mb-2'>My Stats</h1>
                        <p className='text-gray-300 text-sm sm:text-base'>Track Each habit's progress.</p>
                    </div>
                </div>
            </div>
            <div className='p-4 sm:p-6 max-w-3xl mx-auto'>
                {habits.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                        <div className="glass rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto border border-white/10">
                            <div className="bg-white/10 border border-white/10 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                                <Target className="text-white/80" size={20} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No habits yet</h3>
                            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Start building your first habit to track your progress</p>
                        </div>
                    </div>
                ) : (
                    <div className='grid gap-4 sm:gap-6 mx-auto grid-cols-1'>
                        {habits.map((habit, i) => <Habit key={habit._id || i} habit={habit} />)}
                    </div>
                )}
            </div>

            {selectedHabit && (
                <HabitOverlay
                    habit={selectedHabit}
                    onClose={() => setSelectedHabit(null)}
                />
            )}
        </div>
    )
}

export default Stats