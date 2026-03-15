import {useState} from "react";
import PropTypes from "prop-types";
import EmojiPickerPopup from "./EmojiPickerPopup.jsx";
import {Link} from "react-router-dom";

const AddIncomeForm = ({onAddIncome, categories = []}) => {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [date, setDate] = useState("");
    const [icon, setIcon] = useState("");

    // Fixed: handleSubmit is now async and awaits the parent's onAddIncome call.
    // Form only resets if the parent returns true (success). Previously it reset
    // immediately regardless of outcome, losing the user's input on backend errors.
    const handleSubmit = async (e) => {
        e.preventDefault();

        const incomeData = {
            name: name.trim(),
            amount: parseFloat(amount),
            categoryId: parseInt(categoryId),
            date: date || undefined,
            icon: icon || undefined
        };

        const success = await onAddIncome(incomeData);

        if (success) {
            setName("");
            setAmount("");
            setCategoryId("");
            setDate("");
            setIcon("");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Icon Picker */}
            <EmojiPickerPopup
                icon={icon}
                onSelect={setIcon}
            />

            {/* Income Name */}
            <div className="mb-4">
                <label htmlFor="incomeName" className="block text-sm font-medium text-gray-700 mb-2">
                    Income Name *
                </label>
                <input
                    type="text"
                    id="incomeName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., February Salary"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                />
            </div>

            {/* Category Selection */}
            <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                </label>
                {categories.length === 0 ? (
                    <div className="w-full px-4 py-3 border border-amber-200 bg-amber-50 rounded-lg text-sm text-amber-800">
                        No income categories yet.{" "}
                        <Link to="/category" className="font-medium underline hover:text-amber-900">
                            Create one on the Category page
                        </Link>{" "}
                        first, then come back to add income.
                    </div>
                ) : (
                    <select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Amount */}
            <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                </label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                />
            </div>

            {/* Date */}
            <div className="mb-6">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                </label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use current date and time
                </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="submit"
                    disabled={categories.length === 0}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add Income
                </button>
            </div>
        </form>
    );
};

AddIncomeForm.propTypes = {
    onAddIncome: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            icon: PropTypes.string,
        })
    ),
};

export default AddIncomeForm;