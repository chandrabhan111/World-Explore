// 1. API URL
const API_URL = "https://restcountries.com/v3.1/all?fields=name,capital,region,flags,population";


// 2. Select DOM Elements
const container    = document.querySelector("#countryContainer");
const searchInput  = document.querySelector("#searchInput");
const regionFilter = document.querySelector("#regionFilter");
const searchButton = document.querySelector(".search-box button");


// 3. Store fetched countries globally
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


// 5. Render Country Cards
function renderCards(filteredCountries) {

    container.innerHTML = "";

    if (filteredCountries.length === 0) {
        container.innerHTML = `<p class="empty-message">No countries found. Try a different search!</p>`;
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


// 6. Filter Countries by Search + Region
function filterCountries() {

    const searchText     = searchInput.value.trim().toLowerCase();
    const selectedRegion = regionFilter.value;

    const result = allCountries.filter(function(country) {

        const matchesSearch = country.name.toLowerCase().includes(searchText) ||
                              country.capital.toLowerCase().includes(searchText);

        const matchesRegion = selectedRegion === "all" || country.region === selectedRegion;

        return matchesSearch && matchesRegion;

    });

    renderCards(result);

}


// 7. Format Population Number
function formatPopulation(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + " B";
    if (num >= 1000000)    return (num / 1000000).toFixed(1) + " M";
    if (num >= 1000)       return (num / 1000).toFixed(0) + " K";
    return num.toString();
}


// 8. Fetch Countries from API
async function fetchCountries() {

    showLoading();

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch countries");
        }

        const data = await response.json();

        // Map API data to our format
        allCountries = data.map(function(country) {
            return {
                name:       country.name.common,
                capital:    country.capital ? country.capital[0] : "N/A",
                region:     country.region,
                flag:       country.flags.svg || country.flags.png,
                population: formatPopulation(country.population)
            };
        });

        // Sort A to Z by default
        allCountries.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

        renderCards(allCountries);

    } catch (error) {

        container.innerHTML = `
            <p class="empty-message">
                ⚠️ Could not load countries. Check your internet connection.
            </p>
        `;

    }

}


// 9. Event Listeners
searchButton.addEventListener("click", filterCountries);

searchInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        filterCountries();
    }
});

regionFilter.addEventListener("change", filterCountries);


// 10. Init — Fetch on Page Load
fetchCountries();
