document.addEventListener("DOMContentLoaded", function () {
    const farmerList = document.getElementById("farmer-list");
    const popup = document.getElementById("popup");
    const detailsPopup = document.getElementById("details-popup");
    const popupTitle = document.querySelector("#popup .popup-content h2"); // Pop-up başlığı
    const addButton = document.getElementById("add-button");
    const closePopup = document.getElementById("close-popup");
    const closeDetailsPopup = document.getElementById("close-details-popup");
    const farmerForm = document.getElementById("farmer-form");
    const exportButton = document.getElementById("export-button");

    let farmers = JSON.parse(localStorage.getItem("farmersData")) || [];
    let isEditing = false; // Update modunu takip eder
    let editingFarmerId = null; // Düzenlenecek farmer ID'si
    let currentFarmer = null; // Details pop-up için mevcut farmer

    // Add butonuna tıklama işlevi
    addButton.addEventListener("click", () => {
        isEditing = false; // Yeni ekleme modu
        popupTitle.textContent = "Add New Farmer"; // Başlığı "Add New Farmer" yap
        popup.style.display = "flex";
        farmerForm.reset();
    });

    closePopup.addEventListener("click", () => popup.style.display = "none");
    closeDetailsPopup.addEventListener("click", () => detailsPopup.style.display = "none");

    // Farmer ekleme ve güncelleme işlevi
    farmerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const surname = document.getElementById("surname").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const country = document.getElementById("country").value.trim();
        const address = document.getElementById("address").value.trim();

        // Aynı isim ve soyisimde bir farmer olup olmadığını kontrol et
        if (!isEditing && farmers.some(farmer => farmer.name === name && farmer.surname === surname)) {
            alert("A farmer with the same name and surname already exists.");
            return;
        }

        if (isEditing) {
            // Farmer güncelleme
            const farmerIndex = farmers.findIndex((farmer) => farmer.id === editingFarmerId);
            if (farmerIndex !== -1) {
                farmers[farmerIndex] = { id: editingFarmerId, name, surname, phone, country, address };
            }
        } else {
            // Yeni farmer ekleme
            const farmer = {
                id: Date.now(),
                name,
                surname,
                phone,
                country,
                address,
            };
            farmers.push(farmer);
        }

        saveFarmers();
        displayFarmers();
        popup.style.display = "none";
        farmerForm.reset();
    });

    // Farmer'ları LocalStorage'a kaydet
    function saveFarmers() {
        localStorage.setItem("farmersData", JSON.stringify(farmers));
    }

    // Farmer'ları gösteren fonksiyon
    function displayFarmers() {
        farmerList.innerHTML = "";
        farmers.forEach((farmer) => {
            const div = document.createElement("div");
            div.classList.add("farmer-item");
            div.innerHTML = `
                <span>${farmer.name} ${farmer.surname}</span>
                <div class="button-group">
                    <button onclick="showDetails('${farmer.name}', '${farmer.surname}', '${farmer.phone}', '${farmer.country}', '${farmer.address}', ${farmer.id})">Details</button>
                    <button class="update-btn" onclick="editFarmer(${farmer.id})">Update</button>
                    <button class="delete-btn" onclick="deleteFarmer(${farmer.id})">Delete</button>
                </div>
            `;
            farmerList.appendChild(div);
        });
    }

    // Farmer detaylarını gösteren pop-up
    window.showDetails = function (name, surname, phone, country, address, id) {
        document.getElementById("details-id").value = id; // Farmer ID ekleme
        document.getElementById("details-name").value = name;
        document.getElementById("details-surname").value = surname;
        document.getElementById("details-phone").value = phone;
        document.getElementById("details-country").value = country;
        document.getElementById("details-address").value = address;

        currentFarmer = { id, name, surname, phone, country, address };

        detailsPopup.style.display = "flex";
    };

    // Farmer bilgilerini txt olarak dışa aktarma
    exportButton.addEventListener("click", function () {
        if (currentFarmer) {
            const fileContent = `
Farmer ID: ${currentFarmer.id}
Name: ${currentFarmer.name}
Surname: ${currentFarmer.surname}
Phone: ${currentFarmer.phone}
Country: ${currentFarmer.country}
Address: ${currentFarmer.address}
            `;

            const blob = new Blob([fileContent], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${currentFarmer.name}_${currentFarmer.surname}_Details.txt`;
            link.click();
        }
    });

    // Farmer güncelleme işlevi
    window.editFarmer = function (id) {
        const farmer = farmers.find((farmer) => farmer.id === id);
        if (farmer) {
            document.getElementById("name").value = farmer.name;
            document.getElementById("surname").value = farmer.surname;
            document.getElementById("phone").value = farmer.phone;
            document.getElementById("country").value = farmer.country;
            document.getElementById("address").value = farmer.address;

            isEditing = true;
            editingFarmerId = id;

            popupTitle.textContent = "Update Farmer Information"; // Başlığı "Update Farmer Information" yap
            popup.style.display = "flex";
        }
    };

    // Farmer silme işlevi
    window.deleteFarmer = function (id) {
        farmers = farmers.filter((farmer) => farmer.id !== id);
        saveFarmers();
        displayFarmers();
    };

    // Sayfa yüklendiğinde farmer'ları göster
    displayFarmers();
});
