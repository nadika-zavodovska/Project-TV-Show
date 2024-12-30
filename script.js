// Declare and assign an array to store the episode data 
let allEpisodes = [];

function setup() {
  // Create a container for episodes
  const episodeContainer = document.createElement("div");
  episodeContainer.id = "episodes-container";
  document.body.appendChild(episodeContainer);

  // Show a loading message while the data is fetching
  const loadingMessage = document.createElement("p");
  loadingMessage.textContent = "Loading episodes, please wait...";
  document.body.insertBefore(loadingMessage, episodeContainer);

  // Fetch the episodes data
  fetchEpisodes().then((episodes) => {
    // When the data is fetched, remove the loading message.
    loadingMessage.remove();
    // Store the fetched episodes
    allEpisodes = episodes;

    // Render all episodes initially
    renderEpisodes(allEpisodes, episodeContainer);
    // Add search box and episode selector
    setupSearch(allEpisodes, episodeContainer);
    setupEpisodeSelector(allEpisodes, episodeContainer);
  }).catch((error) => {
    loadingMessage.textContent = "Failed to load episodes. Please try again later.";
    console.error("Error loading episodes:", error);
  });
}

// Fetch episodes from the API
async function fetchEpisodes() {
  // If data is already fetched, return the cached data
  if (allEpisodes.length > 0) {
    return allEpisodes;
  }
  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const episodes = await response.json();
    return episodes;
  } catch (error) {
    throw new Error("Failed to fetch episodes: " + error.message);
  }
}

// Function to render episodes into the container
function renderEpisodes(episodes, container) {
  // Clear previous content
  container.innerHTML = "";
  if (episodes.length === 0) {
    container.textContent = "No episodes match your search.";
  } else {
    episodes.forEach((episode) => container.appendChild(createEpisodeCard(episode)));
  }
}

// Create individual episode card
function createEpisodeCard(episode) {
  const episodeCard = document
    .getElementById("episode-card-template")
    .content.cloneNode(true);

  const episodeTitle = episodeCard.querySelector("#episode_title");
  const seasonNum = episode.season;
  const episodeNum = episode.number;
  const episodeCode = ` - S${seasonNum.toString().padStart(2, "0")}E${episodeNum
    .toString()
    .padStart(2, "0")}`;
  const seasonNumber = episodeCard.querySelector("#season_number");
  const episodeNumber = episodeCard.querySelector("#episode_number");
  const episodeDuration = episodeCard.querySelector("#episode_duration");
  const episodeImgMedsize = episodeCard.querySelector("#episode_img_medsize");
  const episodeSummary = episodeCard.querySelector("#episode_summary");
  const episodeButton = episodeCard.querySelector("#episode_button");

  episodeTitle.textContent = episode.name + episodeCode;
  seasonNumber.textContent = `Season ${episode.season}`;
  episodeNumber.textContent = `Episode ${episode.number}`;
  episodeDuration.textContent = `Duration: ${episode.runtime} minutes`;
  episodeImgMedsize.src = episode.image.medium;
  episodeImgMedsize.alt = `Image of ${episode.name}`;
  episodeSummary.innerHTML = episode.summary;
  episodeButton.href = episode.url;

  return episodeCard;
}

// New Feature 1: Live Search
function setupSearch(episodes, episodeContainer) {
  // Create search box
  const searchBox = document.createElement("input");
  searchBox.type = "text";
  searchBox.id = "search-box";
  searchBox.placeholder = "Search episodes...";
  document.body.insertBefore(searchBox, episodeContainer);

  const resultsCount = document.createElement("p");
  resultsCount.id = "results-count";
  resultsCount.textContent = `All ${episodes.length} episodes are shown`;
  document.body.insertBefore(resultsCount, episodeContainer);

  searchBox.addEventListener("input", () => {
    const searchTerm = searchBox.value.toLowerCase();
    const filteredEpisodes = episodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(searchTerm) ||
        (ep.summary && ep.summary.toLowerCase().includes(searchTerm))
    );
    // Update results count
    resultsCount.textContent = `${filteredEpisodes.length} / ${episodes.length} episodes shown`;

    // Re-render filtered episodes
    renderEpisodes(filteredEpisodes, episodeContainer);
  });
}

// New Feature 2: Episode Selector
function setupEpisodeSelector(episodes, episodeContainer) {
  // Create episode selector
  const episodeSelector = document.createElement("select");
  episodeSelector.id = "episode-selector";
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All Episodes";
  episodeSelector.appendChild(defaultOption);
  document.body.insertBefore(episodeSelector, episodeContainer);

  // Populate the selector
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `S${episode.season
      .toString()
      .padStart(2, "0")}E${episode.number.toString().padStart(2, "0")} - ${episode.name
      }`;
    episodeSelector.appendChild(option);
  });

  episodeSelector.addEventListener("change", () => {
    const selectedId = episodeSelector.value;

    if (selectedId === "all") {
      // Show all episodes if "all" is selected
      renderEpisodes(episodes, episodeContainer);
    } else {
      // Show only the selected episode
      const selectedEpisode = episodes.find((ep) => ep.id == selectedId);
      if (selectedEpisode) {
        renderEpisodes([selectedEpisode], episodeContainer);
      }
    }
  });
}

window.onload = setup;