const URL = "https://teachablemachine.withgoogle.com/models/YcB7lHgyc/";

let recognizer; // Declare recognizer globally

async function createModel() {
    const checkpointURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    recognizer = speechCommands.create(
        "BROWSER_FFT",
        undefined,
        checkpointURL,
        metadataURL);

    await recognizer.ensureModelLoaded();

    return recognizer;
}

async function init() {
    recognizer = await createModel();
    const classLabels = recognizer.wordLabels();
    const labelContainer = document.getElementById("label-container");
    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    const playButton = document.getElementById("playButton");
    const pauseButton = document.getElementById("pauseButton");
    const musicPlayer = document.getElementById("musicPlayer");
    const randomImage = document.getElementById("randomImage");
    const timer = document.getElementById("timer");

    recognizer.listen(result => {
        const scores = result.scores;
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + scores[i].toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;

            if (classLabels[i] === "Play" && scores[i] > 0.75) {
                playMusic(musicPlayer, playButton, pauseButton);
            } else if (classLabels[i] === "Pause" && scores[i] > 0.75) {
                pauseMusic(musicPlayer, playButton, pauseButton);
            }
        }
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50
    });

    playButton.addEventListener("click", () => playMusic(musicPlayer, playButton, pauseButton));
    pauseButton.addEventListener("click", () => pauseMusic(musicPlayer, playButton, pauseButton));

    // Update the timer while playing
    musicPlayer.addEventListener("timeupdate", () => {
        const currentTime = formatTime(musicPlayer.currentTime);
        timer.innerText = currentTime;
    });
}

function playMusic(audioElement, playButton, pauseButton) {
    audioElement.play();
    playButton.disabled = true;
    pauseButton.disabled = false;
}

function pauseMusic(audioElement, playButton, pauseButton) {
    audioElement.pause();
    playButton.disabled = false;
    pauseButton.disabled = true;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", () => init());
