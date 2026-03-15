import Menubar from "./Menubar.jsx";
import Sidebar from "./Sidebar.jsx";
import {useContext, useState} from "react";
import {AppContext} from "../context/AppContext.jsx";
import {X} from "lucide-react";

const Dashboard = ({children, activeMenu}) => {
    const {user} = useContext(AppContext);
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div>
            {/* Pass setDrawerOpen so Menubar can trigger the mobile drawer */}
            <Menubar activeMenu={activeMenu} onMenuClick={() => setDrawerOpen(true)} />

            {user && (
                <div className="flex">
                    {/* Desktop sidebar — hidden below 1080px */}
                    <div className="max-[1080px]:hidden">
                        <Sidebar activeMenu={activeMenu} />
                    </div>

                    {/* Mobile drawer overlay — shown below 1080px when drawerOpen */}
                    {drawerOpen && (
                        <div className="fixed inset-0 z-40 min-[1081px]:hidden">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black/40"
                                onClick={() => setDrawerOpen(false)}
                            />
                            {/* Drawer panel */}
                            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl z-50 flex flex-col">
                                {/* Close button */}
                                <div className="flex justify-end p-3 border-b border-gray-100">
                                    <button
                                        onClick={() => setDrawerOpen(false)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                {/* Sidebar content inside drawer — close drawer on nav */}
                                <div className="flex-1 overflow-y-auto">
                                    <Sidebar
                                        activeMenu={activeMenu}
                                        onNavigate={() => setDrawerOpen(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grow mx-5">{children}</div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;