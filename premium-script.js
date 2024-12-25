document.addEventListener("DOMContentLoaded", () => {
    const saleForm = document.getElementById("sale-form");
    const salesTableBody = document.querySelector("#sales-table tbody");
    const totalSalesDisplay = document.getElementById("total-sales");
    const remainingStockDisplay = document.getElementById("remaining-stock");

    let remainingStock = parseFloat(localStorage.getItem("remainingBlubery")) || 1000; 
    let totalSales = parseFloat(localStorage.getItem("totalSales")) || 0;
    let salesRecords = JSON.parse(localStorage.getItem("salesRecords")) || [];

    const updateDisplay = () => {
        totalSalesDisplay.textContent = `Total Sales: $${totalSales.toFixed(2)}`;
        remainingStockDisplay.textContent = `Remaining Stock: ${remainingStock.toFixed(2)} kg`;
    };

    const renderSalesTable = () => {
        salesTableBody.innerHTML = salesRecords.length === 0
            ? "<tr><td colspan='8'>No sales recorded.</td></tr>"
            : salesRecords.map(record => `
                <tr>
                    <td>${record.customerName}</td>
                    <td>${record.saleDate}</td>
                    <td>${record.location}</td>
                    <td>${record.quantity.toFixed(2)}</td>
                    <td>$${record.unitPrice.toFixed(2)}</td>
                    <td>$${record.totalPrice.toFixed(2)}</td>
                    <td>${record.discount}%</td>
                    <td>$${record.netPrice.toFixed(2)}</td>
                </tr>
            `).join("");
    };

    saleForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const customerName = document.getElementById("customer-name").value.trim();
        const saleDate = document.getElementById("sale-date").value;
        const location = document.getElementById("location").value.trim();
        const quantity = parseFloat(document.getElementById("quantity").value);
        const unitPrice = parseFloat(document.getElementById("unit-price").value);

        if (quantity > remainingStock) {
            alert("Not enough stock available!");
            return;
        }

        let discount = 0;
        if (quantity > 100) discount = 20; 
        else if (quantity > 50) discount = 10; 

        const totalPrice = quantity * unitPrice;
        const netPrice = totalPrice - (totalPrice * discount / 100);

        remainingStock -= quantity;
        totalSales += netPrice;

        salesRecords.push({
            customerName,
            saleDate,
            location,
            quantity,
            unitPrice,
            totalPrice,
            discount,
            netPrice
        });

        localStorage.setItem("remainingBlubery", remainingStock.toFixed(2));
        localStorage.setItem("totalSales", totalSales.toFixed(2));
        localStorage.setItem("salesRecords", JSON.stringify(salesRecords));

        renderSalesTable();
        updateDisplay();
        saleForm.reset();
    });

    updateDisplay();
    renderSalesTable();
});
