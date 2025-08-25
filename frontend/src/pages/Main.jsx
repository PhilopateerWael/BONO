import { useState } from "react"
import Sidebar from "../components/Sidebar.jsx"
import Habits from "../components/Habits.jsx"
import Stats from "../components/Stats.jsx"

const Main = () => {
    const [tab, setTab] = useState("habits")
    const renderSection = () => {
        switch (tab.toLowerCase()) {
            case "habits":
                return <Habits />
            case "statistics":
                return <Stats />
        }
    }
    return (
        <div className="flex text-white relative h-screen overflow-hidden">
            <Sidebar setTab={setTab} tab={tab} />
            <main className="flex-1 bg-gray-900 overflow-y-auto">
                {renderSection()}
            </main>
        </div>
    )
}

export default Main