import {useEffect, useState} from "react";
import {prepareIncomeLineChartData} from "../util/util.js";
import CustomLineChart from "./CustomLineChart.jsx";
import {Plus} from "lucide-react";

const IncomeOverview = ({transactions, onAddIncome}) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const result = prepareIncomeLineChartData(transactions);
        setChartData(result);
    }, [transactions]);

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-lg">Income Overview</h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Track your earnings over time and analyze your income trends.
                    </p>
                </div>
                <button className="add-btn" onClick={onAddIncome}>
                    <Plus size={15} className="text-lg" /> Add Income
                </button>
            </div>

            <div className="mt-10">
                {chartData.length === 0 ? (
                    // Fix: show a helpful message instead of a blank chart when no data exists
                    <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                        No income this month yet — add your first entry to see trends.
                    </div>
                ) : (
                    // Fix: pass green color so income is visually distinct from expense (red).
                    // gradientId is unique to avoid SVG id collision if both charts render together.
                    <CustomLineChart
                        data={chartData}
                        color="#16a34a"
                        gradientId="incomeGradient"
                    />
                )}
            </div>
        </div>
    );
};

export default IncomeOverview;