import { EMPTY_INPUT, type InputFrame } from "../../../packages/afterburn-core/src/index";

export interface TouchState {
  steer: number;
  throttle: number;
  drift: boolean;
  boost: boolean;
  jump: boolean;
  recover: boolean;
}
export class InputController {
  private readonly keys = new Set<string>();
  private seq = 0;
  readonly touch: TouchState = {
    steer: 0,
    throttle: 0,
    drift: false,
    boost: false,
    jump: false,
    recover: false,
  };

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.reset);
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.reset);
  }

  read(): InputFrame {
    const pad = navigator.getGamepads?.()[0];
    const keyboardSteer = (this.keys.has("KeyD") || this.keys.has("ArrowRight") ? 1 : 0) -
      (this.keys.has("KeyA") || this.keys.has("ArrowLeft") ? 1 : 0);
    const keyboardThrottle = (this.keys.has("KeyW") || this.keys.has("ArrowUp") ? 1 : 0) -
      (this.keys.has("KeyS") || this.keys.has("ArrowDown") ? 0.72 : 0);
    const padSteer = pad && Math.abs(pad.axes[0] ?? 0) > 0.12 ? pad.axes[0] ?? 0 : 0;
    const padThrottle = pad
      ? (pad.buttons[7]?.value ?? (pad.buttons[0]?.pressed ? 1 : 0)) - (pad.buttons[6]?.value ?? 0) * 0.72
      : 0;
    return {
      ...EMPTY_INPUT,
      seq: ++this.seq,
      steer: clamp(keyboardSteer || padSteer || this.touch.steer, -1, 1),
      throttle: clamp(keyboardThrottle || padThrottle || this.touch.throttle, -1, 1),
      drift: this.keys.has("Space") || Boolean(pad?.buttons[1]?.pressed) || this.touch.drift,
      boost: this.keys.has("ShiftLeft") || this.keys.has("ShiftRight") || Boolean(pad?.buttons[2]?.pressed) || this.touch.boost,
      jump: this.keys.has("KeyX") || Boolean(pad?.buttons[3]?.pressed) || this.touch.jump,
      recover: this.keys.has("KeyR") || Boolean(pad?.buttons[8]?.pressed) || this.touch.recover,
    };
  }

  private onKeyDown = (event: KeyboardEvent) => {
    this.keys.add(event.code);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  private reset = () => {
    this.keys.clear();
    Object.assign(this.touch, { steer: 0, throttle: 0, drift: false, boost: false, jump: false, recover: false });
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
