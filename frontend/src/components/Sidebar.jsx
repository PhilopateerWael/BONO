import { LayoutDashboard, ChartColumnIncreasing, Settings, Star, BarChart3 } from "lucide-react";

const Sidebar = ({ setTab, tab }) => {
    const Tab = ({ name, icon }) => {
        const selected = name === tab;
        return (
            <button
                onClick={() => setTab(name)}
                className={
                    "group flex flex-col items-center gap-1 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl transition-all duration-300 w-full " +
                    (selected
                        ? "text-white bg-gradient-to-b from-indigo-500/40 via-indigo-500/20 to-transparent neon-ring shadow-[0_8px_24px_rgba(79,70,229,0.35)]"
                        : "text-gray-300 hover:bg-white/5 hover:text-white")
                }
                title={name}
            >
                <span className={(selected ? "text-white " : "text-gray-300 ") + "p-1.5 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 transition-colors"}>
                    {icon}
                </span>
                <p className="capitalize font-medium text-[11px] sm:text-xs tracking-wide">
                    {name}
                </p>
            </button>
        );
    };


    const tabs = [
        { name: "habits", icon: <LayoutDashboard size={18} /> },
        { name: "statistics", icon: <ChartColumnIncreasing size={18} /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-white/10 z-50">
            <div className="mx-auto max-w-3xl">
                <div className="flex justify-around items-center p-2 sm:p-3 gap-1">
                    {tabs.map((x, i) => (
                        <Tab key={i} name={x.name} icon={x.icon} />
                    ))}
                    <Tab name={"settings"} icon={<Settings size={18} />} />
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;
