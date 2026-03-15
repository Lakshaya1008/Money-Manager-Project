import {useContext} from "react";
import {AppContext} from "../context/AppContext.jsx";
import {User} from "lucide-react";
import {SIDE_BAR_DATA} from "../assets/assets.js";
import {useNavigate} from "react-router-dom";

// onNavigate — optional callback called after navigating (used by mobile drawer to close itself)
const Sidebar = ({activeMenu, onNavigate}) => {
    const {user} = useContext(AppContext);
    const navigate = useNavigate();

    const handleNav = (path) => {
        navigate(path);
        if (onNavigate) onNavigate();
    };

    return (
        <div className="w-64 h-[calc(100vh-61px)] bg-white border-gray-200/50 p-5 sticky top-[61px] z-20">
            <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
                {user?.profileImageUrl ? (
                    <img src={user?.profileImageUrl || ""} alt="profile image" className="w-20 h-20 bg-slate-400 rounded-full" />
                ) : (
                    <User className="w-20 h-20 text-xl" />
                )}
                <h5 className="text-gray-950 font-medium leading-6">{user?.fullName || ""}</h5>
            </div>
            {SIDE_BAR_DATA.map((item, index) => (
                <button
                    onClick={() => handleNav(item.path)}
                    key={`menu_${index}`}
                    className={`cursor-pointer w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 ${activeMenu == item.label ? "text-white bg-purple-800" : ""}`}>
                    <item.icon className="text-xl" />
                    {item.label}
                </button>
            ))}
        </div>
    );
};

export default Sidebar;