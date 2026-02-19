import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

const Login = () => {
    const { login } = useContext(AppContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validate = () => {
        if (!form.email.trim()) { toast.error("Email is required"); return false; }
        if (!form.password) { toast.error("Password is required"); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate() || loading) return;

        setLoading(true);
        try {
            const response = await axiosConfig.post(API_ENDPOINTS.LOGIN, {
                // FIX: normalize email to lowercase before sending
                // Prevents "Lakshayajain93@gmail.com" vs "lakshayajain93@gmail.com" mismatch
                email: form.email.toLowerCase().trim(),
                password: form.password,
            });

            const { token, user } = response.data;
            login(user, token);
            toast.success(`Welcome back, ${user.fullName || "User"}!`);
            navigate("/dashboard");

        } catch (error) {
            const message = error.response?.data?.message || "Login failed. Please try again.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">💰</div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
                    <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="input"
                            autoComplete="email"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="input pr-10"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="add-btn w-full flex items-center justify-center gap-2"
                    >
                        {loading && <LoaderCircle size={16} className="animate-spin" />}
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="text-purple-600 font-medium hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;