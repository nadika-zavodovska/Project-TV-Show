//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  const episodeCards = allEpisodes.map(createEpisodeCard);
  document.body.append(...episodeCards);
}

function createEpisodeCard(episode){
  const episodeCard = document.getElementById("episode-card-template").content.cloneNode(true);
  const episodeTitle = episodeCard.getElementById("episode_title");
  const episodeCodeField = episodeCard.getElementById("episode_code");
  const seasonNum = episode.season;
  const episodeNum = episode.number;
  const episodeCode = `S${seasonNum.toString().padStart(2, 0)}E${episodeNum.toString().padStart(2, 0)}`;
  const seasonNumber = episodeCard.getElementById("season_number");
  const episodeNumber = episodeCard.getElementById("episode_number");
  const episodeDuration = episodeCard.getElementById("episode_duration");
  const episodeImgMedsize = episodeCard.getElementById("episode_img_medsize");
  const episodeSummary = episodeCard.getElementById("episode_summary");
  const episodeButton = episodeCard.getElementById("episode_button");
  
  episodeTitle.textContent = episode.name;
  episodeCodeField.textContent = episodeCode;
  seasonNumber.textContent = episode.season;
  episodeNumber.textContent = episode.number;
  episodeDuration.textContent = episode.runtime;
  episodeImgMedsize.src = episode.image.medium;
  episodeImgMedsize.alt = `Image of ${episode.name}`;
  episodeSummary.innerHTML = episode.summary;
  episodeButton.href = episode.url;
  return episodeCard;
}

window.onload = setup;
