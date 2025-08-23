import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateHabitForm from './CreateHabitForm'
import { useUserContext } from '../context/authContext';

const Habits = () => {
    const [form, setForm] = useState(false);
    const [state , dispatch] = useUserContext()
    
    console.log(state)

    const Habit = () => {

    }

    return (
        <div>
            <div className='flex justify-between p-4'>
                <h1 className='text-3xl font-black'>Habits</h1>
                <button onClick={() => setForm(true)}
                    className='text-gray-300 cursor-pointer bg-blue-500 hover:text-white flex items-center justify-center gap-3 p-3 rounded-2xl transition-all duration-300 max-sm:p-2'> <Plus /> Add habit</button>
            </div>
            {form && <CreateHabitForm setForm={setForm} />}
            <div>
                
            </div>
        </div>
    )
}

export default Habits