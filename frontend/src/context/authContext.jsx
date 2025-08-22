import { useReducer, createContext, useContext } from 'react'

const UserContext = createContext()

const UserContextProvider = ({ children }) => {
	function red(state, action) {
		switch (action.type) {
			case "LOGIN":
				return {
					...state,
					user: action.payload
				}
			case "LOGOUT":
				return {
					...state,
					user: false
				}
			default:
				return state
		}
	}

	const [state, dispatch] = useReducer(red, {
		user: "LOADING",
	})

	return (
		<UserContext.Provider value={[state, dispatch]}>
			{children}
		</UserContext.Provider>
	)
}

function useUserContext() {
	return useContext(UserContext)
}

export { useUserContext, UserContextProvider }