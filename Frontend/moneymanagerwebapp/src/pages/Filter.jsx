import Dashboard from "../components/Dashboard.jsx";
import {useUser} from "../hooks/useUser.jsx";
import {Download, Search} from "lucide-react";
import {useState} from "react";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import TransactionInfoCard from "../components/TransactionInfoCard.jsx";
import moment from "moment";

const Filter = () => {
    useUser();
    const [type, setType] = useState("income");
    const [appliedType, setAppliedType] = useState("income");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [keyword, setKeyword] = useState("");
    const [sortField, setSortField] = useState("date");
    const [sortOrder, setSortOrder] = useState("asc");
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Fixed: don't send empty string for dates — only include keys when they have values.
            // Empty strings pass through FlexibleLocalDateTimeDeserializer as null which works,
            // but omitting them entirely is cleaner and more correct.
            const body = {type, keyword, sortField, sortOrder};
            if (startDate) body.startDate = startDate;
            if (endDate) body.endDate = endDate;

            const response = await axiosConfig.post(API_ENDPOINTS.APPLY_FILTERS, body);
            setTransactions(response.data);
            setAppliedType(type);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    };

    // Helper: parse a real error message from a Blob response.
    // When responseType:"blob", axios wraps error bodies as Blobs too —
    // reading .message directly returns undefined.
    const parseBlobError = async (error) => {
        if (error.response?.data instanceof Blob) {
            try {
                const text = await error.response.data.text();
                const json = JSON.parse(text);
                return json.message || "Failed to download report";
            } catch {
                return "Failed to download report";
            }
        }
        return error.response?.data?.message || "Failed to download report";
    };

    // Downloads exactly what the user sees — same type + same applied filters.
    // Only shown after the user has run a search and has results.
    const handleDownloadFiltered = async () => {
        setDownloadLoading(true);
        try {
            const params = { type: appliedType, sortField, sortOrder };
            if (startDate) params.startDate = `${startDate}T00:00:00`;
            if (endDate) params.endDate = `${endDate}T23:59:59`;
            if (keyword) params.keyword = keyword;

            const response = await axiosConfig.get(API_ENDPOINTS.DOWNLOAD_FILTERED_REPORT, {
                params,
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            const from = startDate || "all";
            const to = endDate || "today";
            link.setAttribute("download", `${appliedType}_filtered_${from}_to_${to}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Filtered results downloaded!");
        } catch (error) {
            const message = await parseBlobError(error);
            toast.error(message);
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleDownloadFullReport = async () => {
        setDownloadLoading(true);
        try {
            const params = {};
            if (startDate) params.startDate = `${startDate}T00:00:00`;
            if (endDate) params.endDate = `${endDate}T23:59:59`;
            if (keyword) params.keyword = keyword;

            const response = await axiosConfig.get(API_ENDPOINTS.DOWNLOAD_FULL_REPORT, {
                params,
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;

            const from = startDate || "all";
            const to = endDate || "today";
            link.setAttribute("download", `full_report_${from}_to_${to}.xlsx`);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Full report downloaded!");
        } catch (error) {
            // Fixed: parse blob error correctly instead of reading .message on a Blob object
            const message = await parseBlobError(error);
            toast.error(message);
        } finally {
            setDownloadLoading(false);
        }
    };

    return (
        <Dashboard activeMenu="Filters">
            <div className="my-5 mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Filter Transactions</h2>

                    <button
                        onClick={handleDownloadFullReport}
                        disabled={downloadLoading}
                        className={`flex items-center gap-2 px-4 py-2 bg-purple-800 text-white text-sm rounded-lg hover:bg-purple-900 transition-colors ${downloadLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <Download size={15} />
                        {downloadLoading ? "Downloading..." : "Download Full Report"}
                    </button>
                </div>

                <div className="card p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold">Select the filters</h5>
                    </div>

                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="type">Type</label>
                            <select value={type} id="type" className="w-full border rounded px-3 py-2" onChange={e => setType(e.target.value)}>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="startdate" className="block text-sm font-medium mb-1">Start Date</label>
                            <input value={startDate} id="startdate" type="date" className="w-full border rounded px-3 py-2" onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="enddate" className="block text-sm font-medium mb-1">End Date</label>
                            <input value={endDate} id="enddate" type="date" className="w-full border rounded px-3 py-2" onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="sortfield" className="block text-sm font-medium mb-1">Sort Field</label>
                            <select value={sortField} id="sortfield" className="w-full border rounded px-3 py-2" onChange={e => setSortField(e.target.value)}>
                                <option value="date">Date</option>
                                <option value="amount">Amount</option>
                                <option value="name">Name</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sortorder" className="block text-sm font-medium mb-1">Sort Order</label>
                            <select value={sortOrder} id="sortorder" className="w-full border rounded px-3 py-2" onChange={e => setSortOrder(e.target.value)}>
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                        <div className="sm:col-span-1 md:col-span-1 flex items-end">
                            <div className="w-full">
                                <label htmlFor="keyword" className="block text-sm font-medium mb-1">Search</label>
                                <input value={keyword} id="keyword" type="text" placeholder="Search..." className="w-full border rounded px-3 py-2" onChange={e => setKeyword(e.target.value)} />
                            </div>
                            <button type="submit" className="ml-2 mb-1 p-2 bg-purple-800 hover:bg-purple-900 text-white rounded flex items-center justify-center cursor-pointer">
                                <Search size={20} />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold">Transactions</h5>
                        <div className="flex items-center gap-3">
                            {transactions.length > 0 && (
                                <span className="text-sm text-gray-500">{transactions.length} result{transactions.length !== 1 ? "s" : ""}</span>
                            )}
                            {/* Download Results button — only shown when there are results on screen */}
                            {transactions.length > 0 && (
                                <button
                                    onClick={handleDownloadFiltered}
                                    disabled={downloadLoading}
                                    className={`flex items-center gap-2 px-3 py-1.5 bg-purple-800 text-white text-sm rounded-lg hover:bg-purple-900 transition-colors ${downloadLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <Download size={14} />
                                    {downloadLoading ? "Downloading..." : "Download Results"}
                                </button>
                            )}
                        </div>
                    </div>

                    {!loading && transactions.length === 0 && (
                        <p className="text-gray-500">Select the filters and click apply to filter the transactions</p>
                    )}
                    {loading && (
                        <p className="text-gray-500">Loading Transactions...</p>
                    )}
                    {!loading && transactions.map((transaction) => (
                        <TransactionInfoCard
                            key={transaction.id}
                            title={transaction.name}
                            icon={transaction.icon}
                            date={moment(transaction.date).format("Do MMM YYYY")}
                            amount={transaction.amount}
                            type={appliedType}
                            hideDeleteBtn
                        />
                    ))}
                </div>
            </div>
        </Dashboard>
    );
};

export default Filter;