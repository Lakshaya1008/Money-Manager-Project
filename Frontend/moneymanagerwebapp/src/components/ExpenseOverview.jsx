import {useEffect, useState} from "react";
import {Plus} from "lucide-react";
import CustomLineChart from "./CustomLineChart.jsx";
import {prepareIncomeLineChartData} from "../util/util.js";

const ExpenseOverview = ({transactions, onExpenseIncome}) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const result = prepareIncomeLineChartData(transactions);
        setChartData(result);
    }, [transactions]);

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-lg">Expense Overview</h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Track your spending trends over time and gain insights into where your money goes.
                    </p>
                </div>
                <button className="add-btn" onClick={onExpenseIncome}>
                    <Plus size={15} className="text-lg" /> Add Expense
                </button>
            </div>

            <div className="mt-10">
                {chartData.length === 0 ? (
                    // Fix: show a helpful message instead of a blank chart when no data exists
                    <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                        No expenses this month yet — add your first entry to see trends.
                    </div>
                ) : (
                    // Fix: pass red color so expense is visually distinct from income (green).
                    // gradientId is unique to avoid SVG id collision if both charts render together.
                    <CustomLineChart
                        data={chartData}
                        color="#dc2626"
                        gradientId="expenseChartGradient"
                    />
                )}
            </div>
        </div>
    );
};

export default ExpenseOverview;