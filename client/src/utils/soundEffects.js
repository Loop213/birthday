function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
}

function playSweep({
  startFrequency,
  endFrequency,
  duration = 0.35,
  volume = 0.03,
  type = "sine"
}) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(endFrequency, 0.001),
    now + duration
  );

  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

export function playCandleBlowSound() {
  playSweep({
    startFrequency: 860,
    endFrequency: 180,
    duration: 0.42,
    volume: 0.025,
    type: "triangle"
  });
}

export function playBalloonPopSound() {
  playSweep({
    startFrequency: 240,
    endFrequency: 70,
    duration: 0.12,
    volume: 0.05,
    type: "square"
  });
}

export function playFireworkSound() {
  playSweep({
    startFrequency: 120,
    endFrequency: 920,
    duration: 0.55,
    volume: 0.045,
    type: "sawtooth"
  });
}
