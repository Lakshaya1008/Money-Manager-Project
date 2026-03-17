import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import IncomeOverview from "../components/IncomeOverview.jsx";
import IncomeList from "../components/IncomeList.jsx";
import AddIncomeForm from "../components/AddIncomeForm.jsx";
import EditIncomeForm from "../components/EditIncomeForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { useUser } from "../hooks/useUser.jsx";
import Modal from "../components/Modal.jsx";
import toast from "react-hot-toast";

const Income = () => {
    useUser();

    const [incomeData, setIncomeData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [editModal, setEditModal] = useState({ show: false, income: null });
    const [deleteAlert, setDeleteAlert] = useState({ show: false, income: null });

    const fetchIncomeData = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_INCOME);
            setIncomeData(response.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load income data");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_CATEGORY_BY_TYPE("INCOME"));
            setCategories(response.data || []);
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchIncomeData();
        fetchCategories();
    }, []);

    const handleAddIncome = async (income) => {
        if (!income.name?.trim()) { toast.error("Income name is required"); return false; }
        if (!income.amount || Number(income.amount) <= 0) { toast.error("Amount must be greater than zero"); return false; }
        if (!income.categoryId) { toast.error("Please select a category"); return false; }
        try {
            await axiosConfig.post(API_ENDPOINTS.ADD_INCOME, {
                name: income.name.trim(),
                amount: income.amount,
                categoryId: income.categoryId,
                icon: income.icon || null,
                ...(income.date && { date: income.date }),
            });
            setOpenAddModal(false);
            fetchIncomeData();
            toast.success("Income added successfully!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add income");
            return false;
        }
    };

    const handleEditIncome = async (updatedData) => {
        if (!updatedData.name?.trim()) { toast.error("Income name is required"); return; }
        if (!updatedData.amount || Number(updatedData.amount) <= 0) { toast.error("Amount must be greater than zero"); return; }
        if (!updatedData.categoryId) { toast.error("Please select a category"); return; }
        try {
            await axiosConfig.put(API_ENDPOINTS.UPDATE_INCOME(editModal.income.id), updatedData);
            setEditModal({ show: false, income: null });
            fetchIncomeData();
            toast.success("Income updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update income");
        }
    };

    const confirmDeleteIncome = (incomeId) => {
        setDeleteAlert({ show: true, income: incomeData.find((i) => i.id === incomeId) });
    };

    const executeDeleteIncome = async () => {
        if (!deleteAlert.income) return;
        try {
            await axiosConfig.delete(API_ENDPOINTS.DELETE_INCOME(deleteAlert.income.id));
            setDeleteAlert({ show: false, income: null });
            fetchIncomeData();
            toast.success("Income deleted successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete income");
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.DOWNLOAD_INCOME_EXCEL, { responseType: "blob" });
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
            await axiosConfig.get(API_ENDPOINTS.EMAIL_INCOME_EXCEL);
            toast.success("Income report sent to your email!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send email report");
        }
    };

    return (
        <Dashboard activeMenu="Income">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <IncomeOverview transactions={incomeData} onAddIncome={() => setOpenAddModal(true)} />

                    <IncomeList
                        transactions={incomeData}
                        onDelete={confirmDeleteIncome}
                        onEdit={(income) => setEditModal({ show: true, income })}
                        onDownload={handleDownloadExcel}
                        onEmail={handleEmailReport}
                        onAdd={() => setOpenAddModal(true)}
                    />

                    <Modal isOpen={openAddModal} onClose={() => setOpenAddModal(false)} title="Add Income">
                        <AddIncomeForm onAddIncome={handleAddIncome} categories={categories} />
                    </Modal>

                    <Modal
                        isOpen={editModal.show}
                        onClose={() => setEditModal({ show: false, income: null })}
                        title="Edit Income"
                    >
                        <EditIncomeForm
                            income={editModal.income}
                            onSave={handleEditIncome}
                            categories={categories}
                        />
                    </Modal>

                    <Modal
                        isOpen={deleteAlert.show}
                        onClose={() => setDeleteAlert({ show: false, income: null })}
                        title="Delete Income"
                    >
                        <DeleteAlert
                            content={`Are you sure you want to delete "${deleteAlert.income?.name}"? This cannot be undone.`}
                            onDelete={executeDeleteIncome}
                        />
                    </Modal>
                </div>
            </div>
        </Dashboard>
    );
};

export default Income;