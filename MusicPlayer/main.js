// Select all elements
let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let tempo_slider = document.getElementById('tempo_slider');
let tempo_value = document.getElementById('tempo_value');
let pitch_checkbox = document.getElementById('pitch_checkbox');

let track_index = 0;
let isPlaying = false;
let updateTimer;

// Add your own mp3 files and images in the project folder
let track_list = [
    {
        name: "AGE AIN'T NOTHING BUT A NUMBER",
        artist: "Pritish S",
        image: "AGE.jpg",
        path: "music/AGE AINT NOTHING BUT A NUMBER.mp3"
    },
    {
        name: "Jezebel Remix",
        artist: "Pritish S",
        image: "jezebel.jpg",
        path: "music/Sade - Jezebel (Pritish S House Remix).mp3"
    },
    {
        name: "STAY WITH ME",
        artist: "Pritish S",
        image: "electric3.jpg",
        path: "music/STAY WITH ME.mp3"
    }
];

let curr_track = document.createElement('audio');

// --- WAVEFORM LOGIC ---
const waveform = document.getElementById('waveform');
const wfCtx = waveform.getContext('2d');
let waveformPeaks = [];
let isDraggingWaveform = false;

// Utility: Decode audio and extract peaks for waveform
function getWaveformPeaks(audioBuffer, barCount = 100) {
    const rawData = audioBuffer.getChannelData(0);
    const samplesPerBar = Math.floor(rawData.length / barCount);
    let peaks = [];
    for (let i = 0; i < barCount; i++) {
        let start = i * samplesPerBar;
        let end = start + samplesPerBar;
        let max = 0;
        for (let j = start; j < end; j++) {
            max = Math.max(max, Math.abs(rawData[j]));
        }
        peaks.push(max);
    }
    return peaks;
}

// Draw waveform bars, mirrored vertically, with progress overlay
function drawWaveform(progress = 0) {
    wfCtx.clearRect(0, 0, waveform.width, waveform.height);
    const barCount = waveformPeaks.length;
    const barWidth = waveform.width / barCount;
    for (let i = 0; i < barCount; i++) {
        const peak = waveformPeaks[i];
        const x = i * barWidth;
        const barHeight = peak * (waveform.height / 2 - 4);
        // Background bars
        wfCtx.fillStyle = "#bbb";
        wfCtx.fillRect(x, waveform.height / 2 - barHeight, barWidth - 1, barHeight * 2);
    }
    // Progress overlay
    const playedBars = Math.floor(progress * barCount);
    for (let i = 0; i < playedBars; i++) {
        const peak = waveformPeaks[i];
        const x = i * barWidth;
        const barHeight = peak * (waveform.height / 2 - 4);
        wfCtx.fillStyle = "#2196f3";
        wfCtx.fillRect(x, waveform.height / 2 - barHeight, barWidth - 1, barHeight * 2);
    }
}

// Load waveform when track loads
function loadWaveform(path) {
    waveformPeaks = [];
    wfCtx.clearRect(0, 0, waveform.width, waveform.height);
    if (!window.AudioContext && !window.webkitAudioContext) return;
    let ctx = new (window.AudioContext || window.webkitAudioContext)();
    fetch(path)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            waveformPeaks = getWaveformPeaks(audioBuffer, 100);
            drawWaveform(0);
        });
}

// Update waveform progress as song plays
function animateWaveform() {
    if (!curr_track.paused && !curr_track.ended) {
        drawWaveform(curr_track.currentTime / curr_track.duration);
        requestAnimationFrame(animateWaveform);
    }
}

// Seek on click/drag
waveform.addEventListener('mousedown', e => {
    isDraggingWaveform = true;
    seekWaveform(e);
});
window.addEventListener('mousemove', e => {
    if (isDraggingWaveform) seekWaveform(e);
});
window.addEventListener('mouseup', () => {
    isDraggingWaveform = false;
});
function seekWaveform(e) {
    const rect = waveform.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / waveform.width));
    if (curr_track.duration) {
        curr_track.currentTime = percent * curr_track.duration;
        drawWaveform(percent);
    }
}

// --- END WAVEFORM LOGIC ---

function loadTrack(index) {
    clearInterval(updateTimer);
    resetValues();

    curr_track.src = track_list[index].path;
    curr_track.load();

    track_art.style.backgroundImage = `url('${track_list[index].image}')`;
    track_name.textContent = track_list[index].name;
    track_artist.textContent = track_list[index].artist;
    now_playing.textContent = "PLAYING " + (index + 1) + " OF " + track_list.length;

    updateTimer = setInterval(seekUpdate, 1000);

    curr_track.addEventListener("ended", nextTrack);
    random_bg_color();

    // Load and draw waveform
    loadWaveform(track_list[index].path);
}

function random_bg_color() {
    let red = Math.floor(Math.random() * 128) + 128;
    let green = Math.floor(Math.random() * 128) + 128;
    let blue = Math.floor(Math.random() * 128) + 128;
    let bgColor = "rgb(" + red + ", " + green + ", " + blue + ")";
    document.body.style.background = bgColor;
}

function resetValues() {
    curr_time.textContent = "00:00";
    total_duration.textContent = "00:00";
    seek_slider.value = 0;
}

// Playback controls
function playpauseTrack() {
    if (!isPlaying) playTrack();
    else pauseTrack();
}

function playTrack() {
    curr_track.play();
    isPlaying = true;
    playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
    animateWaveform();
}

function pauseTrack() {
    curr_track.pause();
    isPlaying = false;
    playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

// --- Track skip functions with tempo reset ---
function nextTrack() {
    if (track_index < track_list.length - 1)
        track_index += 1;
    else track_index = 0;
    loadTrack(track_index);
    playTrack();
    // Reset tempo slider to normal
    tempo_slider.value = 1.0;
    curr_track.playbackRate = 1.0;
    tempo_value.textContent = '1.00x';
}

function prevTrack() {
    if (track_index > 0)
        track_index -= 1;
    else track_index = track_list.length - 1;
    loadTrack(track_index);
    playTrack();
    // Reset tempo slider to normal
    tempo_slider.value = 1.0;
    curr_track.playbackRate = 1.0;
    tempo_value.textContent = '1.00x';
}
// --- End of tempo reset on skip ---

// Sliders
function seekTo() {
    let seekto = curr_track.duration * (seek_slider.value / 100);
    curr_track.currentTime = seekto;
}

function setVolume() {
    curr_track.volume = volume_slider.value / 100;
}

// --- TEMPO & PITCH CONTROLS ---
function setTempo() {
    let tempo = tempo_slider.value;
    curr_track.playbackRate = tempo;
    tempo_value.textContent = parseFloat(tempo).toFixed(2) + "x";
}
function setPitchPreserve() {
    let preserve = pitch_checkbox.checked;
    if ('preservesPitch' in curr_track) {
        curr_track.preservesPitch = preserve;
    } else if ('mozPreservesPitch' in curr_track) {
        curr_track.mozPreservesPitch = preserve;
    } else if ('webkitPreservesPitch' in curr_track) {
        curr_track.webkitPreservesPitch = preserve;
    }
}
// --- END TEMPO & PITCH CONTROLS ---

function seekUpdate() {
    let seekPosition = 0;
    if (!isNaN(curr_track.duration)) {
        seekPosition = curr_track.currentTime * (100 / curr_track.duration);
        seek_slider.value = seekPosition;

        let currentMinutes = Math.floor(curr_track.currentTime / 60);
        let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(curr_track.duration / 60);
        let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

        if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
        if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
        if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
        if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

        curr_time.textContent = currentMinutes + ":" + currentSeconds;
        total_duration.textContent = durationMinutes + ":" + durationSeconds;
    }
}

// Initialize
loadTrack(track_index);

// Allow play/pause with spacebar
document.body.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        e.preventDefault();
        playpauseTrack();
    }
});
