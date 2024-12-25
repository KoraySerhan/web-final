document.addEventListener("DOMContentLoaded", () => {
    const totalExpenseElement = document.getElementById("total-expense");
    const timePeriodForm = document.getElementById("time-period-form");
    const timePeriodExpenseElement = document.getElementById("time-period-expense");
    const reportContainer = document.getElementById("report-container");
    const generateReportBtn = document.getElementById("generate-report-btn");

    const purchaseRecords = JSON.parse(localStorage.getItem("purchaseRecords")) || [];

    const calculateTotalExpense = () => {
        const total = purchaseRecords.reduce((acc, record) => acc + parseFloat(record.totalCost), 0);
        totalExpenseElement.textContent = total.toFixed(2);
    };

    timePeriodForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const startDate = new Date(document.getElementById("start-date").value);
        const endDate = new Date(document.getElementById("end-date").value);

        if (startDate > endDate) {
            alert("Start date cannot be after end date!");
            return;
        }

        const filteredTotal = purchaseRecords
            .filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= startDate && recordDate <= endDate;
            })
            .reduce((acc, record) => acc + parseFloat(record.totalCost), 0);

        timePeriodExpenseElement.textContent = filteredTotal.toFixed(2);
    });

    generateReportBtn.addEventListener("click", () => {
        const report = purchaseRecords.map(record => `
            <p><strong>Purchase ID:</strong> ${record.purchaseId}<br>
            <strong>Farmer:</strong> ${record.farmerName}<br>
            <strong>Date:</strong> ${record.date}<br>
            <strong>Total Cost:</strong> $${record.totalCost}</p>
        `).join("");

        reportContainer.innerHTML = report || "<p>No records found.</p>";
    });

    calculateTotalExpense();
});
