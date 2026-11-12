
const API_URL =
  "https://countries.dev/countries?fields=name,capital,region,population,flags";

// 1. Select DOM Elements
const container = document.querySelector("#countryContainer");
const searchInput = document.querySelector("#searchInput");
const regionFilter = document.querySelector("#regionFilter");
const searchButton = document.querySelector("#searchBtn");
const sortFilter = document.querySelector("#sortFilter");
const favoritesFilter = document.querySelector("#favoritesFilter");

const countryModal = document.querySelector("#countryModal");
const modalDetails = document.querySelector("#modalDetails");
const closeModal = document.querySelector("#closeModal");

const totalCountries = document.querySelector("#totalCountries");
const showingCountries = document.querySelector("#showingCountries");
const favoriteCount = document.querySelector("#favoriteCount");

// Day 11: Comparison Container
const comparisonContainer = document.querySelector("#comparisonContainer");

// 2. Store Countries Data
let allCountries = [];
let favoriteCountries = [];
let selectedCountries = [];

// Get Saved Favorites
try {
  favoriteCountries = JSON.parse(
    localStorage.getItem("favoriteCountries")
  ) || [];
} catch {
  favoriteCountries = [];
}

// 3. Format Population
function formatPopulation(num) {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + " B";
  }

  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + " M";
  }

  if (num >= 1_000) {
    return (num / 1_000).toFixed(0) + " K";
  }

  return String(num);
}

// 4. Update Statistics
function updateStatistics(filteredCountries) {
  totalCountries.textContent = allCountries.length;
  showingCountries.textContent = filteredCountries.length;
  favoriteCount.textContent = favoriteCountries.length;
}

// 5. Render Country Cards
function renderCards(countries) {
  container.innerHTML = "";

  updateStatistics(countries);

  // Update Comparison Section
  updateComparison();

  if (countries.length === 0) {
    container.innerHTML =
      '<p class="empty-message">No countries found. Try a different search!</p>';
    return;
  }

  countries.forEach((country) => {
    const card = document.createElement("div");
    card.className = "country-card";

    card.innerHTML = `
      <img class="country-flag" src="${country.flag}" alt="Flag of ${country.name}">

      <div class="card-info">
        <h2>${country.name}</h2>
        <p><span>Capital:</span> ${country.capital}</p>
        <p><span>Region:</span> ${country.region}</p>
        <p><span>Population:</span> ${country.population}</p>
      </div>
    `;

    // Favorite Button
    const favoriteBtn = document.createElement("button");

    favoriteBtn.type = "button";
    favoriteBtn.className = "favorite-btn";
    favoriteBtn.dataset.name = country.name;

    if (favoriteCountries.includes(country.name)) {
      favoriteBtn.textContent = "❤️ Remove Favorite";
    } else {
      favoriteBtn.textContent = "🤍 Add Favorite";
    }

    // Details Button
    const detailsBtn = document.createElement("button");

    detailsBtn.type = "button";
    detailsBtn.className = "details-btn";
    detailsBtn.dataset.name = country.name;
    detailsBtn.textContent = "View Details";

    // Day 11: Compare Button
    const compareBtn = document.createElement("button");

    compareBtn.type = "button";
    compareBtn.className = "compare-btn";
    compareBtn.dataset.name = country.name;

    if (selectedCountries.includes(country.name)) {
      compareBtn.textContent = "Remove from Compare";
    } else {
      compareBtn.textContent = "Add to Compare";
    }

    // Add Buttons to Card
    card.append(favoriteBtn, detailsBtn, compareBtn);

    container.appendChild(card);
  });
}

// 6. Sort Countries
function sortCountries(countries) {
  const sorted = [...countries];

  if (sortFilter.value === "az") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortFilter.value === "za") {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortFilter.value === "populationHigh") {
    sorted.sort((a, b) => b.rawPopulation - a.rawPopulation);
  } else if (sortFilter.value === "populationLow") {
    sorted.sort((a, b) => a.rawPopulation - b.rawPopulation);
  }

  return sorted;
}

// 7. Filter Countries
function filterCountries() {
  const searchText = searchInput.value.trim().toLowerCase();
  const selectedRegion = regionFilter.value;
  const selectedFavorite = favoritesFilter.value;

  const result = allCountries.filter((country) => {
    const matchesSearch =
      country.name.toLowerCase().includes(searchText) ||
      country.capital.toLowerCase().includes(searchText);

    const matchesRegion =
      selectedRegion === "all" || country.region === selectedRegion;

    const matchesFavorite =
      selectedFavorite !== "favorites" ||
      favoriteCountries.includes(country.name);

    return matchesSearch && matchesRegion && matchesFavorite;
  });

  renderCards(sortCountries(result));
}

// 8. Toggle Favorite
function toggleFavorite(countryName) {
  if (favoriteCountries.includes(countryName)) {
    favoriteCountries = favoriteCountries.filter((name) => name !== countryName);
  } else {
    favoriteCountries.push(countryName);
  }

  localStorage.setItem("favoriteCountries", JSON.stringify(favoriteCountries));

  filterCountries();
}

// 9. Show Country Details
function showCountryDetails(countryName) {
  const selectedCountry = allCountries.find(
    (country) => country.name === countryName
  );

  if (!selectedCountry) return;

  modalDetails.innerHTML = `
    <div class="modal-details">
      <img
        src="${selectedCountry.flag}"
        class="modal-flag"
        alt="Flag of ${selectedCountry.name}"
      >

      <h2>${selectedCountry.name}</h2>
      <p><strong>Capital:</strong> ${selectedCountry.capital}</p>
      <p><strong>Region:</strong> ${selectedCountry.region}</p>
      <p><strong>Population:</strong> ${selectedCountry.population}</p>
    </div>
  `;

  countryModal.style.display = "flex";
}

// 10. Day 11: Toggle Country Comparison
function toggleCompare(countryName) {

  // Check if country is already selected
  if (selectedCountries.includes(countryName)) {

    // Remove country
    selectedCountries = selectedCountries.filter((name) => {
      return name !== countryName;
    });

  } else {

    // Check maximum limit
    if (selectedCountries.length === 2) {
      alert("You can compare only 2 countries!");
      return;
    }

    // Add country
    selectedCountries.push(countryName);
  }

  // Refresh Cards and Comparison
  filterCountries();
}

// 11. Day 11: Update Comparison Section
function updateComparison() {

  // Find selected countries from allCountries
  const comparisonData = allCountries.filter((country) => {
    return selectedCountries.includes(country.name);
  });

  // If no country is selected
  if (comparisonData.length === 0) {
    comparisonContainer.innerHTML = "";
    return;
  }

  // Create Remove Buttons
  let selectedNamesHTML = "";

  comparisonData.forEach((country) => {
    selectedNamesHTML += `
      <button
        type="button"
        class="remove-compare-btn"
        data-name="${country.name}"
      >
        Remove ${country.name}
      </button>
    `;
  });

  // Start Comparison Box
  let comparisonHTML = `
    <div class="comparison-box">

      <h2>Country Comparison</h2>

      <div>
        ${selectedNamesHTML}
      </div>
  `;

  // If only one country is selected
  if (comparisonData.length < 2) {

    comparisonHTML += `
      <p>Select one more country to compare.</p>
    `;

  } else {

    // Show Comparison Table
    comparisonHTML += `
      <table class="comparison-table">

        <tr>
          <th>Details</th>
          <th>${comparisonData[0].name}</th>
          <th>${comparisonData[1].name}</th>
        </tr>

        <tr>
          <td>Flag</td>
          <td>
            <img src="${comparisonData[0].flag}" width="80" alt="Country flag">
          </td>
          <td>
            <img src="${comparisonData[1].flag}" width="80" alt="Country flag">
          </td>
        </tr>

        <tr>
          <td>Capital</td>
          <td>${comparisonData[0].capital}</td>
          <td>${comparisonData[1].capital}</td>
        </tr>

        <tr>
          <td>Region</td>
          <td>${comparisonData[0].region}</td>
          <td>${comparisonData[1].region}</td>
        </tr>

        <tr>
          <td>Population</td>
          <td>${comparisonData[0].population}</td>
          <td>${comparisonData[1].population}</td>
        </tr>

      </table>
    `;
  }

  // Close Comparison Box
  comparisonHTML += `</div>`;

  // Show HTML on Page
  comparisonContainer.innerHTML = comparisonHTML;
}

// 12. Show Error
function showError() {
  container.innerHTML =
    '<p class="empty-message">Unable to load countries. Please try again.</p>';

  const retryBtn = document.createElement("button");
  retryBtn.type = "button";
  retryBtn.className = "retry-btn";
  retryBtn.textContent = "Retry";

  retryBtn.addEventListener("click", fetchCountries);

  container.appendChild(retryBtn);
}

// 13. Fetch Countries from API
async function fetchCountries() {
  container.innerHTML = `
    <div class="loading-card"></div>
    <div class="loading-card"></div>
    <div class="loading-card"></div>
  `;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }

    const data = await response.json();

    allCountries = data.map((country) => ({
      name: country.name,
      capital: country.capital || "N/A",
      region: country.region || "Unknown",
      flag: country.flags?.svg || country.flags?.png || "",
      population: formatPopulation(Number(country.population) || 0),
      rawPopulation: Number(country.population) || 0
    }));

    allCountries.sort((a, b) => a.name.localeCompare(b.name));

    filterCountries();

  } catch (error) {
    console.error("Error loading countries:", error);
    showError();
  }
}

// 14. Event Listeners

searchButton.addEventListener("click", filterCountries);

searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    filterCountries();
  }
});

regionFilter.addEventListener("change", filterCountries);
sortFilter.addEventListener("change", filterCountries);
favoritesFilter.addEventListener("change", filterCountries);

// Country Card Buttons
container.addEventListener("click", (event) => {

  const button = event.target.closest("button");

  if (!button) return;

  if (button.classList.contains("favorite-btn")) {
    toggleFavorite(button.dataset.name);

  } else if (button.classList.contains("details-btn")) {
    showCountryDetails(button.dataset.name);

  } else if (button.classList.contains("compare-btn")) {
    toggleCompare(button.dataset.name);
  }
});

// Remove Country from Comparison
comparisonContainer.addEventListener("click", (event) => {

  if (event.target.classList.contains("remove-compare-btn")) {

    const countryName = event.target.dataset.name;

    toggleCompare(countryName);
  }
});

// Close Popup Button
closeModal.addEventListener("click", () => {
  countryModal.style.display = "none";
});

// Close Popup Outside Click
countryModal.addEventListener("click", (event) => {
  if (event.target === countryModal) {
    countryModal.style.display = "none";
  }
});

// Close Popup with Escape Key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    countryModal.style.display = "none";
  }
});

// 15. Initialize Project
fetchCountries();
