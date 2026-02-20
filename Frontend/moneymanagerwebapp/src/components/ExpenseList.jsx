import moment from "moment";
import {Download, LoaderCircle, Mail} from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import {useState} from "react";

const ExpenseList = ({ transactions, onDelete, onDownload, onEmail }) => {
    // FIX: Separate loading states for email and download buttons
    const [emailLoading, setEmailLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const handleEmail = async () => {
        setEmailLoading(true);
        try { await onEmail(); } finally { setEmailLoading(false); }
    };

    const handleDownload = async () => {
        setDownloadLoading(true);
        try { await onDownload(); } finally { setDownloadLoading(false); }
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">All Expenses</h5>
                <div className="flex items-center justify-end gap-2">
                    <button disabled={emailLoading || downloadLoading} className="card-btn" onClick={handleEmail}>
                        {emailLoading ? (
                            <><LoaderCircle className="w-4 h-4 animate-spin"/> Emailing...</>
                        ) : (
                            <><Mail size={15} className="text-base" /> Email</>
                        )}
                    </button>
                    <button disabled={emailLoading || downloadLoading} className="card-btn" onClick={handleDownload}>
                        {downloadLoading ? (
                            <><LoaderCircle className="w-4 h-4 animate-spin"/> Downloading...</>
                        ) : (
                            <><Download size={15} className="text-base" /> Download</>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                {transactions?.map((expense) => (
                    <TransactionInfoCard
                        key={expense.id}
                        title={expense.name}
                        icon={expense.icon}
                        date={moment(expense.date).format("Do MMM YYYY")}
                        amount={expense.amount}
                        type="expense"
                        onDelete={() => onDelete(expense.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ExpenseList;