// Declare a global variable to store fetched TV show and episode data
let cachedShows = [];
let cachedEpisodes = {};

// Function to toggle between front-page-view and episode-page-view
function toggleView(view) {
  const frontPage = document.getElementById("front-page-view");
  const episodePage = document.getElementById("episode-page-view");

  if (view === "episodes") {
    frontPage.style.display = "none";
    episodePage.style.display = "block";
  } else {
    frontPage.style.display = "block";
    episodePage.style.display = "none";
  }
}

// Fetch the list of TV shows
async function fetchShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error("Failed to fetch shows");
  return (await response.json()).sort((a, b) => a.name.localeCompare(b.name));
}

// Populate the show dropdown
function populateShowDropdown(shows, dropdown) {
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    dropdown.appendChild(option);
  });
}

// Render shows using template
function renderShows(shows, container) {
  container.innerHTML = "";
  const template = document.getElementById("show-card-template").content;

  if (shows.length === 0) {
    container.innerHTML = "<p>No shows found.</p>";
    return;
  }

  shows.forEach((show) => {
    const card = template.cloneNode(true);
    card.querySelector(".show-title").textContent = show.name;
    card.querySelector(".show-image").src = show.image ? show.image.medium : "placeholder.jpg";
    card.querySelector(".show-summary").innerHTML = show.summary || "No summary available.";
    card.querySelector(".show-genres").textContent = show.genres.join(", ");
    card.querySelector(".show-status").textContent = show.status;
    card.querySelector(".show-rating").textContent = show.rating.average || "N/A";
    card.querySelector(".show-runtime").textContent = show.runtime || "N/A";
    // Add click event to navigate to episodes
    const showTitle = card.querySelector(".show-title");
    showTitle.style.cursor = "pointer";
    showTitle.classList.add("show-link"); // Add a class for styling if needed
    showTitle.addEventListener("click", () => {
      // Update the dropdown to the selected show, load episodes
      document.getElementById("show-dropdown").value = show.id;
      document.getElementById("show-dropdown").dispatchEvent(new Event("change"));
    });
    container.appendChild(card);
  });
}

// Update the show count
function updateShowNumCount(shownCount, totalCount) {
  const showNumCount = document.querySelector(".show-num-count");
  showNumCount.textContent = `Showing ${shownCount} show(s) from ${totalCount} show(s)`;
}

// Fetch episodes for a specific show what we selected
async function fetchEpisodes(showId) {
  const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
  if (!response.ok) throw new Error("Failed to fetch episodes");
  return await response.json();
}

// Populate episode dropdown
function populateEpisodeDropdown(episodes, dropdown) {
  dropdown.innerHTML = '<option value="default">Select an episode...</option>';
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    dropdown.appendChild(option);
  });
}

// Render episodes using template
function renderEpisodes(episodes, container) {
  container.innerHTML = "";
  const template = document.getElementById("episode-card-template").content;

  if (episodes.length === 0) {
    container.textContent = "No episodes available.";
    return;
  }

  episodes.forEach((episode) => {
    const card = template.cloneNode(true);
    // Set episode card content
    card.querySelector(".episode-title").textContent = `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    card.querySelector(".episode-image").src = episode.image ? episode.image.medium : "placeholder.jpg";
    card.querySelector(".episode-summary").innerHTML = episode.summary || "No summary available.";
    container.appendChild(card);
  });
}

// Update the episode-num-count
function updateEpisodeNumCount(shownCount, totalCount) {
  const episodeNumCount = document.querySelector(".episode-num-count");
  episodeNumCount.textContent = `Showing ${shownCount} episode${shownCount !== 1 ? 's' : ''} from ${totalCount} episode${totalCount !== 1 ? 's' : ''}`;
}

// Reset episode selector
function resetEpisodeSelector(episodeDropdown, episodeContainer) {
  episodeDropdown.innerHTML = '<option value="default">Select an episode...</option>';
  episodeContainer.innerHTML = "";
}

// Set up the app
function setup() {
  const showDropdown = document.getElementById("show-dropdown");
  const showFilter = document.querySelector(".show-filter");
  const showList = document.getElementById("show-list");
  const backToShowsButton = document.querySelector(".back-to-shows");
  const episodeDropdown = document.getElementById("episode-dropdown");
  const episodeFilter = document.querySelector(".episode-filter");
  const episodeContainer = document.getElementById("episode-list");

  // Fetch shows and populate dropdown, only if shows are not cached to make sure fetching url only once
  if (cachedShows.length === 0) {
    fetchShows()
      .then((shows) => {
        // Cache fetched shows
        cachedShows = shows;
        populateShowDropdown(shows, showDropdown);
        renderShows(shows, showList);
        updateShowNumCount(shows.length, shows.length);

      })
      .catch((error) => {
        showList.textContent = "Failed to load shows. Please try again later.";
        console.error("Error loading shows:", error);
      });
  } else {
    // If shows are already cached, just populate and render them, update show-num-count
    populateShowDropdown(cachedShows, showDropdown);
    renderShows(cachedShows, showList);
    updateShowNumCount(cachedShows.length, cachedShows.length);
  }

  // Handle show selection from dropdown
  showDropdown.addEventListener("change", () => {
    const showId = showDropdown.value;
    // If default is selected, show all shows
    if (showId === "default") {
      renderShows(cachedShows, showList);
      updateShowNumCount(cachedShows.length, cachedShows.length);
      return;
    }
    const selectedShow = cachedShows.find((show) => show.id == showId);
    renderShows([selectedShow], showList);
    updateShowNumCount(1, cachedShows.length);

    if (cachedEpisodes[showId]) {
      const episodes = cachedEpisodes[showId];
      populateEpisodeDropdown(episodes, episodeDropdown);
      renderEpisodes(episodes, episodeContainer);
      updateEpisodeNumCount(episodes.length, episodes.length);
      toggleView("episodes");
    } else {
      fetchEpisodes(showId)
        .then((episodes) => {
          cachedEpisodes[showId] = episodes;
          populateEpisodeDropdown(episodes, episodeDropdown);
          renderEpisodes(episodes, episodeContainer);
          updateEpisodeNumCount(episodes.length, episodes.length);
          toggleView("episodes");
        })
        .catch((error) => {
          episodeContainer.innerHTML = "<p>Failed to load episodes. Please try again later.</p>";
          console.error("Error loading episodes:", error);
        });
    }
  });

  // Show filter functionality
  showFilter.addEventListener("input", () => {
    const filterText = showFilter.value.toLowerCase();
    const filteredShows = cachedShows.filter((show) => {
      return (
        show.name.toLowerCase().includes(filterText) ||
        (show.summary && show.summary.toLowerCase().includes(filterText)) ||
        show.genres.some((genre) => genre.toLowerCase().includes(filterText))
      );
    });

    renderShows(filteredShows, showList);
    updateShowNumCount(filteredShows.length, cachedShows.length);
  });

  // Episode filter functionality
  episodeFilter.addEventListener("input", () => {
    const filterText = episodeFilter.value.toLowerCase();
    const showId = showDropdown.value;
    const episodes = cachedEpisodes[showId] || [];
    const filteredEpisodes = episodes.filter((episode) =>
      episode.name.toLowerCase().includes(filterText) ||
      (episode.summary && episode.summary.toLowerCase().includes(filterText))
    );

    renderEpisodes(filteredEpisodes, episodeContainer);
    updateEpisodeNumCount(filteredEpisodes.length, episodes.length);
  });

  // Episode dropdown functionality
  episodeDropdown.addEventListener("change", () => {
    const episodeId = episodeDropdown.value;
    if (episodeId === "default") return;

    const selectedEpisode = cachedEpisodes[showDropdown.value].find(
      (episode) => episode.id == episodeId
    );
    renderEpisodes([selectedEpisode], episodeContainer);
  });

  // Back to Shows Button, functionality on click
  backToShowsButton.addEventListener("click", () => {
    // Switch to front-page-view shows
    toggleView("shows");
    resetEpisodeSelector(episodeDropdown, episodeContainer);
    // Reset the show dropdown to default
    showDropdown.value = "default";
    renderShows(cachedShows, showList);
    updateShowNumCount(cachedShows.length, cachedShows.length);
  });
}
// Initialise the app
window.onload = setup;
