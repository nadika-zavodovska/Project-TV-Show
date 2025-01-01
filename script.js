// Declare a global variable to store fetched TV show and episode data
let cachedShows = [];
let cachedEpisodes = {};
let allEpisodes = [];

// Set up the app
function setup() {
  const container = document.createElement("div");
  container.id = "app-container";
  document.body.appendChild(container);

  // Create elements for loading and interaction
  const loadingMessage = document.createElement("p");
  loadingMessage.textContent = "Loading shows, please wait...";
  container.appendChild(loadingMessage);

  const showDropdown = document.createElement("select");
  showDropdown.id = "show-dropdown";
  container.appendChild(showDropdown);

  const episodeDropdown = document.createElement("select");
  episodeDropdown.id = "episode-dropdown";
  container.appendChild(episodeDropdown);

  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes...";
  container.appendChild(searchInput);

  const episodeContainer = document.createElement("div");
  episodeContainer.id = "episodes-container";
  container.appendChild(episodeContainer);

  // Fetch shows and populate dropdown
  fetchShows()
    .then((shows) => {
      cachedShows = shows;
      populateShowDropdown(shows, showDropdown);
      loadingMessage.remove();
    })
    .catch((error) => {
      loadingMessage.textContent = "Failed to load shows. Please try again later.";
      console.error("Error loading shows:", error);
    });

  // Handle show selection
  showDropdown.addEventListener("change", () => {
    const showId = showDropdown.value;
    if (showId === "default") return;

    if (cachedEpisodes[showId]) {
      populateEpisodeDropdown(cachedEpisodes[showId], episodeDropdown);
      renderEpisodes(cachedEpisodes[showId], episodeContainer);
    } else {
      fetchEpisodes(showId)
        .then((episodes) => {
          cachedEpisodes[showId] = episodes;
          populateEpisodeDropdown(episodes, episodeDropdown);
          renderEpisodes(episodes, episodeContainer);
        })
        .catch((error) => {
          console.error("Error loading episodes:", error);
          episodeContainer.textContent = "Failed to load episodes.";
        });
    }
  });

  // Episode dropdown functionality
  episodeDropdown.addEventListener("change", () => {
    const episodeId = episodeDropdown.value;
    if (episodeId === "default") return;
    const selectedEpisode = cachedEpisodes[showDropdown.value].find(episode => episode.id === parseInt(episodeId));
    renderEpisodes([selectedEpisode], episodeContainer);
  });

  // Implement search functionality
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const episodes = cachedEpisodes[showDropdown.value] || [];
    const filteredEpisodes = episodes.filter(episode => 
      episode.name.toLowerCase().includes(searchTerm) ||
      (episode.summary && episode.summary.toLowerCase().includes(searchTerm))
    );
    renderEpisodes(filteredEpisodes, episodeContainer);
  });
}

// Fetch the list of TV shows
async function fetchShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error("Failed to fetch shows");
  const shows = await response.json();
  return shows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

// Populate the show dropdown
function populateShowDropdown(shows, dropdown) {
  const defaultOption = document.createElement("option");
  defaultOption.value = "default";
  defaultOption.textContent = "Select a show...";
  dropdown.appendChild(defaultOption);

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    dropdown.appendChild(option);
  });
}

// Fetch episodes for a specific show
async function fetchEpisodes(showId) {
  const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
  if (!response.ok) throw new Error("Failed to fetch episodes");
  return await response.json();
}

// Render episodes
function renderEpisodes(episodes, container) {
  container.innerHTML = "";
  if (episodes.length === 0) {
    container.textContent = "No episodes available.";
    return;
  }
  episodes.forEach((episode) => {
    const card = createEpisodeCard(episode);
    container.appendChild(card);
  });
}

// Create an episode card
function createEpisodeCard(episode) {
  const card = document.createElement("div");
  card.className = "episode-card";

  const title = document.createElement("h3");
  title.textContent = `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
  card.appendChild(title);

  const image = document.createElement("img");
  image.src = episode.image ? episode.image.medium : "placeholder.jpg";
  image.alt = `Image of ${episode.name}`;
  card.appendChild(image);

  const summary = document.createElement("p");
  summary.innerHTML = episode.summary || "No summary available.";
  card.appendChild(summary);

  return card;
}

// Populate episode dropdown
function populateEpisodeDropdown(episodes, episodeDropdown) {
  episodeDropdown.innerHTML = '<option value="default">Select an episode...</option>';
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    episodeDropdown.appendChild(option);
  });
}

window.onload = setup;

