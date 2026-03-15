import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import {addThousandsSeparator} from "../util/util.js";

// Fix: added color and gradientId props.
// Previously hardcoded #875cf5 purple for both income and expense charts — they looked identical.
// Now IncomeOverview passes green (#16a34a) and ExpenseOverview passes red (#dc2626).
// gradientId must be unique per instance to avoid SVG linearGradient id collision
// when both charts exist on the same page at the same time.
const CustomLineChart = ({ data, color = "#875cf5", gradientId = "chartGradient" }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;

            const groupedItemsForTooltip = dataPoint.items.reduce((acc, item) => {
                const { categoryName, amount } = item;
                if (!acc[categoryName]) {
                    acc[categoryName] = { categoryName, totalAmount: 0 };
                }
                acc[categoryName].totalAmount += amount;
                return acc;
            }, {});

            const categoriesInTooltip = Object.values(groupedItemsForTooltip);

            return (
                <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
                    <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
                    <hr className="my-1 border-gray-200" />
                    <p className="text-sm text-gray-700 font-bold mb-2">
                        Total: <span className="text-purple-800">&#8377;{addThousandsSeparator(dataPoint.totalAmount)}</span>
                    </p>
                    {categoriesInTooltip.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Details:</p>
                            {categoriesInTooltip.map((groupedItem, index) => (
                                <div key={index} className="flex justify-between text-xs text-gray-700">
                                    <span>{groupedItem.categoryName}:</span>
                                    <span>&#8377;{addThousandsSeparator(groupedItem.totalAmount)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="none" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#555" }} stroke="none" />
                    <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="totalAmount"
                        stroke={color}
                        fill={`url(#${gradientId})`}
                        strokeWidth={3}
                        dot={{ r: 3, fill: color }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomLineChart;