//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  // rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

const allEpisodes = getAllEpisodes();

const header = document.getElementById('header');
console.log(header);
console.log(allEpisodes[0]['name']);

window.onload = setup;
