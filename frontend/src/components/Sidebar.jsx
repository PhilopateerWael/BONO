import { LayoutDashboard, ChartColumnIncreasing, Settings, Star } from "lucide-react";

const Sidebar = ({ setTab, tab }) => {
    const Tab = ({ name, icon }) => {
        let selected = name === tab;
        return (
            <button
                onClick={() => setTab(name)}
                className={
                    "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 w-full " +
                    (selected
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-blue-500/30 hover:text-white")
                }
                title={name}
            >
                <span className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    {icon}
                </span>
                <p className="capitalize font-medium max-sm:hidden text-sm sm:text-base">{name}</p>
            </button>
        );
    };

    const tabs = [
        { name: "habits", icon: <LayoutDashboard size={20} /> },
        { name: "statistics", icon: <ChartColumnIncreasing size={20} /> },
    ];

    return (
        <aside className="h-screen bg-gray-900 text-white flex flex-col w-56 sm:w-64 md:w-56 lg:w-64 max-sm:w-16 p-4 border-r border-gray-700 max-sm:p-2 sticky top-0 shrink-0">

            <h1 className="font-extrabold text-xl sm:text-2xl mb-6 sm:mb-10 flex gap-2 sm:gap-3 justify-center items-center">
                <span className="bg-blue-600 p-2 rounded-xl">
                    <Star size={20} className="sm:w-[22px] sm:h-[22px]" />
                </span>
                <span className="max-sm:hidden">BONO</span>
            </h1>

            <nav className="flex flex-col gap-2">
                {tabs.map((x, i) => (
                    <Tab key={i} name={x.name} icon={x.icon} />
                ))}
            </nav>

            <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-700">
                <Tab name={"settings"} icon={<Settings size={20} />} />
            </div>
        </aside>
    );
};

export default Sidebar;
