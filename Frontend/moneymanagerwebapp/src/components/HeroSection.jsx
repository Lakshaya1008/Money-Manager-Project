import {Link} from "react-router-dom";
import {TrendingUp, PieChart, Download} from "lucide-react";

const HeroSection = () => {
    return (
        <>
            {/* Hero */}
            <section className="text-center py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
                        Take Control of Your Finances
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-500">
                        Effortlessly track your income and expenses, visualise trends, and download reports — all in one place.
                    </p>
                    <div className="mt-8 flex justify-center">
                        {/* Fix: removed duplicate "Learn More" button that also linked to /signup.
                            One clear CTA converts better than two identical ones. */}
                        <Link
                            to="/signup"
                            className="bg-purple-600 text-white px-10 py-3.5 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-all shadow-md"
                        >
                            Start Tracking for Free
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features — gives users a reason to sign up before they see the screenshot */}
            <section className="pb-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                <TrendingUp size={22} className="text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Track Income</h3>
                            <p className="text-sm text-gray-500">Log every earning by category and see monthly trends on a live chart.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                                <PieChart size={22} className="text-red-500" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Manage Expenses</h3>
                            <p className="text-sm text-gray-500">Categorise spending, filter by date, and instantly see where your money goes.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                <Download size={22} className="text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Download Reports</h3>
                            <p className="text-sm text-gray-500">Export filtered income and expense reports as Excel files or receive them by email.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HeroSection;