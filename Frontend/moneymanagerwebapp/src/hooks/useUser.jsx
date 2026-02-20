import {useContext, useEffect} from "react";
import {AppContext} from "../context/AppContext.jsx";
import {useNavigate} from "react-router-dom";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";

export const useUser = () => {
    // FIX: AppContext does NOT export setUser — it exports updateUser.
    // Using setUser here causes "setUser is not a function" crash on every
    // protected page (Dashboard, Income, Expense, Category, Filter, Profile).
    const {user, updateUser, clearUser} = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            return;
        }

        let isMounted = true;

        const fetchUserInfo = async () => {
            try {
                const response = await axiosConfig.get(API_ENDPOINTS.GET_USER_INFO);

                if (isMounted && response.data) {
                    updateUser(response.data); // was setUser — which was undefined
                }

            }catch (error) {
                if (isMounted) {
                    clearUser();
                    navigate("/login");
                }
            }
        }

        fetchUserInfo();

        return () => {
            isMounted = false;
        }
    }, [user, updateUser, clearUser, navigate]);

}