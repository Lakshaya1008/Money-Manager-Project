import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(
        () => {
            const stored = localStorage.getItem("user");
            try {
                return stored ? JSON.parse(stored) : null;
            } catch {
                return null;
            }
        }
    );

    const [token, setToken] = useState(
        () => localStorage.getItem("token") || null
    );

    /**
     * Called after login — saves user + token to state and localStorage.
     */
    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", jwtToken);
    };

    /**
     * NEW — Called after profile update.
     * Syncs updated user object to both state and localStorage.
     */
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    /**
     * Called on logout — clears everything.
     */
    const clearUser = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AppContext.Provider value={{ user, token, login, updateUser, clearUser }}>
            {children}
        </AppContext.Provider>
    );
};

AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// Convenience hook
export const useAppContext = () => useContext(AppContext);