import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import IncomeOverview from "../components/IncomeOverview.jsx";
import IncomeList from "../components/IncomeList.jsx";
import AddIncomeForm from "../components/AddIncomeForm.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { useUser } from "../hooks/useUser.jsx";
import Modal from "../components/Modal.jsx";
import toast from "react-hot-toast";

const Income = () => {
    useUser();

    const [incomeData, setIncomeData] = useState([]);
    // FIX: fetch INCOME categories so AddIncomeForm dropdown is populated
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);

    const fetchIncomeData = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_INCOME);
            setIncomeData(response.data || []);
        } catch (error) {
            console.error("Error fetching income data:", error);
            toast.error(error.response?.data?.message || "Failed to load income data");
        } finally {
            setLoading(false);
        }
    };

    // FIX: fetch categories filtered by INCOME type for the add form dropdown
    const fetchCategories = async () => {
        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.GET_CATEGORY_BY_TYPE("INCOME")
            );
            setCategories(response.data || []);
        } catch (error) {
            console.error("Error fetching income categories:", error);
        }
    };

    useEffect(() => {
        fetchIncomeData();
        fetchCategories();
    }, []);

    const handleAddIncome = async (income) => {
        if (!income.name?.trim()) {
            toast.error("Income name is required");
            return false;
        }
        if (!income.amount || Number(income.amount) <= 0) {
            toast.error("Amount must be greater than zero");
            return false;
        }
        if (!income.categoryId) {
            toast.error("Please select a category");
            return false;
        }

        try {
            const payload = {
                name: income.name.trim(),
                amount: income.amount,
                categoryId: income.categoryId,
                icon: income.icon || null,
                // date is optional — omit if empty (backend defaults to now)
                ...(income.date && { date: income.date }),
            };
            await axiosConfig.post(API_ENDPOINTS.ADD_INCOME, payload);
            setOpenAddModal(false);
            fetchIncomeData();
            toast.success("Income added successfully!");
            return true;
        } catch (error) {
            console.error("Error adding income:", error);
            toast.error(error.response?.data?.message || "Failed to add income");
            return false;
        }
    };

    const handleDeleteIncome = async (incomeId) => {
        try {
            await axiosConfig.delete(API_ENDPOINTS.DELETE_INCOME(incomeId));
            fetchIncomeData();
            toast.success("Income deleted successfully!");
        } catch (error) {
            console.error("Error deleting income:", error);
            toast.error(error.response?.data?.message || "Failed to delete income");
        }
    };

    // FIX: email/download handlers were missing — IncomeList was never rendered
    const handleDownloadExcel = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.DOWNLOAD_INCOME_EXCEL, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "income_report.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Income report downloaded!");
        } catch (error) {
            console.error("Error downloading income excel:", error);
            toast.error(error.response?.data?.message || "Failed to download report");
        }
    };

    const handleEmailReport = async () => {
        try {
            await axiosConfig.get(API_ENDPOINTS.EMAIL_INCOME_EXCEL);
            toast.success("Income report sent to your email!");
        } catch (error) {
            console.error("Error emailing income report:", error);
            toast.error(error.response?.data?.message || "Failed to send email report");
        }
    };

    return (
        <Dashboard activeMenu="Income">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    {/* Chart + Add button */}
                    <IncomeOverview
                        transactions={incomeData}
                        onAddIncome={() => setOpenAddModal(true)}
                    />

                    {/* FIX: IncomeList was never rendered — no list, no email/download buttons */}
                    <IncomeList
                        transactions={incomeData}
                        onDelete={handleDeleteIncome}
                        onDownload={handleDownloadExcel}
                        onEmail={handleEmailReport}
                    />

                    {/* Add Income Modal */}
                    <Modal
                        isOpen={openAddModal}
                        onClose={() => setOpenAddModal(false)}
                        title="Add Income"
                    >
                        {/* FIX: categories prop was missing → dropdown always empty */}
                        <AddIncomeForm
                            onAddIncome={handleAddIncome}
                            categories={categories}
                        />
                    </Modal>
                </div>
            </div>
        </Dashboard>
    );
};

export default Income;