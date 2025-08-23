import { useState } from "react"
import Sidebar from "../components/Sidebar.jsx"
import Habits from "../components/Habits.jsx"

const Main = () => {
    const [tab, setTab] = useState("habits")
    const renderSection = () => {
        switch (tab.toLowerCase()) {
            case "habits":
                return <Habits />
        }
    }
    return (
        <div className="flex text-white">
            <Sidebar setTab={setTab} tab={tab} />
            <main className="flex-1 bg-gray-900">
                {renderSection()}
            </main>
        </div>
    )
}

export default Main