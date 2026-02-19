import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { CheckCircle, XCircle, LoaderCircle } from "lucide-react";

/**
 * Account activation page.
 * User lands here after clicking the email activation link:
 *   https://your-frontend.com/activate?token=<UUID>
 *
 * The page calls GET /activate?token=<UUID> and shows result.
 */
const Activate = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [status, setStatus] = useState("loading"); // loading | success | error
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No activation token found in the URL. Please check your email link.");
            return;
        }

        const activate = async () => {
            try {
                const response = await axiosConfig.get(API_ENDPOINTS.ACTIVATE, {
                    params: { token },
                });
                setStatus("success");
                setMessage(response.data?.message || "Account activated successfully!");
            } catch (err) {
                setStatus("error");
                setMessage(
                    err.response?.data?.message
                    || "Activation failed. The link may have already been used or expired."
                );
            }
        };

        activate();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">

                {/* Loading */}
                {status === "loading" && (
                    <>
                        <LoaderCircle
                            size={56}
                            className="mx-auto text-purple-500 animate-spin mb-4"
                        />
                        <h2 className="text-xl font-semibold text-gray-700">Activating your account…</h2>
                        <p className="text-gray-400 text-sm mt-2">Please wait a moment.</p>
                    </>
                )}

                {/* Success */}
                {status === "success" && (
                    <>
                        <CheckCircle
                            size={56}
                            className="mx-auto text-green-500 mb-4"
                        />
                        <h2 className="text-xl font-semibold text-gray-800">Account Activated!</h2>
                        <p className="text-gray-500 text-sm mt-2 mb-6">{message}</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="add-btn w-full"
                        >
                            Go to Login
                        </button>
                    </>
                )}

                {/* Error */}
                {status === "error" && (
                    <>
                        <XCircle
                            size={56}
                            className="mx-auto text-red-400 mb-4"
                        />
                        <h2 className="text-xl font-semibold text-gray-800">Activation Failed</h2>
                        <p className="text-gray-500 text-sm mt-2 mb-6">{message}</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="add-btn w-full"
                        >
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Activate;