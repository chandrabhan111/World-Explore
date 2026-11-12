const API_URL =
  "https://countries.dev/countries?fields=name,capital,region,population,flags";

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

let allCountries = [];

let favoriteCountries = [];
try {
  favoriteCountries = JSON.parse(
    localStorage.getItem("favoriteCountries")
  ) || [];
} catch {
  favoriteCountries = [];
}

function formatPopulation(num) {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + " B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + " M";
  if (num >= 1_000) return (num / 1_000).toFixed(0) + " K";
  return String(num);
}

function updateStatistics(filteredCountries) {
  totalCountries.textContent = allCountries.length;
  showingCountries.textContent = filteredCountries.length;
  favoriteCount.textContent = favoriteCountries.length;
}

function renderCards(countries) {
  container.innerHTML = "";
  updateStatistics(countries);

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

    const favoriteBtn = document.createElement("button");
    favoriteBtn.type = "button";
    favoriteBtn.className = "favorite-btn";
    favoriteBtn.dataset.name = country.name;
    favoriteBtn.textContent = favoriteCountries.includes(country.name)
      ? "❤️ Remove Favorite"
      : "🤍 Add Favorite";

    const detailsBtn = document.createElement("button");
    detailsBtn.type = "button";
    detailsBtn.className = "details-btn";
    detailsBtn.dataset.name = country.name;
    detailsBtn.textContent = "View Details";

    card.append(favoriteBtn, detailsBtn);
    container.appendChild(card);
  });
}

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

function toggleFavorite(countryName) {
  if (favoriteCountries.includes(countryName)) {
    favoriteCountries = favoriteCountries.filter((name) => name !== countryName);
  } else {
    favoriteCountries.push(countryName);
  }

  localStorage.setItem("favoriteCountries", JSON.stringify(favoriteCountries));
  filterCountries();
}

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

async function fetchCountries() {
  container.innerHTML = `
    <div class="loading-card"></div>
    <div class="loading-card"></div>
    <div class="loading-card"></div>
  `;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch countries");

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

searchButton.addEventListener("click", filterCountries);

searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") filterCountries();
});

regionFilter.addEventListener("change", filterCountries);
sortFilter.addEventListener("change", filterCountries);
favoritesFilter.addEventListener("change", filterCountries);

container.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.classList.contains("favorite-btn")) {
    toggleFavorite(button.dataset.name);
  } else if (button.classList.contains("details-btn")) {
    showCountryDetails(button.dataset.name);
  }
});

closeModal.addEventListener("click", () => {
  countryModal.style.display = "none";
});

countryModal.addEventListener("click", (event) => {
  if (event.target === countryModal) {
    countryModal.style.display = "none";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    countryModal.style.display = "none";
  }
});

fetchCountries();