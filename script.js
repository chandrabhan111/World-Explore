
// 1. API URL
const API_URL = "https://countries.dev/countries?fields=name,capital,region,population,flags";


// 2. Select DOM Elements
const container = document.querySelector("#countryContainer");
const searchInput = document.querySelector("#searchInput");
const regionFilter = document.querySelector("#regionFilter");
const searchButton = document.querySelector(".search-box button");


// 3. Store Countries Data
let allCountries = [];


// 4. Show Loading Skeleton
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


// 5. Show Error + Retry Button
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


// 6. Format Population Number
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


// 7. Render Country Cards
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

        container.appendChild(card);
    });
}


// 8. Filter Countries by Search + Region
function filterCountries() {

    const searchText = searchInput.value.trim().toLowerCase();

    const selectedRegion = regionFilter.value;

    const result = allCountries.filter(function(country) {

        const matchesSearch =
            country.name.toLowerCase().includes(searchText) ||
            (country.capital || "").toLowerCase().includes(searchText);

        const matchesRegion =
            selectedRegion === "all" ||
            country.region === selectedRegion;

        return matchesSearch && matchesRegion;
    });

    renderCards(result);
}


// 9. Fetch Countries from API
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
                population: formatPopulation(country.population)
            };

        });

        // Sort Countries A-Z
        allCountries.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

        renderCards(allCountries);

    } catch (error) {

        console.log("Error:", error);

        showError();
    }
}


// 10. Event Listeners

searchButton.addEventListener("click", filterCountries);

searchInput.addEventListener("keyup", function(event) {

    if (event.key === "Enter") {
        filterCountries();
    }

});

regionFilter.addEventListener("change", filterCountries);


// 11. Initialize Project
fetchCountries();
