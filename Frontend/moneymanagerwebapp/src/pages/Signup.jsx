import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {assets} from "../assets/assets.js";
import Input from "../components/Input.jsx";
import {validateEmail} from "../util/validation.js";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import {LoaderCircle} from "lucide-react";
import ProfilePhotoSelector from "../components/ProfilePhotoSelector.jsx";
import uploadProfileImage from "../util/uploadProfileImage.js";
import Header from "../components/Header.jsx";

const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        let profileImageUrl = "";
        setIsLoading(true);

        // Basic validation
        if (!firstName.trim()) {
            setError("Please enter your first name");
            setIsLoading(false);
            return;
        }
        if (!lastName.trim()) {
            setError("Please enter your last name");
            setIsLoading(false);
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            setIsLoading(false);
            return;
        }
        if (!password.trim()) {
            setError("Please enter your password");
            setIsLoading(false);
            return;
        }
        if (password.trim().length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }
        setError("");

        try {
            if (profilePhoto) {
                if (typeof profilePhoto === "string") {
                    profileImageUrl = profilePhoto;
                } else {
                    const imageUrl = await uploadProfileImage(profilePhoto);
                    profileImageUrl = imageUrl || "";
                }
            }

            // Join first + last name before sending to backend
            const fullName = `${firstName.trim()} ${lastName.trim()}`;

            const response = await axiosConfig.post(API_ENDPOINTS.REGISTER, {
                fullName,
                email: email.toLowerCase(),
                password,
                profileImageUrl,
            });

            if (response.status === 201) {
                toast.success("Account created! Please check your email to activate your account.");
                navigate("/login");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col">
            <Header />
            <div className="flex-grow w-full relative flex items-center justify-center overflow-hidden">
                {/* Background image with blur */}
                <img
                    src={assets.login_bg}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover filter blur-sm"
                />
                <div className="relative z-10 w-full max-w-lg px-6">
                    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-semibold text-black text-center mb-2">
                            Create An Account
                        </h3>
                        <p className="text-sm text-slate-700 text-center mb-6">
                            Start tracking your spendings by joining with us.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Profile photo / avatar selector */}
                            <ProfilePhotoSelector
                                image={profilePhoto}
                                setImage={setProfilePhoto}
                            />

                            <div className="flex flex-col gap-4">
                                {/* First Name & Last Name side by side */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        label="First Name"
                                        placeholder="John"
                                        type="text"
                                    />
                                    <Input
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        label="Last Name"
                                        placeholder="Doe"
                                        type="text"
                                    />
                                </div>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    label="Email Address"
                                    placeholder="name@example.com"
                                    type="text"
                                />
                                <Input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    label="Password"
                                    placeholder="Min. 6 characters"
                                    type="password"
                                />
                            </div>

                            {error && (
                                <p className="text-red-800 text-sm text-center bg-red-50 p-2 rounded">
                                    {error}
                                </p>
                            )}

                            <button
                                disabled={isLoading}
                                className={`btn-primary w-full py-3 text-lg font-medium flex items-center justify-center gap-2 ${
                                    isLoading ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                                type="submit"
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderCircle className="animate-spin w-5 h-5" />
                                        Creating Account...
                                    </>
                                ) : (
                                    "SIGN UP"
                                )}
                            </button>

                            <p className="text-sm text-center text-slate-700 mt-3">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-medium text-purple-900 underline hover:text-purple-700"
                                >
                                    Login
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;