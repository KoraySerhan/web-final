document.addEventListener("DOMContentLoaded", () => {
    const totalRevenueEl = document.getElementById("total-revenue");
    const totalExpensesEl = document.getElementById("total-expenses");
    const taxesEl = document.getElementById("taxes");
    const netProfitEl = document.getElementById("net-profit");
    const financeTableBody = document.getElementById("finance-table-body");

    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const filterButton = document.getElementById("filter-button");
    const seeAllButton = document.getElementById("see-all-button");

    const salesChartCanvas = document.getElementById("sales-chart");

    // Fetch data from Local Storage
    const purchaseRecords = JSON.parse(localStorage.getItem("purchaseRecords")) || [];
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    const filterByDate = (records, startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= start && recordDate <= end;
        });
    };

    const calculateSummary = (filteredOrders, filteredPurchases) => {
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        const totalExpenses = filteredPurchases.reduce((sum, purchase) => sum + (purchase.quantity * purchase.pricePerKg), 0);
        const taxes = totalRevenue * 0.15;
        const netProfit = totalRevenue - totalExpenses - taxes;

        return { totalRevenue, totalExpenses, taxes, netProfit };
    };

    const updateSummaryTable = ({ totalRevenue, totalExpenses, taxes, netProfit }) => {
        totalRevenueEl.textContent = totalRevenue.toFixed(2);
        totalExpensesEl.textContent = totalExpenses.toFixed(2);
        taxesEl.textContent = taxes.toFixed(2);
        netProfitEl.textContent = netProfit.toFixed(2);

        financeTableBody.innerHTML = `
            <tr>
                <td>Total Revenue</td>
                <td>$${totalRevenue.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Total Expenses</td>
                <td>$${totalExpenses.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Taxes (15%)</td>
                <td>$${taxes.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Net Profit</td>
                <td>$${netProfit.toFixed(2)}</td>
            </tr>
        `;
    };

    const getSoldCategoryCounts = (orders) => {
        return orders.reduce((acc, order) => {
            acc[order.productCategory] = (acc[order.productCategory] || 0) + order.quantity;
            return acc;
        }, {});
    };

    const updateSalesChart = (orders) => {
        const categoryCounts = getSoldCategoryCounts(orders);

        new Chart(salesChartCanvas, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryCounts),
                datasets: [{
                    data: Object.values(categoryCounts),
                    backgroundColor: ['#007BFF', '#28A745', '#FFC107', '#DC3545', '#6F42C1', '#17A2B8'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Sales by Category' }
                }
            }
        });
    };

    filterButton.addEventListener("click", () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        const filteredOrders = filterByDate(orders, startDate, endDate);
        const filteredPurchases = filterByDate(purchaseRecords, startDate, endDate);

        const summary = calculateSummary(filteredOrders, filteredPurchases);
        updateSummaryTable(summary);
        updateSalesChart(filteredOrders);
    });

    seeAllButton.addEventListener("click", () => {
        const summary = calculateSummary(orders, purchaseRecords);
        updateSummaryTable(summary);
        updateSalesChart(orders);
    });

    // Initial Summary Calculation and Chart
    const initialSummary = calculateSummary(orders, purchaseRecords);
    updateSummaryTable(initialSummary);
    updateSalesChart(orders);

    // Export Report
    document.getElementById("generate-report").addEventListener("click", () => {
        const soldCategoryCounts = getSoldCategoryCounts(orders);

        const reportContent = `
        Total Revenue: $${totalRevenueEl.textContent}
        Total Expenses: $${totalExpensesEl.textContent}
        Taxes: $${taxesEl.textContent}
        Net Profit: $${netProfitEl.textContent}

        Sales by Category:
        ${Object.entries(soldCategoryCounts).map(([key, value]) => `${key}: ${value} units`).join('\n')}
        `;

        alert("Report generated:\n\n" + reportContent);
    });

    // Export CSV
    document.getElementById("export-csv").addEventListener("click", () => {
        const soldCategoryCounts = getSoldCategoryCounts(orders);

        const csvContent = "data:text/csv;charset=utf-8," +
            "Description,Amount\n" +
            `Total Revenue,$${totalRevenueEl.textContent}\n` +
            `Total Expenses,$${totalExpensesEl.textContent}\n` +
            `Taxes,$${taxesEl.textContent}\n` +
            `Net Profit,$${netProfitEl.textContent}\n\n` +
            "Category,Count\n" +
            Object.entries(soldCategoryCounts).map(([key, value]) => `${key},${value}`).join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "sales_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Export PDF
    document.getElementById("export-pdf").addEventListener("click", () => {
        const soldCategoryCounts = getSoldCategoryCounts(orders);

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Profit Analysis Report", 10, 10);

        doc.setFontSize(12);
        doc.text(`Total Revenue: $${totalRevenueEl.textContent}`, 10, 30);
        doc.text(`Total Expenses: $${totalExpensesEl.textContent}`, 10, 40);
        doc.text(`Taxes (15%): $${taxesEl.textContent}`, 10, 50);
        doc.text(`Net Profit: $${netProfitEl.textContent}`, 10, 60);

        doc.text("Sales by Category:", 10, 80);
        Object.entries(soldCategoryCounts).forEach(([key, value], index) => {
            doc.text(`${key}: ${value} units`, 10, 90 + (index * 10));
        });

        doc.save("profit_analysis.pdf");
    });
});
