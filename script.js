let now_playing = document.querySelector(".now-playing");
const wrapper = document.querySelector(".wrapper"),
  musicName = wrapper.querySelector(".song-details .name"),
  musicArtist = wrapper.querySelector(".song-details .artist"),
  playPauseBtn = wrapper.querySelector(".play-pause"),
  prevBtn = wrapper.querySelector("#prev"),
  nextBtn = wrapper.querySelector("#next"),
  mainAudio = wrapper.querySelector("#main-audio"),
  progressArea = wrapper.querySelector(".progress-area"),
  progressBar = progressArea.querySelector(".progress-bar"),
  musicList = wrapper.querySelector(".music-list"),
  moreMusicBtn = wrapper.querySelector("#more-music"),
  closemoreMusic = musicList.querySelector("#close");

let recent_volume = document.querySelector("#volume");
let wave = document.getElementById("wave");

let musicIndex = 1;
let currentSlide = 0; // Initial slide index
isMusicPaused = true;

window.addEventListener("load", () => {
  loadMusic(musicIndex);
  playingSong();
  updateSliderPosition();
});

function loadMusic(indexNumb) {
  const songData = allMusic[indexNumb - 1];

  musicName.innerText = songData.name;
  musicArtist.innerText = songData.artist;

  // Define a mapping of album names to directory names
  const albumDirectoryMap = {
    "Life in Open G": "album-1",
    "Album 2": "album-2",
  };

  // Get the correct directory, defaulting to "unknown" if not mapped
  const albumDir = albumDirectoryMap[songData.album] || "unknown";

  // Construct the file path using the mapped directory
  mainAudio.src = `songs/${albumDir}/${songData.src}.mp3`;

  // Remove previous event listener if any
  mainAudio.removeEventListener("loadeddata", updateMusicDuration);
  mainAudio.addEventListener("loadeddata", updateMusicDuration);

  // Update the slider position based on the current album
  updateSliderToCurrentMusic();
}

function updateMusicDuration() {
  let mainAdDuration = mainAudio.duration;
  if (isNaN(mainAdDuration)) {
    // Retry if the duration is not available
    setTimeout(updateMusicDuration, 100);
    return;
  }
  let totalMin = Math.floor(mainAdDuration / 60);
  let totalSec = Math.floor(mainAdDuration % 60);
  if (totalSec < 10) {
    totalSec = `0${totalSec}`;
  }
  let musicDuration = wrapper.querySelector(".max-duration");
  musicDuration.innerText = `${totalMin}:${totalSec}`;
}

function playMusic() {
  wrapper.classList.add("paused");
  playPauseBtn.querySelector("i").innerText = "pause";
  mainAudio.play();
}

function pauseMusic() {
  wrapper.classList.remove("paused");
  playPauseBtn.querySelector("i").innerText = "play_arrow";
  mainAudio.pause();
}

function prevMusic() {
  musicIndex--;
  if (musicIndex < 1) {
    musicIndex = allMusic.length;
  }
  loadMusic(musicIndex);
  playMusic();
  playingSong();
}

function nextMusic() {
  musicIndex++;
  if (musicIndex > allMusic.length) {
    musicIndex = 1;
  }
  loadMusic(musicIndex);
  playMusic();
  playingSong();
}

playPauseBtn.addEventListener("click", () => {
  const isMusicPlay = wrapper.classList.contains("paused");
  isMusicPlay ? pauseMusic() : playMusic();
  playingSong();
});

prevBtn.addEventListener("click", () => {
  prevMusic();
});

nextBtn.addEventListener("click", () => {
  nextMusic();
});

mainAudio.addEventListener("timeupdate", (e) => {
  const currentTime = e.target.currentTime;
  const duration = e.target.duration;
  let progressWidth = (currentTime / duration) * 100;
  progressBar.style.width = `${progressWidth}%`;

  let musicCurrentTime = wrapper.querySelector(".current-time"),
    musicDuration = wrapper.querySelector(".max-duration");

  let currentMin = Math.floor(currentTime / 60);
  let currentSec = Math.floor(currentTime % 60);
  if (currentSec < 10) {
    currentSec = `0${currentSec}`;
  }
  musicCurrentTime.innerText = `${currentMin}:${currentSec}`;
});

progressArea.addEventListener("click", (e) => {
  let progressWidth = progressArea.clientWidth;
  let clickedOffsetX = e.offsetX;
  let songDuration = mainAudio.duration;

  mainAudio.currentTime = (clickedOffsetX / progressWidth) * songDuration;
  playMusic();
  playingSong();
});

const repeatBtn = wrapper.querySelector("#repeat-plist");
repeatBtn.addEventListener("click", () => {
  let getText = repeatBtn.innerText;
  switch (getText) {
    case "repeat":
      repeatBtn.innerText = "repeat_one";
      repeatBtn.setAttribute("title", "Song looped");
      break;
    case "repeat_one":
      repeatBtn.innerText = "shuffle";
      repeatBtn.setAttribute("title", "Playback shuffled");
      break;
    case "shuffle":
      repeatBtn.innerText = "repeat";
      repeatBtn.setAttribute("title", "Playlist looped");
      break;
  }
});

mainAudio.addEventListener("ended", () => {
  let getText = repeatBtn.innerText;
  switch (getText) {
    case "repeat":
      nextMusic();
      break;
    case "repeat_one":
      mainAudio.currentTime = 0;
      loadMusic(musicIndex);
      playMusic();
      break;
    case "shuffle":
      let randIndex = Math.floor(Math.random() * allMusic.length + 1);
      do {
        randIndex = Math.floor(Math.random() * allMusic.length + 1);
      } while (musicIndex == randIndex);
      musicIndex = randIndex;
      loadMusic(musicIndex);
      playMusic();
      break;
  }
});

moreMusicBtn.addEventListener("click", () => {
  musicList.classList.toggle("show");
});

closemoreMusic.addEventListener("click", () => {
  moreMusicBtn.click();
});

const albumDirectoryMap = {
  "Life in Open G": "album-1",
  "Album 2": "album-2",
};

const ulTag = wrapper.querySelector("ul");
for (let i = 0; i < allMusic.length; i++) {
  const songData = allMusic[i];
  // Get the correct directory for the current song's album
  const albumDir = albumDirectoryMap[songData.album] || "unknown";

  let liTag = `<li li-index="${i + 1}">
                <div class="row">
                  <span>${songData.name}</span>
                  <p>${songData.album}</p>
                </div>
                <span id="${songData.src}" class="audio-duration">${
    songData.duration || "00:00"
  }</span>
                <audio class="${songData.src}" src="songs/${albumDir}/${
    songData.src
  }.mp3"></audio>
              </li>`;
  ulTag.insertAdjacentHTML("beforeend", liTag);

  let liAudioDurationTag = ulTag.querySelector(`#${songData.src}`);
  let liAudioTag = ulTag.querySelector(`.${songData.src}`);
  liAudioTag.addEventListener("loadeddata", () => {
    let duration = liAudioTag.duration;
    let totalMin = Math.floor(duration / 60);
    let totalSec = Math.floor(duration % 60);
    if (totalSec < 10) {
      totalSec = `0${totalSec}`;
    }
    liAudioDurationTag.innerText = `${totalMin}:${totalSec}`;
    liAudioDurationTag.setAttribute("t-duration", `${totalMin}:${totalSec}`);
  });
}

function playingSong() {
  const allLiTag = ulTag.querySelectorAll("li");

  for (let j = 0; j < allLiTag.length; j++) {
    let audioTag = allLiTag[j].querySelector(".audio-duration");

    if (allLiTag[j].classList.contains("playing")) {
      allLiTag[j].classList.remove("playing");
      let adDuration = audioTag.getAttribute("t-duration");
      audioTag.innerText = adDuration;
    }

    if (allLiTag[j].getAttribute("li-index") == musicIndex) {
      allLiTag[j].classList.add("playing");
      audioTag.innerText = "Playing";
    }

    allLiTag[j].setAttribute("onclick", "clicked(this)");
  }
}

function clicked(element) {
  let getLiIndex = element.getAttribute("li-index");
  musicIndex = getLiIndex;
  loadMusic(musicIndex);
  playMusic();
  playingSong();
  updateSliderToCurrentMusic();
}

/* function mute_sound() {
  mainAudio.volume = 0;
  volume.value = 0;
} */

function volume_change() {
  mainAudio.volume = recent_volume.value / 100;
}

function updateSliderPosition() {
  const imgWrapper = document.querySelector(".img-wrapper");
  const album = allMusic[musicIndex - 1].album;
  const albumIndex = [...new Set(allMusic.map((music) => music.album))].indexOf(
    album
  );
  imgWrapper.style.transform = `translateX(-${albumIndex * 100}%)`; // Adjust translation based on album index
}

function updateSliderToCurrentMusic() {
  updateSliderPosition();
}

const nextSlide = document.getElementById("next-slide");
const prevSlide = document.getElementById("prev-slide");

nextSlide.addEventListener("click", function () {
  if (currentSlide < document.querySelectorAll(".img-area").length - 1) {
    currentSlide++;
  } else {
    currentSlide = 0;
  }
  updateSliderPosition();

  // Update music index to match the new album
  const album = [...new Set(allMusic.map((music) => music.album))][
    currentSlide
  ];
  musicIndex = allMusic.findIndex((music) => music.album === album) + 1;
  loadMusic(musicIndex);
  playMusic();
  playingSong();
});

prevSlide.addEventListener("click", function () {
  if (currentSlide > 0) {
    currentSlide--;
  } else {
    currentSlide = document.querySelectorAll(".img-area").length - 1;
  }
  updateSliderPosition();

  // Update music index to match the new album
  const album = [...new Set(allMusic.map((music) => music.album))][
    currentSlide
  ];
  musicIndex = allMusic.findIndex((music) => music.album === album) + 1;
  loadMusic(musicIndex);
  playMusic();
  playingSong();
});
