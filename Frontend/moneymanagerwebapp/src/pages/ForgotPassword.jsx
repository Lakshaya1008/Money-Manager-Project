import {useState} from "react";
import {Link} from "react-router-dom";
import {assets} from "../assets/assets.js";
import Input from "../components/Input.jsx";
import {validateEmail} from "../util/validation.js";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import {LoaderCircle, MailCheck} from "lucide-react";
import Header from "../components/Header.jsx";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }
        setError("");
        setIsLoading(true);
        try {
            await axiosConfig.post(API_ENDPOINTS.FORGOT_PASSWORD, {
                email: email.toLowerCase().trim()
            });
            setSubmitted(true);
        } catch {
            // Even on error show success — don't reveal if email exists
            setSubmitted(true);
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

                        {submitted ? (
                            /* ── Success state ── */
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                    <MailCheck size={32} className="text-green-600" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800">Check your email</h3>
                                <p className="text-sm text-slate-600">
                                    If an account with <span className="font-medium">{email}</span> exists,
                                    we've sent a password reset link. Check your inbox (and spam folder).
                                </p>
                                <p className="text-xs text-gray-400">The link expires in 1 hour.</p>
                                <Link
                                    to="/login"
                                    className="mt-2 text-sm font-medium text-purple-700 hover:underline"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        ) : (
                            /* ── Form state ── */
                            <>
                                <h3 className="text-2xl font-semibold text-black text-center mb-2">
                                    Forgot Password
                                </h3>
                                <p className="text-sm text-slate-700 text-center mb-8">
                                    Enter your email and we'll send you a reset link
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        label="Email Address"
                                        placeholder="name@example.com"
                                        type="text"
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
                                            <><LoaderCircle className="animate-spin w-5 h-5" /> Sending...</>
                                        ) : "Send Reset Link"}
                                    </button>

                                    <p className="text-sm text-slate-800 text-center">
                                        Remembered it?{" "}
                                        <Link to="/login" className="font-medium text-purple-900 underline">
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

export default ForgotPassword;