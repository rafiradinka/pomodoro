const sidebar = document.querySelector(".sidebar");
const sidebarClose = document.querySelector("#sidebar-close");
const menu = document.querySelector(".menu-content");
const menuItems = document.querySelectorAll(".submenu-item");
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

sidebarClose.addEventListener("click", () => sidebar.classList.toggle("close"));
menuItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    menu.classList.add("submenu-active");
    item.classList.add("show-submenu");
    menuItems.forEach((item2, index2) => {
      if (index !== index2) {
        item2.classList.remove("show-submenu");
      }
    });
  });
});

function addTask() {
  if (inputBox.value === "") {
    alert("Anda harus menuliskan sesuatu!");
  } else {
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
  }
  inputBox.value = "";
  saveData();
}

listContainer.addEventListener(
  "click",
  function (e) {
    if (e.target.tagName === "LI") {
      e.target.classList.toggle("checked");
      saveData();
    } else if (e.target.tagName === "SPAN") {
      e.target.parentElement.remove();
      saveData();
    }
  },
  false
);

function saveData() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
  listContainer.innerHTML = localStorage.getItem("data");
}

showTask();

//  pomodoro
(function () {
  const fehBody = document.body;
  const workDurationInput = document.getElementById("work-duration");
  const restDurationInput = document.getElementById("rest-duration");
  const timerTime = document.getElementById("timer-time");
  const circleProgress = document.querySelector(".circle-progress");
  const spotifyPlayer = document.querySelector("#spotify-player iframe");

  let workDuration = parseInt(workDurationInput.value) * 60;
  let restDuration = parseInt(restDurationInput.value) * 60;
  let remainingTime = workDuration;
  let isPaused = true;
  let isWorking = true;
  let interValId;

  const completedSeassionsElement =
    document.getElementById("completed-sessions");
  let completedSessions = 0;

  // page loaded
  window.addEventListener("load", () => {
    fehBody.classList.add("page-loaded");
  });

  // start
  const startBtn = document.getElementById("start-btn");
  startBtn.addEventListener("click", () => {
    isPaused = false;

    fehBody.classList.add("timer-running");
    if (isWorking) {
      fehBody.classList.remove("timer-paused");
      // Auto-play work playlist
      if (spotifyPlayer) {
        spotifyPlayer.src = spotifyPlayer.src.replace(
          "&autoplay=0",
          "&autoplay=1"
        );
      }
    } else {
      fehBody.classList.add("rest-mode");
      fehBody.classList.remove("timer-paused");
    }

    if (!interValId) {
      interValId = setInterval(updateTimer, 1000);
    }
  });

  // pause
  const pauseBtn = document.getElementById("pause-btn");
  pauseBtn.addEventListener("click", () => {
    isPaused = true;
    fehBody.classList.remove("timer-running");
    fehBody.classList.add("timer-paused");

    if (interValId) {
      clearInterval(interValId);
      interValId = null;
    }

    // Pause spotify when timer is paused
    if (spotifyPlayer) {
      spotifyPlayer.contentWindow.postMessage('{"command":"pause"}', "*");
    }
  });

  // settings
  const btnToggleSettings = document.getElementById("toggle-settings");
  const btnCloseSettings = document.getElementById("close-settings");

  function setBodySettings() {
    fehBody.classList.contains("settings-active")
      ? fehBody.classList.remove("settings-active")
      : fehBody.classList.add("settings-active");
  }

  function toggleSettings(event) {
    if (event.type === "click") {
      setBodySettings();
    } else if (event.type === "keydown" && event.keyCode === 27) {
      fehBody.classList.remove("settings-active");
    }
  }

  btnToggleSettings.addEventListener("click", toggleSettings);
  btnCloseSettings.addEventListener("click", toggleSettings);
  document.addEventListener("keydown", toggleSettings);
  // work / rest settings
  workDurationInput.addEventListener("change", () => {
    workDuration = parseInt(workDurationInput.value) * 60;
    if (isWorking) {
      remainingTime = workDuration;
      updateProgress();
    }
  });

  restDurationInput.addEventListener("change", () => {
    restDuration = parseInt(restDurationInput.value) * 60;
    if (!isWorking) {
      remainingTime = restDuration;
      updateProgress();
    }
  });

  // update timer
  function updateTimer() {
    if (!isPaused) {
      remainingTime--;
      if (remainingTime <= 0) {
        isWorking = !isWorking;
        remainingTime = isWorking ? workDuration : restDuration;

        // Handle session completion and mode switching
        if (!isWorking) {
          fehBody.classList.add("rest-mode");
          fehBody.classList.remove("timer-running");
          completedSessions++;
          completedSeassionsElement.textContent = completedSessions;

          // Switch to rest playlist
          if (spotifyPlayer) {
            spotifyPlayer.src = spotifyPlayer.src.replace(
              "https://open.spotify.com/embed/artist/7HjVvgY9p57LOIrGyulrVU?utm_source=generator"
            );
          }
        } else {
          fehBody.classList.remove("rest-mode");
          fehBody.classList.remove("timer-running");

          // Switch back to work playlist
          if (spotifyPlayer) {
            spotifyPlayer.src = spotifyPlayer.src.replace(
              "https://open.spotify.com/embed/artist/7HjVvgY9p57LOIrGyulrVU?utm_source=generator"
            );
          }
        }

        const playAlarm = isWorking ? restFinished : workFinished;
        playAlarm.play();

        isPaused = true;
        fehBody.classList.add("timer-paused");

        if (interValId) {
          clearInterval(interValId);
          interValId = null;
        }
      }

      updateProgress();
    }
  }

  // update progress
  function updateProgress() {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;

    const totalDuration = isWorking ? workDuration : restDuration;
    const dashOffset = (circumference * remainingTime) / totalDuration;

    circleProgress.style.strokeDashoffset = dashOffset;
    timerTime.textContent = formatTime(remainingTime);
    document.title = `${formatTime(remainingTime)} - Radinka`;
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Initial setup
  updateProgress();
})();
