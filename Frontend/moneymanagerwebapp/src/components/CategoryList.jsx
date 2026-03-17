import { Edit, Trash2, Utensils } from "lucide-react";
import PropTypes from "prop-types";

const CategoryList = ({ categories = [], onEditCategory, onDeleteCategory }) => {
    const incomeCategories = categories.filter((cat) => cat.type === "INCOME");
    const expenseCategories = categories.filter((cat) => cat.type === "EXPENSE");

    const CategoryCard = ({ category }) => (
        <div className="group relative flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center text-2xl bg-white rounded-full overflow-hidden">
                    {category.icon ? (
                        category.icon.startsWith("http") ? (
                            <img src={category.icon} alt="category icon" className="w-7 h-7 object-contain" />
                        ) : (
                            <span>{category.icon}</span>
                        )
                    ) : (
                        <Utensils className="text-gray-400" size={20} />
                    )}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-800">{category.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {category.type === "INCOME" ? "Income Category" : "Expense Category"}
                    </p>
                </div>
            </div>

            {/* FIXED: was opacity-0 group-hover:opacity-100 — invisible on touch screens.
                Added [@media(hover:none)]:opacity-100 so buttons always show on mobile. */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                <button
                    onClick={() => onEditCategory(category)}
                    className="p-2 hover:bg-purple-100 rounded-lg cursor-pointer"
                    title="Edit category"
                >
                    <Edit size={18} className="text-purple-600" />
                </button>
                <button
                    onClick={() => onDeleteCategory(category)}
                    className="p-2 hover:bg-red-100 rounded-lg cursor-pointer"
                    title="Delete category"
                >
                    <Trash2 size={18} className="text-red-500" />
                </button>
            </div>
        </div>
    );

    CategoryCard.propTypes = {
        category: PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            icon: PropTypes.string,
        }).isRequired,
    };

    return (
        <div className="space-y-6">
            {incomeCategories.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-green-600">💰</span>
                        Income Categories ({incomeCategories.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {incomeCategories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
                    </div>
                </div>
            )}

            {expenseCategories.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-red-600">💸</span>
                        Expense Categories ({expenseCategories.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {expenseCategories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
                    </div>
                </div>
            )}

            {categories.length === 0 && (
                <div className="card text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Categories Yet</h3>
                    <p className="text-sm text-gray-500">
                        Click &quot;Add Category&quot; to create your first category
                    </p>
                </div>
            )}
        </div>
    );
};

CategoryList.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        icon: PropTypes.string,
    })),
    onEditCategory: PropTypes.func.isRequired,
    onDeleteCategory: PropTypes.func.isRequired,
};

export default CategoryList;