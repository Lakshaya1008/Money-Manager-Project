import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import ExpenseOverview from "../components/ExpenseOverview.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import AddExpenseForm from "../components/AddExpenseForm.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { useUser } from "../hooks/useUser.jsx";
import Modal from "../components/Modal.jsx";
import toast from "react-hot-toast";

const Expense = () => {
    useUser();

    const [expenseData, setExpenseData] = useState([]);
    // FIX: fetch EXPENSE categories so AddExpenseForm dropdown is populated
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);

    const fetchExpenseData = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_EXPENSE);
            setExpenseData(response.data || []);
        } catch (error) {
            console.error("Error fetching expense data:", error);
            toast.error(error.response?.data?.message || "Failed to load expense data");
        } finally {
            setLoading(false);
        }
    };

    // FIX: fetch categories filtered by EXPENSE type for the add form dropdown
    const fetchCategories = async () => {
        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.GET_CATEGORY_BY_TYPE("EXPENSE")
            );
            setCategories(response.data || []);
        } catch (error) {
            console.error("Error fetching expense categories:", error);
        }
    };

    useEffect(() => {
        fetchExpenseData();
        fetchCategories();
    }, []);

    const handleAddExpense = async (expense) => {
        if (!expense.name?.trim()) {
            toast.error("Expense name is required");
            return false;
        }
        if (!expense.amount || Number(expense.amount) <= 0) {
            toast.error("Amount must be greater than zero");
            return false;
        }
        if (!expense.categoryId) {
            toast.error("Please select a category");
            return false;
        }

        try {
            const payload = {
                name: expense.name.trim(),
                amount: expense.amount,
                categoryId: expense.categoryId,
                icon: expense.icon || null,
                // date is optional — omit if empty (backend defaults to now)
                ...(expense.date && { date: expense.date }),
            };
            await axiosConfig.post(API_ENDPOINTS.ADD_EXPENSE, payload);
            setOpenAddModal(false);
            fetchExpenseData();
            toast.success("Expense added successfully!");
            return true;
        } catch (error) {
            console.error("Error adding expense:", error);
            toast.error(error.response?.data?.message || "Failed to add expense");
            return false;
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        try {
            await axiosConfig.delete(API_ENDPOINTS.DELETE_EXPENSE(expenseId));
            fetchExpenseData();
            toast.success("Expense deleted successfully!");
        } catch (error) {
            console.error("Error deleting expense:", error);
            toast.error(error.response?.data?.message || "Failed to delete expense");
        }
    };

    // FIX: email/download handlers were missing — ExpenseList was never rendered
    const handleDownloadExcel = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.DOWNLOAD_EXPENSE_EXCEL, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "expense_report.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Expense report downloaded!");
        } catch (error) {
            console.error("Error downloading expense excel:", error);
            toast.error(error.response?.data?.message || "Failed to download report");
        }
    };

    const handleEmailReport = async () => {
        try {
            await axiosConfig.get(API_ENDPOINTS.EMAIL_EXPENSE_EXCEL);
            toast.success("Expense report sent to your email!");
        } catch (error) {
            console.error("Error emailing expense report:", error);
            toast.error(error.response?.data?.message || "Failed to send email report");
        }
    };

    return (
        <Dashboard activeMenu="Expense">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    {/* Chart + Add button
                        FIX: prop was onAddExpense but ExpenseOverview expects onExpenseIncome */}
                    <ExpenseOverview
                        transactions={expenseData}
                        onExpenseIncome={() => setOpenAddModal(true)}
                    />

                    {/* FIX: ExpenseList was never rendered — no list, no email/download buttons */}
                    <ExpenseList
                        transactions={expenseData}
                        onDelete={handleDeleteExpense}
                        onDownload={handleDownloadExcel}
                        onEmail={handleEmailReport}
                    />

                    {/* Add Expense Modal */}
                    <Modal
                        isOpen={openAddModal}
                        onClose={() => setOpenAddModal(false)}
                        title="Add Expense"
                    >
                        {/* FIX: categories prop was missing → dropdown always empty */}
                        <AddExpenseForm
                            onAddExpense={handleAddExpense}
                            categories={categories}
                        />
                    </Modal>
                </div>
            </div>
        </Dashboard>
    );
};

export default Expense;