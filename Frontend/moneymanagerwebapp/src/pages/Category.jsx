import Dashboard from "../components/Dashboard.jsx";
import {useUser} from "../hooks/useUser.jsx";
import {Plus} from "lucide-react";
import CategoryList from "../components/CategoryList.jsx";
import {useEffect, useState} from "react";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import AddCategoryForm from "../components/AddCategoryForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";

const Category = () => {
    useUser();
    const [loading, setLoading] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);
    const [openEditCategoryModal, setOpenEditCategoryModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchCategoryDetails = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_CATEGORIES);
            if (response.status === 200) {
                setCategoryData(response.data);
            }
        }catch(error) {
            toast.error(error.response?.data?.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategoryDetails();
    }, []);

    const handleAddCategory = async (category) => {
        const {name, type, icon} = category;

        if (!name.trim()) {
            toast.error("Category Name is required");
            return;
        }

        const isDuplicate = categoryData.some((cat) => {
            return cat.name.toLowerCase() === name.trim().toLowerCase();
        });

        if (isDuplicate) {
            toast.error("Category Name already exists");
            return;
        }

        try {
            const response = await axiosConfig.post(API_ENDPOINTS.ADD_CATEGORY, {name, type, icon});
            if (response.status === 201) {
                toast.success("Category added successfully");
                setOpenAddCategoryModal(false);
                await fetchCategoryDetails();
            }
        }catch (error) {
            toast.error(error.response?.data?.message || "Failed to add category");
        }
    }

    const handleEditCategory = (categoryToEdit) => {
        setSelectedCategory(categoryToEdit);
        setOpenEditCategoryModal(true);
    }

    const handleUpdateCategory = async (updatedCategory) => {
        const {id, name, icon} = updatedCategory;
        if (!name.trim()) {
            toast.error("Category Name is required");
            return;
        }

        if (!id) {
            toast.error("Category ID is missing for update");
            return;
        }

        try {
            await axiosConfig.put(API_ENDPOINTS.UPDATE_CATEGORY(id), {name, icon});
            setOpenEditCategoryModal(false);
            setSelectedCategory(null);
            toast.success("Category updated successfully");
            await fetchCategoryDetails();
        }catch(error) {
            toast.error(error.response?.data?.message || "Failed to update category");
        }
    }

    const handleDeleteCategory = (categoryToDelete) => {
        setSelectedCategory(categoryToDelete);
        setOpenDeleteAlert({ show: true, data: categoryToDelete.id });
    }

    const deleteCategory = async (id) => {
        try {
            await axiosConfig.delete(API_ENDPOINTS.DELETE_CATEGORY(id));
            setOpenDeleteAlert({ show: false, data: null });
            setSelectedCategory(null);
            toast.success("Category deleted successfully");
            await fetchCategoryDetails();
        } catch(error) {
            toast.error(error.response?.data?.message || "Failed to delete category");
        }
    }

    return (
        <Dashboard activeMenu="Category">
            <div className="my-5 mx-auto">
                {/* Add button */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-semibold">All Categories</h2>
                    <button
                        onClick={() => setOpenAddCategoryModal(true)}
                        className="add-btn flex items-center gap-1">
                        <Plus size={15} />
                        Add Category
                    </button>
                </div>

                {/* Category list */}
                <CategoryList
                    categories={categoryData}
                    onEditCategory={handleEditCategory}
                    onDeleteCategory={handleDeleteCategory}
                />

                {/* Add Category Modal */}
                <Modal
                    isOpen={openAddCategoryModal}
                    onClose={() => setOpenAddCategoryModal(false)}
                    title="Add Category"
                >
                    <AddCategoryForm onAddCategory={handleAddCategory}/>
                </Modal>

                {/* Edit Category Modal */}
                <Modal
                    onClose={() => {
                        setOpenEditCategoryModal(false);
                        setSelectedCategory(null);
                    }}
                    isOpen={openEditCategoryModal}
                    title="Update Category"
                >
                    <AddCategoryForm
                        initialCategoryData={selectedCategory}
                        onAddCategory={handleUpdateCategory}
                        isEditing={true}
                    />
                </Modal>

                {/* Delete Category Modal */}
                <Modal
                    isOpen={openDeleteAlert.show}
                    onClose={() => {
                        setOpenDeleteAlert({ show: false, data: null });
                        setSelectedCategory(null);
                    }}
                    title="Delete Category"
                >
                    <DeleteAlert
                        content={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
                        onDelete={() => deleteCategory(openDeleteAlert.data)}
                    />
                </Modal>
            </div>
        </Dashboard>
    )
}

export default Category;