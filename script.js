
// Step 1: HTML container select karna
const container = document.querySelector("#countryContainer");

// Step 2: API URL
const API_URL =
    "https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags";

// Step 3: API se countries fetch karna
async function fetchCountries() {

    // Loading message
    container.textContent = "Loading countries...";

    try {

        // API request
        const response = await fetch(API_URL);

        // Response check
        if (!response.ok) {
            throw new Error("Failed to fetch countries");
        }

        // JSON data mein convert karna
        const countries = await response.json();

        // Old content remove karna
        container.innerHTML = "";

        // Step 4: Har country ka card banana
        countries.forEach(function(country) {

            const card = document.createElement("div");
            card.className = "country-card";

            // Country flag
            const flag = document.createElement("img");
            flag.src = country.flags.png;
            flag.alt = country.flags.alt || country.name.common;

            // Country name
            const name = document.createElement("h2");
            name.textContent = country.name.common;

            // Capital
            const capital = document.createElement("p");
            capital.textContent =
                "Capital: " + (country.capital?.[0] || "N/A");

            // Region
            const region = document.createElement("p");
            region.textContent = "Region: " + country.region;

            // Population
            const population = document.createElement("p");
            population.textContent =
                "Population: " +
                country.population.toLocaleString("en-IN");

            // Card ke andar elements add karna
            card.append(flag, name, capital, region, population);

            // Card ko container mein add karna
            container.appendChild(card);

        });

    } catch (error) {

        // Error message
        container.textContent =
            "Unable to load countries. Please try again.";

        console.log("Error:", error);
    }
}

// Step 5: Function call
fetchCountries();
