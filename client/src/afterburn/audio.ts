import type { VehicleState } from "../../../packages/afterburn-core/src/index";

export class AfterburnAudio {
  private context: AudioContext | null = null;
  private engine: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private tire: OscillatorNode | null = null;
  private tireGain: GainNode | null = null;
  private master: GainNode | null = null;
  private lastBoost = false;

  async unlock(volume = 0.75) {
    if (this.context) {
      await this.context.resume();
      return;
    }
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = volume * 0.24;
    master.connect(context.destination);

    const engine = context.createOscillator();
    const engineGain = context.createGain();
    engine.type = "sawtooth";
    engine.frequency.value = 62;
    engineGain.gain.value = 0;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    engine.connect(filter).connect(engineGain).connect(master);
    engine.start();

    const tire = context.createOscillator();
    const tireGain = context.createGain();
    tire.type = "square";
    tire.frequency.value = 145;
    tireGain.gain.value = 0;
    tire.connect(tireGain).connect(master);
    tire.start();

    this.context = context;
    this.engine = engine;
    this.engineGain = engineGain;
    this.tire = tire;
    this.tireGain = tireGain;
    this.master = master;
  }

  update(vehicle: VehicleState | undefined, boostActive: boolean) {
    if (!this.context || !vehicle || !this.engine || !this.engineGain || !this.tire || !this.tireGain) return;
    const now = this.context.currentTime;
    const rpm = 62 + Math.min(260, vehicle.speed * 3.2);
    this.engine.frequency.setTargetAtTime(rpm, now, 0.035);
    this.engineGain.gain.setTargetAtTime(vehicle.speed > 0.5 ? 0.28 : 0.08, now, 0.06);
    this.tire.frequency.setTargetAtTime(105 + vehicle.speed * 1.4, now, 0.04);
    this.tireGain.gain.setTargetAtTime(vehicle.slip > 0.1 ? vehicle.slip * 0.07 : 0, now, 0.04);
    if (boostActive && !this.lastBoost) this.burst(580, 0.13, 0.12);
    this.lastBoost = boostActive;
  }

  impact() {
    this.burst(68, 0.2, 0.18, "square");
  }

  pickup() {
    this.burst(820, 0.08, 0.09, "sine");
  }

  setVolume(value: number) {
    if (this.master) this.master.gain.value = Math.max(0, Math.min(1, value)) * 0.24;
  }

  private burst(frequency: number, duration: number, gainValue: number, type: OscillatorType = "sawtooth") {
    if (!this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.45), this.context.currentTime + duration);
    gain.gain.setValueAtTime(gainValue, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }
}
