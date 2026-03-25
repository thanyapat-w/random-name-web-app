document.addEventListener("DOMContentLoaded", () => {
  const appRoot = document.getElementById("appRoot");
  const nameListElement = document.getElementById("nameList");
  const loadLockButton = document.getElementById("loadLockButton");
  const unlockButton = document.getElementById("unlockButton");
  const resetButton = document.getElementById("resetButton");
  const presentButton = document.getElementById("presentButton");
  const randomNumberSelector = document.getElementById("randomNumber");
  const removeAfterDrawCheckbox = document.getElementById("removeAfterDraw");
  const attendeesCountElement = document.getElementById("attendeesCount");
  const lockStatusElement = document.getElementById("lockStatus");
  const statusBox = document.getElementById("statusBox");
  const resultCard = document.getElementById("resultCard");
  const resultBoxElement = document.getElementById("resultBox");
  const confettiLayer = document.getElementById("confettiLayer");
  const pushButton = document.getElementById("pushButton");

  let names = [];
  let isLocked = false;
  let drawState = "idle";

  function normalizeNames(rawText) {
    return [
      ...new Set(
        rawText
          .split("\n")
          .map((name) => name.trim())
          .filter((name) => name !== "")
      ),
    ];
  }

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }

  function updateCounts() {
    attendeesCountElement.textContent = names.length.toLocaleString();
  }

  function updateLockStatus() {
    lockStatusElement.textContent = isLocked ? "Locked" : "Open";
  }

  function setStatus(message) {
    statusBox.textContent = message;
  }

  function showEmptyState() {
    resultCard.classList.remove("showing", "single-winner-mode", "is-rolling");
    resultBoxElement.innerHTML = '<div class="result-empty"></div>';
  }

  function animatePushButton() {
    pushButton.classList.add("is-pressed");
    setTimeout(() => {
      pushButton.classList.remove("is-pressed");
    }, 140);
  }

  function updatePushButtonState() {
    pushButton.classList.remove("is-disabled", "is-waiting");

    if (!isLocked) {
      pushButton.classList.add("is-disabled");
      return;
    }

    if (drawState === "drawing") {
      pushButton.classList.add("is-disabled");
      return;
    }

    pushButton.classList.add("is-waiting");
  }

  function lockInput() {
    isLocked = true;
    nameListElement.setAttribute("readonly", "true");
    loadLockButton.setAttribute("disabled", "true");
    updateLockStatus();
    updatePushButtonState();
  }

  function unlockInput() {
    isLocked = false;
    nameListElement.removeAttribute("readonly");
    loadLockButton.removeAttribute("disabled");
    updateLockStatus();
    updatePushButtonState();
  }

  function clearResultScreen() {
    showEmptyState();
    drawState = "idle";
    updatePushButtonState();
  }

  function getListClass(count) {
    return count > 10 ? "winner-list two-columns" : "winner-list one-column";
  }

  function getSizeClass(count) {
    if (count <= 3) return "size-xl";
    if (count <= 6) return "size-large";
    if (count <= 10) return "size-small";
    if (count <= 16) return "size-small";
    return "size-xs";
  }

  function shrinkToFit(element, startSize, minSize) {
    let size = startSize;
    element.style.fontSize = `${size}px`;

    while (element.scrollWidth > element.clientWidth && size > minSize) {
      size -= 2;
      element.style.fontSize = `${size}px`;
    }
  }

  function renderWinners(winners) {
    resultCard.classList.add("showing");
    resultCard.classList.remove("single-winner-mode", "is-rolling");

    if (winners.length === 1) {
      resultCard.classList.add("single-winner-mode");
      resultBoxElement.innerHTML = `
        <div class="winner-single">
          ${escapeHtml(winners[0])}
        </div>
      `;

      const singleEl = resultBoxElement.querySelector(".winner-single");
      if (singleEl && appRoot.classList.contains("preview-mode")) {
        shrinkToFit(singleEl, 56, 28);
      }
      if (singleEl && appRoot.classList.contains("presentation-mode")) {
        shrinkToFit(singleEl, 112, 50);
      }

      return;
    }

    const listClass = getListClass(winners.length);
    const sizeClass = getSizeClass(winners.length);

    const items = winners
      .map((name) => `<li class="winner-list-item ${sizeClass}">${escapeHtml(name)}</li>`)
      .join("");

    resultBoxElement.innerHTML = `
      <ul class="${listClass}">
        ${items}
      </ul>
    `;
  }

  function renderRollingGrid(sampleNames) {
    resultCard.classList.add("is-rolling");
    resultCard.classList.toggle("single-winner-mode", sampleNames.length === 1);

    if (sampleNames.length === 1) {
      resultBoxElement.innerHTML = `
        <div class="rolling-name">
          ${escapeHtml(sampleNames[0])}
        </div>
      `;

      const rollingEl = resultBoxElement.querySelector(".rolling-name");
      if (rollingEl && appRoot.classList.contains("preview-mode")) {
        shrinkToFit(rollingEl, 56, 28);
      }
      if (rollingEl && appRoot.classList.contains("presentation-mode")) {
        shrinkToFit(rollingEl, 112, 50);
      }

      return;
    }

    const listClass = `${getListClass(sampleNames.length)} rolling-grid`;
    const sizeClass = getSizeClass(sampleNames.length);

    const items = sampleNames
      .map((name) => `<li class="winner-list-item ${sizeClass} rolling-item">${escapeHtml(name)}</li>`)
      .join("");

    resultBoxElement.innerHTML = `
      <ul class="${listClass}">
        ${items}
      </ul>
    `;
  }

  function launchConfetti() {
    confettiLayer.innerHTML = "";

    const colors = [
      "#FFD700",
      "#F59E0B",
      "#EF4444",
      "#10B981",
      "#2563EB",
      "#7C3AED",
      "#FFFFFF"
    ];

    const count = 700;

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";

      const size = 6 + Math.random() * 10;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * 1.8}px`;
      piece.style.left = `${Math.random() * window.innerWidth}px`;
      piece.style.top = `${-20 - Math.random() * 200}px`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${2.8 + Math.random() * 2.2}s`;
      piece.style.animationDelay = `${Math.random() * 0.8}s`;

      const driftX = -120 + Math.random() * 240;
      const rotation = 360 + Math.random() * 720;

      confettiLayer.appendChild(piece);

      piece.animate(
        [
          { transform: "translate3d(0, 0, 0) rotate(0deg)", opacity: 0 },
          {
            transform: `translate3d(${driftX * 0.3}px, 15vh, 0) rotate(${rotation * 0.25}deg)`,
            opacity: 1,
            offset: 0.15
          },
          {
            transform: `translate3d(${driftX}px, 120vh, 0) rotate(${rotation}deg)`,
            opacity: 0
          }
        ],
        {
          duration: 2800 + Math.random() * 2200,
          delay: Math.random() * 700,
          easing: "linear",
          fill: "forwards"
        }
      );
    }

    setTimeout(() => {
      confettiLayer.innerHTML = "";
    }, 5500);
  }

  function validateBeforeDraw() {
    const numWinners = parseInt(randomNumberSelector.value, 10);

    if (!isLocked) {
      setStatus("Please load & lock names first");
      return false;
    }

    if (names.length === 0) {
      setStatus("No attendees available for drawing.");
      return false;
    }

    if (Number.isNaN(numWinners) || numWinners <= 0) {
      setStatus("Please choose a valid number of winners.");
      return false;
    }

    if (numWinners > names.length) {
      setStatus("The number of winners is greater than the number of available attendees.");
      return false;
    }

    return true;
  }

  function startRolling() {
    const numWinners = parseInt(randomNumberSelector.value, 10);
    const winners = shuffleArray(names).slice(0, numWinners);

    drawState = "drawing";
    resultCard.classList.remove("showing", "is-rolling");
    resultCard.classList.toggle("single-winner-mode", numWinners === 1);
    resultCard.classList.add("is-rolling");

    updatePushButtonState();
    setStatus(`Drawing ${numWinners} winner${numWinners > 1 ? "s" : ""}...`);

    let speed = 70;
    let cycles = 0;

    function getRollingSample() {
      return shuffleArray(names).slice(0, numWinners);
    }

    function roll() {
      renderRollingGrid(getRollingSample());

      cycles += 1;

      if (cycles > 18) speed += 12;
      if (cycles > 32) speed += 18;

      if (cycles < 42) {
        setTimeout(roll, speed);
      } else {
        renderWinners(winners);

        if (removeAfterDrawCheckbox.checked) {
          names = names.filter((name) => !winners.includes(name));
          updateCounts();
        }

        drawState = "showing";
        resultCard.classList.remove("is-rolling");
        updatePushButtonState();
        setStatus(
          `Displayed ${winners.length} winner${winners.length > 1 ? "s" : ""}. Press again to clear the screen.`
        );

        launchConfetti();
      }
    }

    roll();
  }

  function handleDrawTrigger() {
    if (drawState === "drawing") return;

    if (drawState === "showing") {
      clearResultScreen();
      setStatus("Screen cleared. Waiting for the next prize.");
      return;
    }

    if (!validateBeforeDraw()) return;
    startRolling();
  }

  function enterPresentationMode() {
    appRoot.classList.remove("preview-mode");
    appRoot.classList.add("presentation-mode");

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  function exitPresentationMode() {
    appRoot.classList.remove("presentation-mode");
    appRoot.classList.add("preview-mode");

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function resetSession() {
    names = [];
    drawState = "idle";
    nameListElement.value = "";
    confettiLayer.innerHTML = "";
    unlockInput();
    updateCounts();
    showEmptyState();
    setStatus("Session reset. Paste a new attendee list to begin again.");
    updatePushButtonState();
  }

  loadLockButton.addEventListener("click", () => {
    if (isLocked) return;

    const loadedNames = normalizeNames(nameListElement.value);

    if (loadedNames.length === 0) {
      setStatus("Please paste at least one attendee name.");
      return;
    }

    names = loadedNames;
    updateCounts();
    drawState = "idle";
    lockInput();
    showEmptyState();
    setStatus(`Loaded and locked ${names.length.toLocaleString()} attendee${names.length > 1 ? "s" : ""}.`);
  });

  unlockButton.addEventListener("click", () => {
    if (drawState === "drawing") {
      setStatus("Cannot unlock the list while a draw is in progress.");
      return;
    }

    unlockInput();
    setStatus("List unlocked. You can edit the attendee names again.");
  });

  resetButton.addEventListener("click", resetSession);
  presentButton.addEventListener("click", enterPresentationMode);

  pushButton.addEventListener("click", () => {
    if (!isLocked) {
      setStatus("Please load & lock names first");
      return;
    }

    animatePushButton();
    handleDrawTrigger();
  });

  pushButton.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pushButton.click();
    }
  });

  document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement?.tagName;
    const isTyping =
      activeTag === "TEXTAREA" ||
      activeTag === "INPUT" ||
      activeTag === "SELECT";

    if (event.key === "Enter" && !isTyping) {
      if (!isLocked) {
        setStatus("Please load & lock names first");
        return;
      }

      event.preventDefault();
      animatePushButton();
      handleDrawTrigger();
    }

    if (event.key === "Escape" && appRoot.classList.contains("presentation-mode")) {
      exitPresentationMode();
    }
  });

  updateCounts();
  updateLockStatus();
  showEmptyState();
  updatePushButtonState();
});