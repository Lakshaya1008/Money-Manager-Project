import { createContext, useCallback, useContext, useState } from "react";
import PropTypes from "prop-types";

export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        try { return stored ? JSON.parse(stored) : null; }
        catch { return null; }
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("token") || null
    );

    // FIXED: wrapped in useCallback so these functions have stable references.
    // Without useCallback, every re-render of AppContextProvider creates new
    // function objects. useUser.jsx has [user, updateUser, clearUser, navigate]
    // in its useEffect dependency array — new references on every render caused
    // the effect to re-fire, triggering redundant GET /profile API calls.
    const login = useCallback((userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", jwtToken);
    }, []);

    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    }, []);

    const clearUser = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }, []);

    return (
        <AppContext.Provider value={{ user, token, login, updateUser, clearUser }}>
            {children}
        </AppContext.Provider>
    );
};

AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAppContext = () => useContext(AppContext);