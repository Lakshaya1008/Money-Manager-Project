import CustomPieChart from "./CustomPieChart.jsx";
import {addThousandsSeparator} from "../util/util.js";

const FinanceOverview = ({totalBalance, totalIncome, totalExpense}) => {
    // Fix: when expenses > income, totalBalance is negative.
    // A donut chart cannot represent a negative slice — Recharts renders it broken.
    // When in deficit: show only Income vs Expense (both positive), display a "Deficit" badge.
    // When balanced/positive: show all three including balance.
    const isDeficit = totalBalance < 0;

    const COLORS_NORMAL  = ["#59168B", "#a0090e", "#016630"];
    const COLORS_DEFICIT = ["#a0090e", "#016630"];

    const balanceData = isDeficit
        ? [
            { name: "Total Expenses", amount: totalExpense },
            { name: "Total Income",   amount: totalIncome  },
        ]
        : [
            { name: "Total Balance",  amount: totalBalance },
            { name: "Total Expenses", amount: totalExpense },
            { name: "Total Income",   amount: totalIncome  },
        ];

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">Financial Overview</h5>
                {isDeficit && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                        In Deficit
                    </span>
                )}
            </div>

            <CustomPieChart
                data={balanceData}
                label={isDeficit ? "Deficit" : "Total Balance"}
                totalAmount={
                    isDeficit
                        ? `- ₹${addThousandsSeparator(Math.abs(totalBalance))}`
                        : `₹${addThousandsSeparator(totalBalance)}`
                }
                colors={isDeficit ? COLORS_DEFICIT : COLORS_NORMAL}
                showTextAnchor
            />
        </div>
    );
};

export default FinanceOverview;