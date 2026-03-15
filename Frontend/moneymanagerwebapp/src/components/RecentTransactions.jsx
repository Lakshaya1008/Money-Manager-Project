import {ArrowRight} from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import moment from "moment";

const RecentTransactions = ({transactions, onMore}) => {
    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h4 className="text-lg">Recent Transactions</h4>
                <button className="card-btn" onClick={onMore}>
                    More <ArrowRight className="text-base" size={15} />
                </button>
            </div>

            <div className="mt-6">
                {/* Fix: show an empty state instead of a blank card when user has no transactions yet */}
                {(!transactions || transactions.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-gray-400 text-sm">No transactions yet.</p>
                        <p className="text-gray-400 text-xs mt-1">
                            Add income or expenses to see them here.
                        </p>
                    </div>
                ) : (
                    transactions.slice(0, 5).map(item => (
                        <TransactionInfoCard
                            key={item.id}
                            title={item.name}
                            icon={item.icon}
                            date={moment(item.date).format("Do MMM YYYY")}
                            amount={item.amount}
                            type={item.type}
                            hideDeleteBtn
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentTransactions;