import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Income from "./pages/Income.jsx";
import Expense from "./pages/Expense.jsx";
import Profile from "./pages/Profile.jsx";
import Activate from "./pages/Activate.jsx";
import Category from "./pages/Category.jsx";
import Filter from "./pages/Filter.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import {useAppContext} from "./context/AppContext.jsx";
import {Toaster} from "react-hot-toast";

// Root: if logged in → dashboard, else → landing page (matches original behaviour)
const Root = () => {
    const {token} = useAppContext();
    return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/home" replace />;
};

const ProtectedRoute = ({children}) => {
    const {token} = useAppContext();
    if (!token) return <Navigate to="/login" replace />;
    return children;
};

const PublicRoute = ({children}) => {
    const {token} = useAppContext();
    if (token) return <Navigate to="/dashboard" replace />;
    return children;
};

const App = () => {
    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {fontSize: "14px"},
                }}
            />
            <Routes>
                {/* Root — smart redirect */}
                <Route path="/" element={<Root />} />

                {/* Landing page (public) */}
                <Route path="/home" element={<LandingPage />} />

                {/* Auth pages */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    }
                />

                {/* Email activation — no auth required */}
                <Route path="/activate" element={<Activate />} />

                {/* Protected routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/income"
                    element={
                        <ProtectedRoute>
                            <Income />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/expense"
                    element={
                        <ProtectedRoute>
                            <Expense />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/category"
                    element={
                        <ProtectedRoute>
                            <Category />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/filter"
                    element={
                        <ProtectedRoute>
                            <Filter />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;