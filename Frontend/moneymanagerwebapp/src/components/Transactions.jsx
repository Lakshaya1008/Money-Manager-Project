import { ArrowRight } from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import { formatDate } from "../util/util.js";

// FIXED: no empty state — blank card with just "More" button for new users.
// FIXED: replaced moment.js with native formatDate() from util.js.
const Transactions = ({ transactions, onMore, type, title }) => {
    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">{title}</h5>
                <button className="card-btn" onClick={onMore}>
                    More <ArrowRight className="text-base" size={15} />
                </button>
            </div>

            <div className="mt-6">
                {!transactions || transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-gray-400 text-sm">No transactions yet.</p>
                        <p className="text-gray-400 text-xs mt-1">
                            Add {type === "income" ? "income" : "an expense"} to see it here.
                        </p>
                    </div>
                ) : (
                    transactions.slice(0, 5).map((item) => (
                        <TransactionInfoCard
                            key={item.id}
                            title={item.name}
                            icon={item.icon}
                            date={formatDate(item.date)}
                            amount={item.amount}
                            type={type}
                            hideDeleteBtn
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Transactions;