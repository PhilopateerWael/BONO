import { Routes, Route, Navigate } from 'react-router-dom';
import { UserContextProvider, useUserContext } from './context/authContext';
import { useEffect } from 'react';
import axios from 'axios';
import Login from './pages/Login';

axios.defaults.withCredentials = true;

function WrapApp() {
    const [state, dispatch] = useUserContext();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/auth/me");
                dispatch({ type: "LOGIN", payload: res.data });
            } catch (e) {
                dispatch({ type: "LOGOUT" });
            }
        };

        fetchUser();
    }, []);

    if(state.user == "LOADING"){
        return "LOADING"
    }

    return (
        <div className='overflow-hidden'>
            <Routes>
                <Route path="/" element={state.user ? "WELCOME" : <Login />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

const App = () => {
    return (
        <UserContextProvider>
            <WrapApp />
        </UserContextProvider>
    );
};

export default App;