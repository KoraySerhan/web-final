document.addEventListener("DOMContentLoaded", () => {
    const bluberyDisplay = document.getElementById("blubery-display");
    const pricingDisplay = document.getElementById("pricing-display");
    const salesForm = document.getElementById("sales-form");
    const ordersTableBody = document.getElementById("orders-table").querySelector("tbody");

    const updatePopup = document.getElementById("update-popup");
    const updateForm = document.getElementById("update-form");
    const closeUpdatePopup = document.getElementById("close-update-popup");

    const updateCustomerName = document.getElementById("update-customer-name");
    const updateProductCategory = document.getElementById("update-product-category");
    const updateQuantity = document.getElementById("update-quantity");
    const updateDate = document.getElementById("update-date");
    const updateStatus = document.getElementById("update-status");

    const salesSummaryDisplay = document.getElementById("sales-summary");
    const totalIncomeDisplay = document.getElementById("total-income");

    // Local Storage'dan paketleme bilgileri
    const packagedBlubery = JSON.parse(localStorage.getItem("packagedBlubery")) || {
        totalPackages: 0,
        categories: {}
    };

    // Local Storage'dan fiyat bilgileri
    const productPrices = JSON.parse(localStorage.getItem("productPrices")) || {};

    // Local Storage'dan sipariş bilgileri
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let editingOrderIndex = null;

    const displayPackagedBlubery = () => {
        const categoryNames = {
            "category-1": "Category 1: Small (100g)",
            "category-2": "Category 2: Medium (250g)",
            "category-3": "Category 3: Large (500g)",
            "category-4": "Category 4: Extra Large (1kg)",
            "category-5": "Category 5: Family Pack (2kg)",
            "category-6": "Category 6: Bulk Pack (5kg)"
        };

        const totalPackages = packagedBlubery.totalPackages || 0;

        const categoryResults = Object.entries(packagedBlubery.categories)
            .map(([key, count]) => {
                const categoryName = categoryNames[key] || key;
                return `<p>- ${categoryName}: ${count} pack</p>`;
            })
            .join("");

        bluberyDisplay.innerHTML = `
            <p><strong>Total Packages:</strong> ${totalPackages}</p>
            ${categoryResults}
        `;
    };

    const displayPricing = () => {
        const priceResults = Object.entries(productPrices)
            .map(([category, price]) => `<p><strong>${category}:</strong> $${price.toFixed(2)}</p>`)
            .join("");

        pricingDisplay.innerHTML = `
            <h3>Price Per Category</h3>
            ${priceResults}
        `;
    };

    const updateOrdersTable = () => {
        ordersTableBody.innerHTML = orders.length === 0
            ? "<tr><td colspan='8'>No orders found.</td></tr>"
            : orders.map((order, index) => `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.customerName}</td>
                    <td>${order.productCategory}</td>
                    <td>${order.quantity}</td>
                    <td>$${order.totalPrice.toFixed(2)}</td>
                    <td>${order.date}</td>
                    <td>${order.status}</td>
                    <td>
                        <button onclick="editOrder(${index})">Update</button>
                        <button onclick="deleteOrder(${index})" style="color: white; background-color: red; border: none; padding: 5px; cursor: pointer;">Delete</button>
                    </td>
                </tr>
            `).join("");

        displaySalesSummary();
        displayTotalIncome();
    };

    // Satış Özeti Gösterimi
    const displaySalesSummary = () => {
        const categorySales = orders.reduce((summary, order) => {
            summary[order.productCategory] = (summary[order.productCategory] || 0) + order.quantity;
            return summary;
        }, {});

        salesSummaryDisplay.innerHTML = Object.entries(categorySales)
            .map(([category, quantity]) => `<p><strong>${category}:</strong> ${quantity} units sold</p>`)
            .join("");
    };

    // Toplam Geliri Gösterme
    const displayTotalIncome = () => {
        const totalIncome = orders.reduce((total, order) => total + order.totalPrice, 0);
        totalIncomeDisplay.innerHTML = `<p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>`;
    };

    // Sipariş Silme İşlemi
    window.deleteOrder = (index) => {
        if (confirm("Are you sure you want to delete this order?")) {
            const order = orders[index];
            const categoryKeys = {
                "Small": "category-1",
                "Medium": "category-2",
                "Large": "category-3",
                "Extra Large": "category-4",
                "Family Pack": "category-5",
                "Bulk Pack": "category-6"
            };

            const categoryKey = categoryKeys[order.productCategory];

            if (categoryKey && packagedBlubery.categories[categoryKey] !== undefined) {
                packagedBlubery.categories[categoryKey] += order.quantity;
                packagedBlubery.totalPackages += order.quantity; // Total packages artır
                localStorage.setItem("packagedBlubery", JSON.stringify(packagedBlubery));
                displayPackagedBlubery(); // Paket bilgilerini güncelle
            }

            orders.splice(index, 1);
            localStorage.setItem("orders", JSON.stringify(orders));
            updateOrdersTable();
            alert("Order deleted successfully!");
        }
    };

    // Sipariş Güncelleme İşlemi
    window.editOrder = (index) => {
        const order = orders[index];
        editingOrderIndex = index;

        updateCustomerName.value = order.customerName;
        updateProductCategory.value = order.productCategory;
        updateQuantity.value = order.quantity;
        updateDate.value = order.date;
        updateStatus.value = order.status;

        updatePopup.style.display = "flex";
    };

    updateForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const updatedCustomerName = updateCustomerName.value.trim();
        const updatedCategory = updateProductCategory.value;
        const updatedQuantity = parseInt(updateQuantity.value);
        const updatedDate = updateDate.value;
        const updatedStatus = updateStatus.value;

        if (!productPrices[updatedCategory]) {
            alert(`Price not set for ${updatedCategory}.`);
            return;
        }

        const updatedUnitPrice = productPrices[updatedCategory];
        const updatedTotalPrice = updatedUnitPrice * updatedQuantity;

        orders[editingOrderIndex] = {
            ...orders[editingOrderIndex],
            customerName: updatedCustomerName,
            productCategory: updatedCategory,
            quantity: updatedQuantity,
            date: updatedDate,
            totalPrice: updatedTotalPrice,
            status: updatedStatus
        };

        localStorage.setItem("orders", JSON.stringify(orders));
        updateOrdersTable();
        updatePopup.style.display = "none";
    });

    closeUpdatePopup.addEventListener("click", () => {
        updatePopup.style.display = "none";
    });

    salesForm.addEventListener("submit", (e) => {
        e.preventDefault();
    
        const customerName = document.getElementById("customer-name").value.trim();
        const customerContact = document.getElementById("customer-contact").value.trim();
        const customerShipping = document.getElementById("customer-shipping").value.trim();
        const productCategory = document.getElementById("product-category").value;
        const quantity = parseInt(document.getElementById("quantity").value);
        const date = document.getElementById("sale-date").value;
    
        // Negatif sayı kontrolü (ekleme)
        if (quantity < 0) {
            alert("Quantity cannot be negative.");
            return; // Negatif giriş durumunda işlemi durdur
        }
    
        if (!productPrices[productCategory]) {
            alert(`Price not set for ${productCategory}.`);
            return;
        }
    
        const categoryKeys = {
            "Small": "category-1",
            "Medium": "category-2",
            "Large": "category-3",
            "Extra Large": "category-4",
            "Family Pack": "category-5",
            "Bulk Pack": "category-6"
        };
    
        const categoryKey = categoryKeys[productCategory];
    
        if (categoryKey && packagedBlubery.categories[categoryKey] !== undefined) {
            if (packagedBlubery.categories[categoryKey] < quantity) {
                alert(`Not enough ${productCategory} packages available.`);
                return;
            }
            packagedBlubery.categories[categoryKey] -= quantity;
            packagedBlubery.totalPackages -= quantity; // Total packages azalt
            localStorage.setItem("packagedBlubery", JSON.stringify(packagedBlubery));
        }
    
        const unitPrice = productPrices[productCategory];
        const totalPrice = unitPrice * quantity;
    
        const newOrder = {
            orderId: `ORD-${Date.now()}`,
            customerName,
            customerContact,
            customerShipping,
            productCategory,
            quantity,
            totalPrice,
            date,
            status: "Pending"
        };
    
        orders.push(newOrder);
        localStorage.setItem("orders", JSON.stringify(orders));
    
        updateOrdersTable();
        displayPackagedBlubery(); // Satış sonrası paket bilgilerini güncelle
        salesForm.reset();
    });
    
    displayPackagedBlubery();
    displayPricing();
    updateOrdersTable();
});
