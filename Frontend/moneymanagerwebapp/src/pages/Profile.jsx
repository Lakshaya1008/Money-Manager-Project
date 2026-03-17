import { useContext, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";
import { AppContext } from "../context/AppContext.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import { LoaderCircle, Mail, Calendar, User, Lock, Pencil, X } from "lucide-react";
import ProfilePhotoSelector from "../components/ProfilePhotoSelector.jsx";
import uploadProfileImage from "../util/uploadProfileImage.js";
import { formatDateFull } from "../util/util.js";

// Local modal — simpler than the shared Modal component, used only on this page
const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X size={20} />
                </button>
            </div>
            {children}
        </div>
    </div>
);

const Profile = () => {
    useUser();
    const { user, updateUser } = useContext(AppContext);

    const [modal, setModal] = useState(null); // null | "photo" | "name" | "password"
    const closeModal = () => setModal(null);

    // ── Photo ──────────────────────────────────────────────────────────────
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoLoading, setPhotoLoading] = useState(false);

    const handleSavePhoto = async (e) => {
        e.preventDefault();
        if (!profilePhoto) return;
        setPhotoLoading(true);
        try {
            const profileImageUrl = typeof profilePhoto === "string"
                ? profilePhoto
                : ((await uploadProfileImage(profilePhoto)) || user?.profileImageUrl || "");
            const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_PROFILE, {
                fullName: user?.fullName,
                profileImageUrl,
            });
            if (response.status === 200) {
                updateUser({ ...user, ...response.data });
                setProfilePhoto(null);
                toast.success("Profile photo updated!");
                closeModal();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update photo");
        } finally {
            setPhotoLoading(false);
        }
    };

    // ── Name — single fullName field ───────────────────────────────────────
    // FIXED: replaced fragile firstName + lastName split with a single fullName field.
    // The split was breaking single-word names ("Madonna" → lastName required but empty)
    // and multi-part names ("Mary Jane Watson" → lost "Watson" on save).
    // FIXED: replaced moment(user.createdAt).format("DD MMM YYYY") with formatDateFull()
    // from util.js — eliminates the moment.js dependency on this page.
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [nameLoading, setNameLoading] = useState(false);

    const openNameModal = () => {
        setFullName(user?.fullName || "");
        setModal("name");
    };

    const handleSaveName = async (e) => {
        e.preventDefault();
        if (!fullName.trim()) { toast.error("Name cannot be empty"); return; }
        setNameLoading(true);
        try {
            const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_NAME, { fullName: fullName.trim() });
            if (response.status === 200) {
                updateUser({ ...user, fullName: fullName.trim() });
                toast.success("Name updated successfully!");
                closeModal();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update name");
        } finally {
            setNameLoading(false);
        }
    };

    // ── Password ───────────────────────────────────────────────────────────
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    const openPasswordModal = () => {
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
        setModal("password");
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword.trim())            { toast.error("Please enter your current password"); return; }
        if (newPassword.length < 6)         { toast.error("New password must be at least 6 characters"); return; }
        if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
        setPasswordLoading(true);
        try {
            const response = await axiosConfig.put(API_ENDPOINTS.CHANGE_PASSWORD, { oldPassword, newPassword });
            if (response.status === 200) {
                toast.success("Password changed successfully!");
                closeModal();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const inputClass = "w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent";

    return (
        <Dashboard activeMenu="Profile">
            <div className="my-5 mx-auto max-w-2xl space-y-5">
                <h2 className="text-2xl font-semibold">My Profile</h2>

                <div className="card flex flex-col items-center gap-4 py-8">
                    {/* Avatar */}
                    <div className="relative group cursor-pointer" onClick={() => setModal("photo")}>
                        <img
                            src={user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName}`}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-100"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Pencil size={18} className="text-white" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <p className="text-xl font-semibold text-gray-800">{user?.fullName}</p>
                        <button onClick={openNameModal} className="text-gray-400 hover:text-purple-600 transition-colors cursor-pointer" title="Edit name">
                            <Pencil size={15} />
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 w-full mt-1">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg">
                            <Mail size={15} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg">
                            <Calendar size={15} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">Member Since</p>
                                <p className="text-sm font-medium text-gray-700">
                                    {formatDateFull(user?.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={openPasswordModal}
                        className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 border border-purple-100 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer mt-1"
                    >
                        <Lock size={14} /> Change Password
                    </button>
                </div>
            </div>

            {/* Modal: Change Photo */}
            {modal === "photo" && (
                <Modal title="Update Profile Photo" onClose={closeModal}>
                    <form onSubmit={handleSavePhoto} className="space-y-5">
                        <div className="flex justify-center">
                            <ProfilePhotoSelector image={profilePhoto} setImage={setProfilePhoto} currentImageUrl={user?.profileImageUrl} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
                            <button type="submit" disabled={!profilePhoto || photoLoading} className={`add-btn px-6 flex items-center gap-2 ${!profilePhoto || photoLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
                                {photoLoading ? <><LoaderCircle size={15} className="animate-spin" /> Saving...</> : "Save Photo"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal: Update Name — single fullName field */}
            {modal === "name" && (
                <Modal title="Update Name" onClose={closeModal}>
                    <form onSubmit={handleSaveName} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                                       className={inputClass} placeholder="e.g., John Doe" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
                            <button type="submit" disabled={nameLoading} className={`add-btn px-6 flex items-center gap-2 ${nameLoading ? "opacity-60 cursor-not-allowed" : ""}`}>
                                {nameLoading ? <><LoaderCircle size={15} className="animate-spin" /> Saving...</> : "Save Name"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal: Change Password */}
            {modal === "password" && (
                <Modal title="Change Password" onClose={closeModal}>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        {[
                            { label: "Current Password", value: oldPassword, setter: setOldPassword, placeholder: "Your current password" },
                            { label: "New Password",     value: newPassword, setter: setNewPassword, placeholder: "Min. 6 characters" },
                            { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword, placeholder: "Repeat new password" },
                        ].map(({ label, value, setter, placeholder }) => (
                            <div key={label}>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="password" value={value} onChange={(e) => setter(e.target.value)} className={inputClass} placeholder={placeholder} />
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
                            <button type="submit" disabled={passwordLoading} className={`add-btn px-6 flex items-center gap-2 ${passwordLoading ? "opacity-60 cursor-not-allowed" : ""}`}>
                                {passwordLoading ? <><LoaderCircle size={15} className="animate-spin" /> Changing...</> : "Change Password"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </Dashboard>
    );
};

export default Profile;