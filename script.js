
// 1. API URL
const API_URL = "https://countries.dev/countries?fields=name,capital,region,population,flags";

// 2. Select DOM Elements
const container = document.querySelector("#countryContainer");
const searchInput = document.querySelector("#searchInput");
const regionFilter = document.querySelector("#regionFilter");
const searchButton = document.querySelector(".search-box button");
const sortFilter = document.querySelector("#sortFilter");
const favoritesFilter = document.querySelector("#favoritesFilter");

// 3. Store Countries Data
let allCountries = [];

// 4. Get Saved Favorites from Local Storage
let favoriteCountries = JSON.parse(
    localStorage.getItem("favoriteCountries")
) || [];

// 5. Show Loading
function showLoading() {
    container.innerHTML = `
        <div class="loading-card"></div>
        <div class="loading-card"></div>
        <div class="loading-card"></div>
        <div class="loading-card"></div>
        <div class="loading-card"></div>
        <div class="loading-card"></div>
    `;
}

// 6. Show Error
function showError() {
    container.innerHTML = "";

    const message = document.createElement("p");
    message.className = "status-message";
    message.textContent = "Unable to load countries. Please try again.";

    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Retry";
    retryBtn.className = "retry-btn";

    retryBtn.addEventListener("click", fetchCountries);

    container.append(message, retryBtn);
}

// 7. Format Population
function formatPopulation(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + " B";
    }

    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + " M";
    }

    if (num >= 1000) {
        return (num / 1000).toFixed(0) + " K";
    }

    return num.toString();
}

// 8. Render Country Cards
function renderCards(filteredCountries) {
    container.innerHTML = "";

    if (filteredCountries.length === 0) {
        container.innerHTML = `
            <p class="empty-message">
                No countries found. Try a different search!
            </p>
        `;
        return;
    }

    filteredCountries.forEach(function(country) {
        const card = document.createElement("div");
        card.className = "country-card";

        const isFavorite = favoriteCountries.includes(country.name);

        card.innerHTML = `
            <img
                class="country-flag"
                src="${country.flag}"
                alt="Flag of ${country.name}"
            >

            <div class="card-info">
                <h2>${country.name}</h2>
                <p><span>Capital:</span> ${country.capital}</p>
                <p><span>Region:</span> ${country.region}</p>
                <p><span>Population:</span> ${country.population}</p>
            </div>
        `;

        const favoriteBtn = document.createElement("button");

        favoriteBtn.className = "favorite-btn";
        favoriteBtn.textContent = isFavorite
            ? "❤️ Remove Favorite"
            : "🤍 Add Favorite";

        favoriteBtn.dataset.name = country.name;

        card.appendChild(favoriteBtn);
        container.appendChild(card);
    });
}

// 9. Sort Countries
function sortCountries(countries) {
    const sortValue = sortFilter.value;
    const sortedCountries = [...countries];

    if (sortValue === "az") {
        sortedCountries.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
    }

    else if (sortValue === "za") {
        sortedCountries.sort(function(a, b) {
            return b.name.localeCompare(a.name);
        });
    }

    else if (sortValue === "populationHigh") {
        sortedCountries.sort(function(a, b) {
            return b.rawPopulation - a.rawPopulation;
        });
    }

    else if (sortValue === "populationLow") {
        sortedCountries.sort(function(a, b) {
            return a.rawPopulation - b.rawPopulation;
        });
    }

    return sortedCountries;
}

// 10. Filter Countries
function filterCountries() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedRegion = regionFilter.value;
    const selectedFavorite = favoritesFilter.value;

    const result = allCountries.filter(function(country) {

        const matchesSearch =
            country.name.toLowerCase().includes(searchText) ||
            country.capital.toLowerCase().includes(searchText);

        const matchesRegion =
            selectedRegion === "all" ||
            country.region === selectedRegion;

        const matchesFavorite =
            selectedFavorite === "all" ||
            favoriteCountries.includes(country.name);

        return matchesSearch && matchesRegion && matchesFavorite;
    });

    const sortedResult = sortCountries(result);

    renderCards(sortedResult);
}

// 11. Toggle Favorite
function toggleFavorite(countryName) {

    if (favoriteCountries.includes(countryName)) {

        favoriteCountries = favoriteCountries.filter(function(name) {
            return name !== countryName;
        });

    } else {

        favoriteCountries.push(countryName);

    }

    localStorage.setItem(
        "favoriteCountries",
        JSON.stringify(favoriteCountries)
    );

    filterCountries();
}

// 12. Fetch Countries from API
async function fetchCountries() {
    showLoading();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch countries");
        }

        const data = await response.json();

        allCountries = data.map(function(country) {
            return {
                name: country.name,
                capital: country.capital || "N/A",
                region: country.region,
                flag: country.flags.svg || country.flags.png,
                population: formatPopulation(country.population),
                rawPopulation: Number(country.population) || 0
            };
        });

        allCountries.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

        filterCountries();

    } catch (error) {
        console.log("Error:", error);
        showError();
    }
}

// 13. Event Listeners

searchButton.addEventListener("click", filterCountries);

searchInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        filterCountries();
    }
});

regionFilter.addEventListener("change", filterCountries);

sortFilter.addEventListener("change", filterCountries);

favoritesFilter.addEventListener("change", filterCountries);

// Favorite Button Click
container.addEventListener("click", function(event) {

    if (event.target.classList.contains("favorite-btn")) {

        const countryName = event.target.dataset.name;

        toggleFavorite(countryName);

    }

});

// 14. Initialize Project
fetchCountries();
