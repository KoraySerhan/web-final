document.addEventListener("DOMContentLoaded", () => {
    const totalFarmersBluberyEl = document.getElementById("total-farmers-blubery");
    const remainingPackagingBluberyEl = document.getElementById("remaining-packaging-blubery");
    const packagingCountsEl = document.getElementById("packaging-counts");
    const warningsEl = document.getElementById("warnings");
    const stockVisualizationEl = document.getElementById("stock-visualization");

    // Fetch data from Local Storage
    const purchaseRecords = JSON.parse(localStorage.getItem("purchaseRecords")) || [];
    const packagedBlubery = parseFloat(localStorage.getItem("remainingBlubery")) || 0;
    const packagedCounts = JSON.parse(localStorage.getItem("packagedBlubery"))?.categories || {};

    // Category Names
    const categoryNames = {
        "category-1": "Small (100g)",
        "category-2": "Medium (250g)",
        "category-3": "Large (500g)",
        "category-4": "Extra Large (1kg)",
        "category-5": "Family Pack (2kg)",
        "category-6": "Bulk Pack (5kg)"
    };

    // Calculate total blubery from farmers
    const totalFarmersBlubery = purchaseRecords.reduce((total, record) => total + parseFloat(record.quantity || 0), 0);

    // Update UI
    totalFarmersBluberyEl.textContent = `${totalFarmersBlubery.toFixed(2)} kg`;
    remainingPackagingBluberyEl.textContent = `${packagedBlubery.toFixed(2)} kg`;

    // Display packaging counts
    const packagingCountsHtml = Object.entries(packagedCounts)
        .map(([category, count]) => {
            const categoryName = categoryNames[category] || category;
            return `<p><strong>${categoryName}:</strong> ${count} packages</p>`;
        })
        .join("");

    packagingCountsEl.innerHTML = packagingCountsHtml || "<p>No packages available.</p>";

    // Display warnings
    const warnings = [];

    if (packagedBlubery < 100) {
        warnings.push("Remaining blubery is below 100 kg. <button class='reorder-button' onclick='redirectToSuppliers()'>Reorder Now</button>");
    }

    Object.entries(packagedCounts).forEach(([category, count]) => {
        if (count < 10) {
            const categoryName = categoryNames[category] || category;
            warnings.push(`${categoryName} has less than 10 packages remaining. <button class='reorder-button' onclick='redirectToSuppliers()'>Reorder Now</button>`);
        }
    });

    warningsEl.innerHTML = warnings.length > 0
        ? `<div class="warning-section">${warnings.map(warning => `<p>${warning}</p>`).join("")}</div>`
        : "<p>No warnings at the moment.</p>";

    // Redirect to Supplier Management
    window.redirectToSuppliers = () => {
        window.location.href = "supplier.html"; // Update this with the correct supplier page URL
    };

    // Display stock visualization
    const stockVisualizationHtml = Object.entries(packagedCounts)
        .map(([category, count]) => {
            const categoryName = categoryNames[category] || category;
            const percentage = (count / 10) * 100; // Assuming 10 as full stock for visualization
            return `
                <div class="stock-bar">
                    <div class="stock-bar-label">${categoryName}</div>
                    <div class="stock-bar-container">
                        <div class="stock-bar-fill" style="width: ${percentage}%;"></div>
                    </div>
                    <div class="stock-bar-percentage">${count} packages</div>
                </div>
            `;
        })
        .join("");

    stockVisualizationEl.innerHTML = stockVisualizationHtml || "<p>No stock data available for visualization.</p>";
});
