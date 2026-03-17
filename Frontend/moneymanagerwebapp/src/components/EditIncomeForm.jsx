import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import EmojiPickerPopup from "./EmojiPickerPopup.jsx";
import { Link } from "react-router-dom";

const EditIncomeForm = ({ income, onSave, categories = [] }) => {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [date, setDate] = useState("");
    const [icon, setIcon] = useState("");

    // Pre-fill form fields when the modal opens with an existing income record
    useEffect(() => {
        if (income) {
            setName(income.name || "");
            setAmount(income.amount?.toString() || "");
            setCategoryId(income.categoryId?.toString() || "");
            // ISO datetime → date-only string for the date input (yyyy-MM-dd)
            setDate(income.date ? income.date.split("T")[0] : "");
            setIcon(income.icon || "");
        }
    }, [income]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave({
            name: name.trim(),
            amount: parseFloat(amount),
            categoryId: parseInt(categoryId),
            date: date || undefined,
            icon: icon || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <EmojiPickerPopup icon={icon} onSelect={setIcon} />

            <div className="mb-4">
                <label htmlFor="editIncomeName" className="block text-sm font-medium text-gray-700 mb-2">
                    Income Name *
                </label>
                <input
                    type="text"
                    id="editIncomeName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., February Salary"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="editIncomeAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                </label>
                <input
                    type="number"
                    id="editIncomeAmount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="editIncomeCategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                </label>
                {categories.length === 0 ? (
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                        No income categories yet.{" "}
                        <Link to="/category" className="underline font-medium">Create one first →</Link>
                    </p>
                ) : (
                    <select
                        id="editIncomeCategory"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="mb-6">
                <label htmlFor="editIncomeDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                </label>
                <input
                    type="date"
                    id="editIncomeDate"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={categories.length === 0}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
};

EditIncomeForm.propTypes = {
    income: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        categoryId: PropTypes.number,
        date: PropTypes.string,
        icon: PropTypes.string,
    }),
    onSave: PropTypes.func.isRequired,
    categories: PropTypes.array,
};

export default EditIncomeForm;