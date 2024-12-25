document.addEventListener("DOMContentLoaded", () => {
    const pricingForm = document.getElementById("pricing-form");
    const pricingDisplay = document.getElementById("pricing-display");

    // Fiyatları kaydetme
    pricingForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const productPrices = {
            "Small": parseFloat(document.getElementById("category-1-price").value) || 0,
            "Medium": parseFloat(document.getElementById("category-2-price").value) || 0,
            "Large": parseFloat(document.getElementById("category-3-price").value) || 0,
            "Extra Large": parseFloat(document.getElementById("category-4-price").value) || 0,
            "Family Pack": parseFloat(document.getElementById("category-5-price").value) || 0,
            "Bulk Pack": parseFloat(document.getElementById("category-6-price").value) || 0,
        };

        // Negatif fiyat kontrolü
        for (const [category, price] of Object.entries(productPrices)) {
            if (price < 0) {
                alert(`Error: Price for ${category} cannot be negative.`);
                return; // Negatif değer varsa işlemi durdur
            }
        }

        localStorage.setItem("productPrices", JSON.stringify(productPrices));
        alert("Prices saved successfully!");
        displayCurrentPrices(); // Fiyatları güncelle
    });

    // Kaydedilen fiyatları göster
    const displayCurrentPrices = () => {
        const productPrices = JSON.parse(localStorage.getItem("productPrices")) || {};
        if (Object.keys(productPrices).length === 0) {
            pricingDisplay.innerHTML = "<p>No pricing data available.</p>";
            return;
        }

        pricingDisplay.innerHTML = Object.entries(productPrices)
            .map(([key, value]) => `<p><strong>${key}:</strong> $${value.toFixed(2)}</p>`)
            .join("");
    };

    // Sayfa yüklendiğinde mevcut fiyatları göster
    displayCurrentPrices();
});
