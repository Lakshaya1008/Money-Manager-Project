import Dashboard from "../components/Dashboard.jsx";
import {useUser} from "../hooks/useUser.jsx";
import InfoCard from "../components/InfoCard.jsx";
import {Coins, Wallet, WalletCards} from "lucide-react";
import {addThousandsSeparator} from "../util/util.js";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import RecentTransactions from "../components/RecentTransactions.jsx";
import FinanceOverview from "../components/FinanceOverview.jsx";
import Transactions from "../components/Transactions.jsx";

// Skeleton pulse card shown while dashboard data is loading.
// Prevents the jarring ₹0 flash that users see before data arrives.
const InfoCardSkeleton = () => (
    <div className="flex gap-6 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 animate-pulse">
        <div className="w-14 h-14 rounded-full bg-gray-200" />
        <div className="flex-1 py-1">
            <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-6 bg-gray-200 rounded w-32" />
        </div>
    </div>
);

const Home = () => {
    useUser();

    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchDashboardData = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.DASHBOARD_DATA);
            if (response.status === 200) {
                setDashboardData(response.data);
            }
        } catch {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div>
            <Dashboard activeMenu="Dashboard">
                <div className="my-5 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Fix: show skeleton cards while loading instead of ₹0 */}
                        {loading || !dashboardData ? (
                            <>
                                <InfoCardSkeleton />
                                <InfoCardSkeleton />
                                <InfoCardSkeleton />
                            </>
                        ) : (
                            <>
                                <InfoCard
                                    icon={<WalletCards />}
                                    label="Total Balance"
                                    value={addThousandsSeparator(dashboardData.totalBalance)}
                                    color="bg-purple-800"
                                />
                                <InfoCard
                                    icon={<Wallet />}
                                    label="Total Income"
                                    value={addThousandsSeparator(dashboardData.totalIncome)}
                                    color="bg-green-800"
                                />
                                <InfoCard
                                    icon={<Coins />}
                                    label="Total Expense"
                                    value={addThousandsSeparator(dashboardData.totalExpense)}
                                    color="bg-red-800"
                                />
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <RecentTransactions
                            transactions={dashboardData?.recentTransactions}
                            onMore={() => navigate("/expense")}
                        />

                        <FinanceOverview
                            totalBalance={dashboardData?.totalBalance || 0}
                            totalIncome={dashboardData?.totalIncome || 0}
                            totalExpense={dashboardData?.totalExpense || 0}
                        />

                        <Transactions
                            transactions={dashboardData?.recent5Expenses || []}
                            onMore={() => navigate("/expense")}
                            type="expense"
                            title="Recent Expenses"
                        />

                        <Transactions
                            transactions={dashboardData?.recent5Incomes || []}
                            onMore={() => navigate("/income")}
                            type="income"
                            title="Recent Incomes"
                        />
                    </div>
                </div>
            </Dashboard>
        </div>
    );
};

export default Home;