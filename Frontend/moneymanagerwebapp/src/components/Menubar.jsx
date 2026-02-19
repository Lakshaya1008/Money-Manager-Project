import { useContext, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { User, LogOut, ChevronDown } from "lucide-react";

const Menubar = () => {
    const { user, clearUser } = useContext(AppContext);
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [imgError, setImgError] = useState(false);
    const dropdownRef = useRef(null);

    // Reset img error when user changes
    useEffect(() => { setImgError(false); }, [user?.profileImageUrl]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = () => {
        clearUser();
        navigate("/login");
    };

    const showAvatar = user?.profileImageUrl && !imgError;

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
            {/* Brand */}
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/dashboard")}
            >
                <span className="text-2xl">💰</span>
                <span className="text-lg font-bold text-gray-800 hidden sm:block">
                    Money Manager
                </span>
            </div>

            {/* User menu */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                               hover:bg-gray-50 transition-colors duration-150"
                >
                    {/* Avatar circle */}
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-purple-100
                                    flex items-center justify-center border border-purple-200 shrink-0">
                        {showAvatar ? (
                            <img
                                src={user.profileImageUrl}
                                alt={user?.fullName || "Profile"}
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <User size={20} className="text-purple-500" />
                        )}
                    </div>

                    <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[130px] truncate">
                        {user?.fullName || "User"}
                    </span>

                    <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-200 ${
                            showDropdown ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg
                                    border border-gray-100 py-1 z-50">

                        {/* Header — user info */}
                        <div className="px-4 py-2.5 border-b border-gray-50">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                                {user?.fullName}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>

                        {/* My Profile ← NEW */}
                        <button
                            onClick={() => { setShowDropdown(false); navigate("/profile"); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                                       text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <User size={15} className="text-gray-400" />
                            <span>My Profile</span>
                        </button>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                                       text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={15} className="text-red-400" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menubar;