const apiKey = "efc910e1f58c240acd61aea4d2226913";
let currentLang = "en-US";

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme preference or use system preference
const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);

// Update button icon based on theme
updateThemeIcon();

themeToggle.addEventListener('click', () => {
    let theme;
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        theme = 'light';
    } else {
        theme = 'dark';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon();
});

function updateThemeIcon() {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Language switcher logic
document.querySelectorAll(".language-option").forEach(option => {
    option.addEventListener("click", (e) => {
        e.preventDefault();
        currentLang = option.getAttribute("data-lang");
        document.getElementById("languageDropdown").innerHTML = 
            `<i class="fas fa-globe me-1"></i> ${option.textContent}`;
        loadAllSections(); // reload all sections in selected language
    });
});

// Search functionality
document.getElementById("searchButton").addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value.trim();
    if (query.length === 0) {
        document.getElementById("searchResultsSection").style.display = "none";
        loadAllSections();
        return;
    }

    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=${currentLang}&query=${query}`);
        const data = await res.json();
        showMovies(data.results, "searchResults");
        document.getElementById("searchResultsSection").style.display = "block";
        // Hide other sections
        document.querySelectorAll("section").forEach(section => {
            section.style.display = "none";
        });
    } catch (err) {
        console.error("Failed to fetch search results:", err);
    }
});

// Helper: Display movie cards in the given container
function showMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    movies.slice(0, 8).forEach(movie => {
        const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://via.placeholder.com/300x450?text=No+Image";

        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        
        const card = `
            <div class="col-md-3 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="position-relative">
                        <img src="${poster}" class="card-img-top" alt="${movie.title}">
                        <span class="position-absolute top-0 end-0 m-2 badge bg-dark">${releaseYear}</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-truncate" title="${movie.title}">${movie.title}</h5>
                        <div class="card-text movie-overview">${movie.overview || "No description available"}</div>
                        <div class="mt-auto pt-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="rating"><i class="fas fa-star text-warning"></i> ${movie.vote_average.toFixed(1)}</span>
                                <button class="btn btn-sm btn-outline-primary">Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}
// Fetch and show movies for a section
async function fetchAndDisplay(endpoint, containerId) {
    try {
        const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&language=${currentLang}&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        showMovies(data.results, containerId);
    } catch (err) {
        console.error(`Failed to fetch ${endpoint}:`, err);
    }
}

// Load all home page sections
function loadAllSections() {
    document.getElementById("searchResultsSection").style.display = "none";
    document.querySelectorAll("section").forEach(section => {
        section.style.display = "block";
    });
    fetchAndDisplay("trending/movie/week", "trending");
    fetchAndDisplay("movie/now_playing", "now-playing");
    fetchAndDisplay("movie/top_rated", "top-rated");
    fetchAndDisplay("movie/upcoming", "upcoming");
}

// Call on initial page load
loadAllSections();

// Add hover effects to cards
document.addEventListener('mouseover', function(e) {
    if (e.target.closest('.card')) {
        const card = e.target.closest('.card');
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.closest('.card')) {
        const card = e.target.closest('.card');
        card.style.transform = '';
        card.style.boxShadow = '';
    }
});