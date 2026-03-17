import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import ExpenseOverview from "../components/ExpenseOverview.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import AddExpenseForm from "../components/AddExpenseForm.jsx";
import EditExpenseForm from "../components/EditExpenseForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { useUser } from "../hooks/useUser.jsx";
import Modal from "../components/Modal.jsx";
import toast from "react-hot-toast";

const Expense = () => {
    useUser();

    const [expenseData, setExpenseData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [editModal, setEditModal] = useState({ show: false, expense: null });
    const [deleteAlert, setDeleteAlert] = useState({ show: false, expense: null });

    const fetchExpenseData = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_EXPENSE);
            setExpenseData(response.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load expense data");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_CATEGORY_BY_TYPE("EXPENSE"));
            setCategories(response.data || []);
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchExpenseData();
        fetchCategories();
    }, []);

    const handleAddExpense = async (expense) => {
        if (!expense.name?.trim()) { toast.error("Expense name is required"); return false; }
        if (!expense.amount || Number(expense.amount) <= 0) { toast.error("Amount must be greater than zero"); return false; }
        if (!expense.categoryId) { toast.error("Please select a category"); return false; }
        try {
            await axiosConfig.post(API_ENDPOINTS.ADD_EXPENSE, {
                name: expense.name.trim(),
                amount: expense.amount,
                categoryId: expense.categoryId,
                icon: expense.icon || null,
                ...(expense.date && { date: expense.date }),
            });
            setOpenAddModal(false);
            fetchExpenseData();
            toast.success("Expense added successfully!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add expense");
            return false;
        }
    };

    const handleEditExpense = async (updatedData) => {
        if (!updatedData.name?.trim()) { toast.error("Expense name is required"); return; }
        if (!updatedData.amount || Number(updatedData.amount) <= 0) { toast.error("Amount must be greater than zero"); return; }
        if (!updatedData.categoryId) { toast.error("Please select a category"); return; }
        try {
            await axiosConfig.put(API_ENDPOINTS.UPDATE_EXPENSE(editModal.expense.id), updatedData);
            setEditModal({ show: false, expense: null });
            fetchExpenseData();
            toast.success("Expense updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update expense");
        }
    };

    const confirmDeleteExpense = (expenseId) => {
        setDeleteAlert({ show: true, expense: expenseData.find((e) => e.id === expenseId) });
    };

    const executeDeleteExpense = async () => {
        if (!deleteAlert.expense) return;
        try {
            await axiosConfig.delete(API_ENDPOINTS.DELETE_EXPENSE(deleteAlert.expense.id));
            setDeleteAlert({ show: false, expense: null });
            fetchExpenseData();
            toast.success("Expense deleted successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete expense");
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.DOWNLOAD_EXPENSE_EXCEL, { responseType: "blob" });
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
            if (error.response?.data instanceof Blob) {
                try {
                    const json = JSON.parse(await error.response.data.text());
                    toast.error(json.message || "Failed to download report");
                } catch { toast.error("Failed to download report"); }
            } else {
                toast.error(error.response?.data?.message || "Failed to download report");
            }
        }
    };

    const handleEmailReport = async () => {
        try {
            await axiosConfig.get(API_ENDPOINTS.EMAIL_EXPENSE_EXCEL);
            toast.success("Expense report sent to your email!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send email report");
        }
    };

    return (
        <Dashboard activeMenu="Expense">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <ExpenseOverview transactions={expenseData} onExpenseIncome={() => setOpenAddModal(true)} />

                    <ExpenseList
                        transactions={expenseData}
                        onDelete={confirmDeleteExpense}
                        onEdit={(expense) => setEditModal({ show: true, expense })}
                        onDownload={handleDownloadExcel}
                        onEmail={handleEmailReport}
                        onAdd={() => setOpenAddModal(true)}
                    />

                    <Modal isOpen={openAddModal} onClose={() => setOpenAddModal(false)} title="Add Expense">
                        <AddExpenseForm onAddExpense={handleAddExpense} categories={categories} />
                    </Modal>

                    <Modal
                        isOpen={editModal.show}
                        onClose={() => setEditModal({ show: false, expense: null })}
                        title="Edit Expense"
                    >
                        <EditExpenseForm
                            expense={editModal.expense}
                            onSave={handleEditExpense}
                            categories={categories}
                        />
                    </Modal>

                    <Modal
                        isOpen={deleteAlert.show}
                        onClose={() => setDeleteAlert({ show: false, expense: null })}
                        title="Delete Expense"
                    >
                        <DeleteAlert
                            content={`Are you sure you want to delete "${deleteAlert.expense?.name}"? This cannot be undone.`}
                            onDelete={executeDeleteExpense}
                        />
                    </Modal>
                </div>
            </div>
        </Dashboard>
    );
};

export default Expense;