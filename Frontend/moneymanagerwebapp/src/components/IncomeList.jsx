import { Download, LoaderCircle, Mail, Plus } from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import { currentMonthLabel, formatDate } from "../util/util.js";
import { useState } from "react";

const IncomeList = ({ transactions, onDelete, onEdit, onDownload, onEmail, onAdd }) => {
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

    const monthLabel = currentMonthLabel();

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-lg">Income — {monthLabel}</h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Showing this month only ·{" "}
                        <a href="/filter" className="underline hover:text-purple-600">View all history in Filters →</a>
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button disabled={emailLoading || downloadLoading} className="card-btn" onClick={handleEmail}>
                        {emailLoading
                            ? <><LoaderCircle className="w-4 h-4 animate-spin" /> Emailing...</>
                            : <><Mail size={15} className="text-base" /> Email</>}
                    </button>
                    <button disabled={emailLoading || downloadLoading} className="card-btn" onClick={handleDownload}>
                        {downloadLoading
                            ? <><LoaderCircle className="w-4 h-4 animate-spin" /> Downloading...</>
                            : <><Download size={15} className="text-base" /> Download</>}
                    </button>
                </div>
            </div>

            {transactions?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-400 text-sm mb-3">No income recorded for {monthLabel} yet.</p>
                    {onAdd && (
                        <button onClick={onAdd} className="add-btn">
                            <Plus size={14} /> Add your first income
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
                    {transactions?.map((income) => (
                        <TransactionInfoCard
                            key={income.id}
                            title={income.name}
                            icon={income.icon}
                            date={formatDate(income.date)}
                            amount={income.amount}
                            type="income"
                            onDelete={() => onDelete(income.id)}
                            onEdit={onEdit ? () => onEdit(income) : undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default IncomeList;