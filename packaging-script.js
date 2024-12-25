document.addEventListener("DOMContentLoaded", () => {
    const totalBluberyElement = document.getElementById("total-blubery");
    const remainingBluberyElement = document.getElementById("remaining-blubery");
    const totalPackagesElement = document.getElementById("total-packages");
    const categoryResultsElement = document.getElementById("category-results");
    const packagingForm = document.getElementById("packaging-form");

    
    const purchaseRecords = JSON.parse(localStorage.getItem("purchaseRecords")) || [];
    const totalBluberyFromStorage = parseFloat(localStorage.getItem("remainingBlubery")) || 
        purchaseRecords.reduce((acc, record) => acc + parseFloat(record.quantity), 0);

    let remainingBlubery = totalBluberyFromStorage;

    
    const packagedBlubery = JSON.parse(localStorage.getItem("packagedBlubery")) || { totalPackages: 0, categories: {} };
    const premiumPackagedBlubery = JSON.parse(localStorage.getItem("premiumPackagedBlubery")) || [];

    
    totalBluberyElement.textContent = remainingBlubery.toFixed(2);
    remainingBluberyElement.textContent = remainingBlubery.toFixed(2);
    totalPackagesElement.textContent = packagedBlubery.totalPackages;

    packagingForm.addEventListener("submit", (e) => {
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
    
        
        let totalRequiredBlubery = 0;
        for (let key in weights) {
            const count = parseInt(document.getElementById(key).value) || 0;
            totalRequiredBlubery += count * weights[key];
        }
    
        
        if (remainingBlubery < totalRequiredBlubery) {
            alert("Not enough blubery for packaging. Please reduce quantities.");
            return; 
        }
    
       
        for (let key in weights) {
            const count = parseInt(document.getElementById(key).value) || 0;
            const weight = weights[key];
            const requiredBlubery = count * weight;
    
            if (count > 0) { 
                remainingBlubery -= requiredBlubery; 
                totalPackages += count; 
                categoryCounts[key] = (categoryCounts[key] || 0) + count; 
            }
        }
    
        
        remainingBluberyElement.textContent = remainingBlubery.toFixed(2);
        totalPackagesElement.textContent = totalPackages;
    
        
        displayCategoryResults(categoryCounts);
    
       
        const updatedPackagedBlubery = { totalPackages, categories: categoryCounts };
        localStorage.setItem("remainingBlubery", remainingBlubery.toFixed(2));
        localStorage.setItem("packagedBlubery", JSON.stringify(updatedPackagedBlubery));
    
        
        packagedBlubery.totalPackages = totalPackages;
        packagedBlubery.categories = categoryCounts;
    });

    
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

                    categoryCounts[key] -= count; 
                    totalPackages -= count; 
                } else {
                    alert(`Not enough packages in ${getCategoryName(key)} to distribute.`);
                    return;
                }
            }
        }

        remainingBlubery += totalReturnedBlubery; 

        
        remainingBluberyElement.textContent = remainingBlubery.toFixed(2);
        totalPackagesElement.textContent = totalPackages;

        displayCategoryResults(categoryCounts);

      
        const updatedPackagedBlubery = { totalPackages, categories: categoryCounts };
        localStorage.setItem("remainingBlubery", remainingBlubery.toFixed(2));
        localStorage.setItem("packagedBlubery", JSON.stringify(updatedPackagedBlubery));

        
        packagedBlubery.totalPackages = totalPackages;
        packagedBlubery.categories = categoryCounts;

        alert(`${totalReturnedBlubery.toFixed(2)} kg Blubery has been returned to stock.`);
    });
    
    
    const displayCategoryResults = (categoryCounts) => {
        categoryResultsElement.innerHTML = Object.entries(categoryCounts)
            .map(([key, count]) => {
                const categoryName = getCategoryName(key);
                return `<p>${categoryName}: ${count} packages</p>`;
            })
            .join("");
    };

    
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

    
    displayCategoryResults(packagedBlubery.categories);
});
