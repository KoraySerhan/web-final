document.addEventListener("DOMContentLoaded", () => {
    const totalBluberyElement = document.getElementById("total-blubery");
    const remainingBluberyElement = document.getElementById("remaining-blubery");
    const totalPackagesElement = document.getElementById("total-packages");
    const categoryResultsElement = document.getElementById("category-results");
    const packagingForm = document.getElementById("packaging-form");

    // Purchase Records from Local Storage
    const purchaseRecords = JSON.parse(localStorage.getItem("purchaseRecords")) || [];
    const totalBluberyFromStorage = parseFloat(localStorage.getItem("remainingBlubery")) || 
        purchaseRecords.reduce((acc, record) => acc + parseFloat(record.quantity), 0);

    let remainingBlubery = totalBluberyFromStorage;

    // Paketlenmiş Blubery Bilgisi
    const packagedBlubery = JSON.parse(localStorage.getItem("packagedBlubery")) || { totalPackages: 0, categories: {} };
    const premiumPackagedBlubery = JSON.parse(localStorage.getItem("premiumPackagedBlubery")) || [];

    // Display Initial Total and Remaining Blubery
    totalBluberyElement.textContent = remainingBlubery.toFixed(2);
    remainingBluberyElement.textContent = remainingBlubery.toFixed(2);
    totalPackagesElement.textContent = packagedBlubery.totalPackages;

    packagingForm.addEventListener("submit", (e) => {
        e.preventDefault();
    
        let totalPackages = packagedBlubery.totalPackages;
        const categoryCounts = { ...packagedBlubery.categories }; // Mevcut kategori bilgilerini kopyala
    
        // Category Weights
        const weights = {
            "category-1": 0.1,
            "category-2": 0.25,
            "category-3": 0.5,
            "category-4": 1,
            "category-5": 2,
            "category-6": 5
        };
    
        // Önce toplam gerekli blubery miktarını hesapla
        let totalRequiredBlubery = 0;
        for (let key in weights) {
            const count = parseInt(document.getElementById(key).value) || 0;
            totalRequiredBlubery += count * weights[key];
        }
    
        // Yeterli blubery kontrolü
        if (remainingBlubery < totalRequiredBlubery) {
            alert("Not enough blubery for packaging. Please reduce quantities.");
            return; // İşlemi durdur
        }
    
        // Kategorilere göre paketleme işlemini uygula
        for (let key in weights) {
            const count = parseInt(document.getElementById(key).value) || 0;
            const weight = weights[key];
            const requiredBlubery = count * weight;
    
            if (count > 0) { // Eğer kullanıcı bu kategoriye bir değer girdiyse
                remainingBlubery -= requiredBlubery; // Blubery miktarını azalt
                totalPackages += count; // Toplam paket sayısını artır
                categoryCounts[key] = (categoryCounts[key] || 0) + count; // Mevcut kategori sayısını güncelle
            }
        }
    
        // Update Results
        remainingBluberyElement.textContent = remainingBlubery.toFixed(2);
        totalPackagesElement.textContent = totalPackages;
    
        // Display Category Results
        displayCategoryResults(categoryCounts);
    
        // Save to Local Storage
        const updatedPackagedBlubery = { totalPackages, categories: categoryCounts };
        localStorage.setItem("remainingBlubery", remainingBlubery.toFixed(2));
        localStorage.setItem("packagedBlubery", JSON.stringify(updatedPackagedBlubery));
    
        // Güncellenmiş packagedBlubery değerini bellekte de güncelle
        packagedBlubery.totalPackages = totalPackages;
        packagedBlubery.categories = categoryCounts;
    });

    // Dağıtım formunu işleme kodu
    const distributionForm = document.getElementById("distribution-form");

    distributionForm.addEventListener("submit", (e) => {
        e.preventDefault();

        let totalPackages = packagedBlubery.totalPackages;
        const categoryCounts = { ...packagedBlubery.categories };

        const weights = {
            "category-1": 0.1,
            "category-2": 0.25,
            "category-3": 0.5,
            "category-4": 1,
            "category-5": 2,
            "category-6": 5
        };

        let totalReturnedBlubery = 0;

        for (let key in weights) {
            const count = parseInt(document.getElementById(`distribute-${key}`).value) || 0;

            if (count > 0) {
                if (categoryCounts[key] >= count) {
                    const weight = weights[key];
                    totalReturnedBlubery += count * weight;

                    categoryCounts[key] -= count; // Kategorideki paket sayısını azalt
                    totalPackages -= count; // Toplam paket sayısını azalt
                } else {
                    alert(`Not enough packages in ${getCategoryName(key)} to distribute.`);
                    return;
                }
            }
        }

        remainingBlubery += totalReturnedBlubery; // Blubery stoğunu artır

        // Güncelleme
        remainingBluberyElement.textContent = remainingBlubery.toFixed(2);
        totalPackagesElement.textContent = totalPackages;

        displayCategoryResults(categoryCounts);

        // Yerel depolamayı güncelle
        const updatedPackagedBlubery = { totalPackages, categories: categoryCounts };
        localStorage.setItem("remainingBlubery", remainingBlubery.toFixed(2));
        localStorage.setItem("packagedBlubery", JSON.stringify(updatedPackagedBlubery));

        // Paket bilgilerini bellekte güncelle
        packagedBlubery.totalPackages = totalPackages;
        packagedBlubery.categories = categoryCounts;

        alert(`${totalReturnedBlubery.toFixed(2)} kg Blubery has been returned to stock.`);
    });
    
    // Display Category Results Function
    const displayCategoryResults = (categoryCounts) => {
        categoryResultsElement.innerHTML = Object.entries(categoryCounts)
            .map(([key, count]) => {
                const categoryName = getCategoryName(key);
                return `<p>${categoryName}: ${count} packages</p>`;
            })
            .join("");
    };

    // Get Category Name
    const getCategoryName = (key) => {
        const names = {
            "category-1": "Small (100g)",
            "category-2": "Medium (250g)",
            "category-3": "Large (500g)",
            "category-4": "Extra Large (1kg)",
            "category-5": "Family Pack (2kg)",
            "category-6": "Bulk Pack (5kg)",
            "category-7": "Premium (Custom Weight)"
        };
        return names[key] || "Unknown Category";
    };

    // Display Existing Category Results
    displayCategoryResults(packagedBlubery.categories);
});
