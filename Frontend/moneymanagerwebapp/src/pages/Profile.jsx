import { useContext, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";
import { AppContext } from "../context/AppContext.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import { LoaderCircle, Mail, Calendar, User, Lock } from "lucide-react";
import ProfilePhotoSelector from "../components/ProfilePhotoSelector.jsx";
import uploadProfileImage from "../util/uploadProfileImage.js";
import moment from "moment";

// Helper: split "John Doe" → { firstName: "John", lastName: "Doe" }
const splitFullName = (fullName = "") => {
    const parts = fullName.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    return { firstName, lastName };
};

const Profile = () => {
    useUser();
    const { user, updateUser } = useContext(AppContext);

    // ── Photo section ──────────────────────────────────────────────
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoLoading, setPhotoLoading] = useState(false);

    // ── Name section ───────────────────────────────────────────────
    const { firstName: initFirst, lastName: initLast } = splitFullName(user?.fullName);
    const [firstName, setFirstName] = useState(initFirst);
    const [lastName, setLastName] = useState(initLast);
    const [nameLoading, setNameLoading] = useState(false);

    // ── Password section ───────────────────────────────────────────
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    // ── Save photo ─────────────────────────────────────────────────
    const handleSavePhoto = async (e) => {
        e.preventDefault();
        if (!profilePhoto) return;
        setPhotoLoading(true);
        try {
            let profileImageUrl = user?.profileImageUrl || "";
            if (typeof profilePhoto === "string") {
                profileImageUrl = profilePhoto;
            } else {
                const uploaded = await uploadProfileImage(profilePhoto);
                if (uploaded) profileImageUrl = uploaded;
            }
            const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_PROFILE, {
                fullName: user?.fullName,
                profileImageUrl,
            });
            if (response.status === 200) {
                updateUser({ ...user, ...response.data });
                setProfilePhoto(null);
                toast.success("Profile photo updated!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update photo");
        } finally {
            setPhotoLoading(false);
        }
    };

    // ── Save name ──────────────────────────────────────────────────
    const handleSaveName = async (e) => {
        e.preventDefault();
        if (!firstName.trim()) {
            toast.error("First name cannot be empty");
            return;
        }
        if (!lastName.trim()) {
            toast.error("Last name cannot be empty");
            return;
        }
        setNameLoading(true);
        try {
            const fullName = `${firstName.trim()} ${lastName.trim()}`;
            const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_NAME, { fullName });
            if (response.status === 200) {
                updateUser({ ...user, fullName });
                toast.success("Name updated successfully!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update name");
        } finally {
            setNameLoading(false);
        }
    };

    // ── Change password ────────────────────────────────────────────
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword.trim()) {
            toast.error("Please enter your current password");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        setPasswordLoading(true);
        try {
            const response = await axiosConfig.put(API_ENDPOINTS.CHANGE_PASSWORD, {
                oldPassword,
                newPassword,
            });
            if (response.status === 200) {
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                toast.success("Password changed successfully!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <Dashboard activeMenu="Profile">
            <div className="my-5 mx-auto max-w-2xl space-y-6">
                <h2 className="text-2xl font-semibold">My Profile</h2>

                {/* ── Section 1: Profile Photo ───────────────────── */}
                <div className="card">
                    <h5 className="text-base font-semibold mb-4 text-gray-700">Profile Photo</h5>
                    <form onSubmit={handleSavePhoto}>
                        <div className="flex flex-col items-center pb-4 border-b border-gray-100 mb-4">
                            <ProfilePhotoSelector
                                image={profilePhoto}
                                setImage={setProfilePhoto}
                                currentImageUrl={user?.profileImageUrl}
                            />
                        </div>
                        {/* Read-only info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail size={16} className="text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                                    <p className="text-sm text-gray-700 font-medium truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar size={16} className="text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Member Since</p>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {user?.createdAt ? moment(user.createdAt).format("DD MMM YYYY") : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!profilePhoto || photoLoading}
                                className={`add-btn flex items-center gap-2 px-6 ${
                                    !profilePhoto || photoLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {photoLoading ? (
                                    <><LoaderCircle size={16} className="animate-spin" /> Saving...</>
                                ) : (
                                    "Save Photo"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Section 2: Update Name ─────────────────────── */}
                <div className="card">
                    <h5 className="text-base font-semibold mb-1 text-gray-700">Update Name</h5>
                    <p className="text-xs text-gray-400 mb-4">Change how your name appears across the app</p>
                    <form onSubmit={handleSaveName} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                                   focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                        placeholder="John"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                                   focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={nameLoading}
                                className={`add-btn flex items-center gap-2 px-6 ${
                                    nameLoading ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                            >
                                {nameLoading ? (
                                    <><LoaderCircle size={16} className="animate-spin" /> Saving...</>
                                ) : (
                                    "Save Name"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Section 3: Change Password ─────────────────── */}
                <div className="card">
                    <h5 className="text-base font-semibold mb-1 text-gray-700">Change Password</h5>
                    <p className="text-xs text-gray-400 mb-4">Enter your current password then choose a new one</p>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                               focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    placeholder="Your current password"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                                   focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                                   focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className={`add-btn flex items-center gap-2 px-6 ${
                                    passwordLoading ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                            >
                                {passwordLoading ? (
                                    <><LoaderCircle size={16} className="animate-spin" /> Changing...</>
                                ) : (
                                    "Change Password"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </Dashboard>
    );
};

export default Profile;