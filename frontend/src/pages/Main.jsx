import { useState } from "react"
import Sidebar from "../components/Sidebar.jsx"
import Habits from "../components/Habits.jsx"
import Stats from "../components/Stats.jsx"
import Settings from "../components/Settings.jsx"

const Main = () => {
    const [tab, setTab] = useState("habits")
    const renderSection = () => {
        switch (tab.toLowerCase()) {
            case "habits":
                return <Habits />
            case "statistics":
                return <Stats />

            case "settings":
                return <Settings />
        }
    }
    return (
        <div className="text-white relative h-screen overflow-hidden">
            <main className="h-full bg-gray-900 overflow-y-auto pb-20 sm:pb-24">
                {renderSection()}
            </main>
            <Sidebar setTab={setTab} tab={tab} />
        </div>
    )
}

export default Main