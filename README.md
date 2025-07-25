Music Player UI
A modern, interactive web-based music player built with HTML5, CSS3, and JavaScript.

Features
Custom Playlist: Includes album artwork, title, and artist for each track.

Waveform Visualization: Displays a responsive waveform for every song, allowing intuitive seeking by clicking or dragging anywhere on the waveform.

Audio Controls: Easily play, pause, skip forward, or skip backward through tracks.

Interactive Sliders: Adjust both playback volume and playback speed (tempo) in real time.

Pitch Preserve Toggle: Decide whether to maintain the original pitch when changing tempo, offering flexible listening options.

Animated & Responsive UI: The interface is designed for both desktop and mobile, providing smooth transitions and a visually compelling experience.

How It Works
The waveform displays the energy profile of each track and visually indicates progress as the song plays.

Users can click or drag the waveform to instantly jump to any part of the song.

The tempo slider controls playback speed (from 0.5x up to 2x), and always resets to normal when skipping tracks.

The "Preserve Pitch" option ensures audio remains natural when adjusting speed—uncheck to let pitch follow tempo for creative effects.


Technologies Used
HTML5
CSS3
JavaScript (DOM & Web Audio API)
FontAwesome (CDN) for icons

Customization
To change or expand your playlist, update the track_list array in main.js with your song info, art, and file paths.

Colours, font sizes, and UI elements can be modified in style.css to match your unique style preferences.
