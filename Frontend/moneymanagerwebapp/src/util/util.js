import moment from "moment";

export const addThousandsSeparator = (num) => {
    if (num == null || isNaN(num)) return "";

    // Fixed: handle negative numbers by stripping the sign, formatting the absolute
    // value, then re-applying the sign. Previously the regex ran on the raw string
    // including the minus sign, producing wrong comma placement for negative balances.
    const isNegative = Number(num) < 0;
    const absNum = Math.abs(Number(num)).toString();
    const parts = absNum.split('.');

    let integerPart = parts[0];
    let fractionalPart = parts[1];

    // Indian numbering system: last 3 digits, then groups of 2
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);

    if (otherNumbers !== '') {
        const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
        integerPart = formattedOtherNumbers + ',' + lastThree;
    } else {
        integerPart = lastThree;
    }

    const formatted = fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
    return isNegative ? `-${formatted}` : formatted;
};

export const prepareIncomeLineChartData = (data = []) => {
    // Group data by date
    const groupedByDate = data.reduce((acc, item) => {
        // Fixed: use only the date portion (YYYY-MM-DD) as the grouping key.
        // Previously used the full LocalDateTime string (e.g. "2025-03-15T09:00:00"),
        // so two entries on the same day at different times produced separate chart points
        // instead of being summed together.
        const dateKey = item.date ? item.date.split("T")[0] : "unknown";

        if (!acc[dateKey]) {
            acc[dateKey] = {
                date: dateKey,
                totalAmount: 0,
                items: [],
            };
        }

        acc[dateKey].totalAmount += item.amount;
        acc[dateKey].items.push(item);
        return acc;
    }, {});

    let chartData = Object.values(groupedByDate);

    chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

    chartData = chartData.map((dataPoint) => ({
        ...dataPoint,
        month: moment(dataPoint.date).format('Do MMM'),
    }));

    return chartData;
};