import { useReducer, createContext, useContext } from 'react'

const UserContext = createContext()

const UserContextProvider = ({ children }) => {
	function red(state, action) {
		switch (action.type) {
			case "LOGIN":
				const habits = {}
				// a slight optimization to access all habits in O(1) for future updates instead of using user.habits.find() O(N) for each operation
				if (action.payload.habits) {
					for (let habit of action.payload.habits) {
						habits[habit._id] = habit;
					}
				}

				action.payload.habits = habits

				return {
					...state,
					user: action.payload
				}
			case "LOGOUT":
				return {
					...state,
					user: false
				}
			case "SET_HABIT": {
				return {
					...state,
					user: {
						...state.user,
						habits: {
							...state.user.habits,
							[action.payload._id]: action.payload
						}
					}
				}
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