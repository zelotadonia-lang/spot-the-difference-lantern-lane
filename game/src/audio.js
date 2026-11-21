// Every sound in the game is made here, with the Web Audio API and nothing
// else: no audio files, no network. The context starts on the first key or
// click, since browsers block sound before a gesture.
export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  unlock() {
    if (this.context === null) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.context = new AudioContext();
    }
    if (this.context && this.context.state === 'suspended') this.context.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // One short note: an oscillator that fades out, so notes never click.
  note(freq, start, length, type, volume) {
    if (this.context === null || this.muted) return;
    const now = this.context.currentTime + start;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(now);
    osc.stop(now + length + 0.05);
  }

  // A found difference: a bright two-note chime.
  found() {
    this.note(880, 0, 0.16, 'sine', 0.22);
    this.note(1318.5, 0.07, 0.24, 'sine', 0.18);
  }

  // A wrong click: a soft low thud, quiet on purpose.
  wrong() {
    this.note(140, 0, 0.18, 'triangle', 0.16);
    this.note(98, 0.02, 0.2, 'sine', 0.12);
  }

  // A hint: a quick shimmer up the scale.
  hint() {
    this.note(1046.5, 0, 0.1, 'sine', 0.1);
    this.note(1318.5, 0.06, 0.1, 'sine', 0.1);
    this.note(1568, 0.12, 0.16, 'sine', 0.1);
  }

  // A finished level: three rising notes.
  levelClear() {
    this.note(523.25, 0, 0.18, 'triangle', 0.18);
    this.note(659.25, 0.12, 0.18, 'triangle', 0.18);
    this.note(783.99, 0.24, 0.3, 'triangle', 0.18);
  }

  // The whole game won: a short arpeggio.
  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, index) => this.note(freq, index * 0.11, 0.26, 'triangle', 0.18));
  }

  // The clock ran out: two falling notes.
  timeUp() {
    this.note(392, 0, 0.22, 'triangle', 0.16);
    this.note(261.63, 0.16, 0.34, 'triangle', 0.16);
  }

  // A plain interface click.
  click() {
    this.note(660, 0, 0.06, 'sine', 0.08);
  }
}
