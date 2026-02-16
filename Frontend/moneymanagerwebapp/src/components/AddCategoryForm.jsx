import {useState, useEffect} from "react";
import PropTypes from "prop-types";
import EmojiPickerPopup from "./EmojiPickerPopup.jsx";

const AddCategoryForm = ({onAddCategory, initialCategoryData, isEditing = false}) => {
    const [name, setName] = useState("");
    const [type, setType] = useState("INCOME"); // ✅ UPPERCASE for API
    const [icon, setIcon] = useState("");

    useEffect(() => {
        if (initialCategoryData) {
            setName(initialCategoryData.name || "");
            setType(initialCategoryData.type || "INCOME");
            setIcon(initialCategoryData.icon || "");
        }
    }, [initialCategoryData]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const categoryData = {
            name: name.trim(),
            type, // Will be "INCOME" or "EXPENSE" in UPPERCASE
            icon
        };

        // If editing, include the ID
        if (isEditing && initialCategoryData?.id) {
            categoryData.id = initialCategoryData.id;
        }

        onAddCategory(categoryData);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Icon Picker */}
            <EmojiPickerPopup
                icon={icon}
                onSelect={setIcon}
            />

            {/* Category Name */}
            <div className="mb-4">
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                </label>
                <input
                    type="text"
                    id="categoryName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Salary, Groceries"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                />
            </div>

            {/* Category Type - Only show if NOT editing (type is immutable) */}
            {!isEditing && (
                <div className="mb-6">
                    <label htmlFor="categoryType" className="block text-sm font-medium text-gray-700 mb-2">
                        Category Type *
                    </label>
                    <select
                        id="categoryType"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    >
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Category type cannot be changed after creation
                    </p>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    {isEditing ? "Update Category" : "Add Category"}
                </button>
            </div>
        </form>
    );
};

AddCategoryForm.propTypes = {
    onAddCategory: PropTypes.func.isRequired,
    initialCategoryData: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        type: PropTypes.string,
        icon: PropTypes.string,
    }),
    isEditing: PropTypes.bool,
};

export default AddCategoryForm;