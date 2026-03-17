// REMOVED: moment.js dependency (67KB legacy library, maintenance-only since 2020).
// Replaced with native Intl.DateTimeFormat — zero bundle cost, same output.

export const addThousandsSeparator = (num) => {
    if (num == null || isNaN(num)) return "";

    const isNegative = Number(num) < 0;
    const absNum = Math.abs(Number(num)).toString();
    const parts = absNum.split(".");

    let integerPart = parts[0];
    const fractionalPart = parts[1];

    // Indian numbering: last 3 digits, then groups of 2
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);

    if (otherNumbers !== "") {
        integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    } else {
        integerPart = lastThree;
    }

    const formatted = fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
    return isNegative ? `-${formatted}` : formatted;
};

// "1st Jan 2025" — replaces moment(date).format("Do MMM YYYY")
export const formatDate = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";

    const day = d.getDate();
    const suffix =
        day === 11 || day === 12 || day === 13 ? "th"
            : day % 10 === 1 ? "st"
                : day % 10 === 2 ? "nd"
                    : day % 10 === 3 ? "rd"
                        : "th";

    const month = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d);
    return `${day}${suffix} ${month} ${d.getFullYear()}`;
};

// "1st Jan" — replaces moment(date).format("Do MMM") for chart axis labels
export const formatDateShort = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";

    const day = d.getDate();
    const suffix =
        day === 11 || day === 12 || day === 13 ? "th"
            : day % 10 === 1 ? "st"
                : day % 10 === 2 ? "nd"
                    : day % 10 === 3 ? "rd"
                        : "th";

    const month = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d);
    return `${day}${suffix} ${month}`;
};

// "March 2025" — replaces moment().format("MMMM YYYY")
export const currentMonthLabel = () =>
    new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date());

// "15 Mar 2025" — replaces moment(date).format("DD MMM YYYY") for Profile member-since
export const formatDateFull = (date) => {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d);
};

export const prepareIncomeLineChartData = (data = []) => {
    const groupedByDate = data.reduce((acc, item) => {
        const dateKey = item.date ? item.date.split("T")[0] : "unknown";
        if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, totalAmount: 0, items: [] };
        }
        acc[dateKey].totalAmount += item.amount;
        acc[dateKey].items.push(item);
        return acc;
    }, {});

    let chartData = Object.values(groupedByDate);
    chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
    chartData = chartData.map((dataPoint) => ({
        ...dataPoint,
        month: formatDateShort(dataPoint.date),
    }));

    return chartData;
};