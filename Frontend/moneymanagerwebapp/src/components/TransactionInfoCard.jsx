import { Pencil, Trash2, TrendingDown, TrendingUp, UtensilsCrossed } from "lucide-react";
import { addThousandsSeparator } from "../util/util.js";

// FIXED: delete button was opacity-0 group-hover:opacity-100 — permanently invisible on touch screens.
// Added [@media(hover:none)]:opacity-100 so buttons always show on mobile/tablet.
// Added onEdit prop + pencil icon for edit functionality.
const TransactionInfoCard = ({ icon, title, date, amount, type, hideDeleteBtn, onDelete, onEdit }) => {
    const getAmountStyles = () =>
        type === "income" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800";

    return (
        <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60">
            <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
                {icon ? (
                    icon.startsWith("http") ? (
                        <img src={icon} alt={title} className="w-6 h-6" />
                    ) : (
                        <span className="text-2xl">{icon}</span>
                    )
                ) : (
                    <UtensilsCrossed className="text-purple-800" />
                )}
            </div>

            <div className="flex-1 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-700 font-medium">{title}</p>
                    <p className="text-xs text-gray-400 mt-1">{date}</p>
                </div>

                <div className="flex items-center gap-2">
                    {!hideDeleteBtn && (
                        // opacity-0 on desktop (reveal on hover), always visible on touch
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="text-gray-400 hover:text-purple-700 cursor-pointer p-1"
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                            )}
                            <button
                                onClick={onDelete}
                                className="text-gray-400 hover:text-red-800 cursor-pointer p-1"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()}`}>
                        <h6 className="text-xs font-medium">
                            {type === "income" ? "+" : "-"} &#8377;{addThousandsSeparator(amount)}
                        </h6>
                        {type === "income" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionInfoCard;