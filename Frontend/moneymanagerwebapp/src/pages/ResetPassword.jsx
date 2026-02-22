import {useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {assets} from "../assets/assets.js";
import Input from "../components/Input.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import {LoaderCircle, CheckCircle, XCircle} from "lucide-react";
import Header from "../components/Header.jsx";
import toast from "react-hot-toast";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // No token in URL — show error immediately
    if (!token) {
        return (
            <div className="h-screen w-full flex flex-col">
                <Header />
                <div className="flex-grow w-full relative flex items-center justify-center overflow-hidden">
                    <img src={assets.login_bg} alt="Background"
                         className="absolute inset-0 w-full h-full object-cover filter blur-sm" />
                    <div className="relative z-10 w-full max-w-md px-6">
                        <div className="bg-white bg-opacity-95 rounded-lg shadow-2xl p-8 text-center space-y-4">
                            <XCircle size={48} className="text-red-500 mx-auto" />
                            <h3 className="text-xl font-semibold text-gray-800">Invalid Reset Link</h3>
                            <p className="text-sm text-gray-500">This link is invalid or missing the reset token.</p>
                            <Link to="/forgot-password" className="block text-sm font-medium text-purple-700 hover:underline">
                                Request a new reset link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        setIsLoading(true);
        try {
            await axiosConfig.post(API_ENDPOINTS.RESET_PASSWORD, {
                token,
                newPassword,
            });
            setSuccess(true);
            toast.success("Password reset successfully!");
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            setError(err.response?.data?.message || "This link has expired or is invalid. Please request a new one.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col">
            <Header />
            <div className="flex-grow w-full relative flex items-center justify-center overflow-hidden">
                <img src={assets.login_bg} alt="Background"
                     className="absolute inset-0 w-full h-full object-cover filter blur-sm" />

                <div className="relative z-10 w-full max-w-md px-6">
                    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-2xl p-8">

                        {success ? (
                            /* ── Success state ── */
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800">Password Reset!</h3>
                                <p className="text-sm text-slate-600">
                                    Your password has been reset successfully. Redirecting you to login...
                                </p>
                            </div>
                        ) : (
                            /* ── Form state ── */
                            <>
                                <h3 className="text-2xl font-semibold text-black text-center mb-2">
                                    Reset Password
                                </h3>
                                <p className="text-sm text-slate-700 text-center mb-8">
                                    Enter your new password below
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        label="New Password"
                                        placeholder="Min. 6 characters"
                                        type="password"
                                    />
                                    <Input
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        label="Confirm New Password"
                                        placeholder="Repeat new password"
                                        type="password"
                                    />

                                    {error && (
                                        <p className="text-red-800 text-sm text-center bg-red-50 p-2 rounded">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        disabled={isLoading}
                                        type="submit"
                                        className={`btn-primary w-full py-3 text-lg font-medium flex items-center justify-center gap-2 ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                                    >
                                        {isLoading ? (
                                            <><LoaderCircle className="animate-spin w-5 h-5" /> Resetting...</>
                                        ) : "Reset Password"}
                                    </button>

                                    <p className="text-sm text-slate-800 text-center">
                                        <Link to="/forgot-password" className="text-purple-700 hover:underline">
                                            Request a new link
                                        </Link>
                                        {" · "}
                                        <Link to="/login" className="text-purple-700 hover:underline">
                                            Back to Login
                                        </Link>
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;