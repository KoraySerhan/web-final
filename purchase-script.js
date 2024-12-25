document.addEventListener("DOMContentLoaded", () => {
    const purchaseForm = document.getElementById("purchase-form");
    const farmerSelect = document.getElementById("farmer-select");
    const purchaseTableBody = document.getElementById("purchase-table-body");
    const detailsPopup = document.getElementById("details-popup");
    const updatePopup = document.getElementById("update-popup");
    const closeDetailsPopup = document.getElementById("close-details-popup");
    const closeUpdatePopup = document.getElementById("close-update-popup");
    const sortRecordsBtn = document.getElementById("sort-records-btn");
    const sortPopup = document.getElementById("sort-popup");
    const closeSortPopup = document.getElementById("close-sort-popup");
    const sortedRecordsContainer = document.getElementById("sorted-records-container");
    const sortForm = document.getElementById("sort-form");
    const sortCriteriaSelect = document.getElementById("sort-criteria");
    const generateSummaryBtn = document.getElementById("generate-summary-btn");
    const summaryPopup = document.getElementById("summary-popup");
    const closeSummaryPopup = document.getElementById("close-summary-popup");
    const summaryContainer = document.getElementById("summary-container");

    let purchaseRecords = JSON.parse(localStorage.getItem("purchaseRecords")) || [];
    const farmers = JSON.parse(localStorage.getItem("farmersData")) || [];
    let editIndex = null;

    const populateFarmerDropdown = () => {
        farmers.forEach(farmer => {
            const option = document.createElement("option");
            option.value = JSON.stringify(farmer);
            option.textContent = `${farmer.name} ${farmer.surname}`;
            farmerSelect.appendChild(option);
        });
    };

    const renderTable = () => {
        purchaseTableBody.innerHTML = "";
        purchaseRecords.forEach((record, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.purchaseId}</td>
                <td>${record.farmerName}</td>
                <td>
                    <div class="action-buttons">
                        <button class="details-btn" onclick="showDetails(${index})">Details</button>
                        <button class="update-btn" onclick="editRecord(${index})">Update</button>
                        <button class="delete-btn" onclick="deleteRecord(${index})">Delete</button>
                    </div>
                </td>
            `;
            purchaseTableBody.appendChild(row);
        });
    };

    const updateTotalCost = () => {
        const quantity = parseFloat(document.getElementById("quantity").value) || 0;
        const price = parseFloat(document.getElementById("price").value) || 0;
        const totalCost = quantity * price;
        document.getElementById("total-cost").value = totalCost.toFixed(2);
    };

    document.getElementById("quantity").addEventListener("input", updateTotalCost);
    document.getElementById("price").addEventListener("input", updateTotalCost);

    const updatePopupTotalCost = () => {
        const quantity = parseFloat(document.getElementById("update-quantity").value) || 0;
        const price = parseFloat(document.getElementById("update-price").value) || 0;
        const totalCost = quantity * price;
        document.getElementById("update-total-cost").value = totalCost.toFixed(2);
    };

    document.getElementById("update-quantity").addEventListener("input", updatePopupTotalCost);
    document.getElementById("update-price").addEventListener("input", updatePopupTotalCost);

    purchaseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const selectedFarmer = JSON.parse(farmerSelect.value);
        const purchaseId = `PUR-${Date.now()}`;
        const date = document.getElementById("purchase-date").value;
        const quantity = parseFloat(document.getElementById("quantity").value);
        const pricePerKg = parseFloat(document.getElementById("price").value);

        if (quantity < 0 || pricePerKg < 0) {
            alert("Quantity and Price per Kg cannot be negative.");
            return;
        }

        const totalCost = (quantity * pricePerKg).toFixed(2);

        const newRecord = {
            purchaseId,
            farmerId: selectedFarmer.id,
            farmerName: `${selectedFarmer.name} ${selectedFarmer.surname}`,
            date,
            quantity,
            pricePerKg,
            totalCost,
        };

        purchaseRecords.push(newRecord);
        localStorage.setItem("purchaseRecords", JSON.stringify(purchaseRecords));
        renderTable();
        purchaseForm.reset();

        const currentRemainingBlubery = parseFloat(localStorage.getItem("remainingBlubery")) || 0;
        const updatedRemainingBlubery = currentRemainingBlubery + quantity;
        localStorage.setItem("remainingBlubery", updatedRemainingBlubery.toFixed(2));
    });

    window.showDetails = (index) => {
        const record = purchaseRecords[index];
        document.getElementById("details-id").value = record.purchaseId;
        document.getElementById("details-farmer-id").value = record.farmerId;
        document.getElementById("details-farmer").value = record.farmerName;
        document.getElementById("details-date").value = record.date;
        document.getElementById("details-quantity").value = record.quantity;
        document.getElementById("details-price").value = record.pricePerKg;
        document.getElementById("details-total").value = record.totalCost;
        detailsPopup.style.display = "flex";
    };

    window.editRecord = (index) => {
        editIndex = index;
        const record = purchaseRecords[index];
        document.getElementById("update-date").value = record.date;
        document.getElementById("update-quantity").value = record.quantity;
        document.getElementById("update-price").value = record.pricePerKg;
        document.getElementById("update-total-cost").value = record.totalCost;
        updatePopup.style.display = "flex";
    };

    document.getElementById("update-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const date = document.getElementById("update-date").value;
        const quantity = parseFloat(document.getElementById("update-quantity").value) || 0;
        const pricePerKg = parseFloat(document.getElementById("update-price").value) || 0;

        if (quantity < 0 || pricePerKg < 0) {
            alert("Quantity and Price per Kg cannot be negative.");
            return;
        }

        const totalCost = (quantity * pricePerKg).toFixed(2);

        const updatedRemainingBlubery = parseFloat(localStorage.getItem("remainingBlubery")) || 0;
        const previousQuantity = purchaseRecords[editIndex].quantity;
        const newRemainingBlubery = updatedRemainingBlubery - previousQuantity + quantity;
        localStorage.setItem("remainingBlubery", newRemainingBlubery.toFixed(2));

        purchaseRecords[editIndex] = {
            ...purchaseRecords[editIndex],
            date,
            quantity,
            pricePerKg,
            totalCost,
        };

        localStorage.setItem("purchaseRecords", JSON.stringify(purchaseRecords));
        renderTable();
        updatePopup.style.display = "none";
    });

    window.deleteRecord = (index) => {
        const deletedQuantity = purchaseRecords[index].quantity;
        const currentRemainingBlubery = parseFloat(localStorage.getItem("remainingBlubery")) || 0;
        const updatedRemainingBlubery = currentRemainingBlubery - deletedQuantity;
        localStorage.setItem("remainingBlubery", updatedRemainingBlubery.toFixed(2));

        purchaseRecords.splice(index, 1);
        localStorage.setItem("purchaseRecords", JSON.stringify(purchaseRecords));
        renderTable();
    };

    closeDetailsPopup.addEventListener("click", () => detailsPopup.style.display = "none");
    closeUpdatePopup.addEventListener("click", () => updatePopup.style.display = "none");

    populateFarmerDropdown();
    renderTable();

    generateSummaryBtn.addEventListener("click", () => {
        const summary = purchaseRecords.reduce((acc, record) => {
            acc[record.farmerName] = (acc[record.farmerName] || 0) + parseFloat(record.totalCost);
            return acc;
        }, {});
        summaryContainer.innerHTML = Object.entries(summary)
            .map(([farmer, total]) => `
                <p>${farmer}: $${total.toFixed(2)}</p>
            `).join("");
        summaryPopup.style.display = "flex";
    });

    closeSummaryPopup.addEventListener("click", () => {
        summaryPopup.style.display = "none";
    });

    sortForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const criteria = sortCriteriaSelect.value;
        const sortedRecords = [...purchaseRecords].sort((a, b) => {
            if (criteria === "date") {
                return new Date(a.date) - new Date(b.date);
            } else if (criteria === "farmerName") {
                return a.farmerName.localeCompare(b.farmerName);
            } else if (criteria === "totalCost") {
                return a.totalCost - b.totalCost;
            }
        });

        sortedRecordsContainer.innerHTML = sortedRecords
            .map(record => `
                <p>${record.date} - ${record.farmerName} - $${record.totalCost}</p>
            `).join("");
    });

    sortRecordsBtn.addEventListener("click", () => {
        sortPopup.style.display = "flex";
    });

    closeSortPopup.addEventListener("click", () => {
        sortPopup.style.display = "none";
    });
});
