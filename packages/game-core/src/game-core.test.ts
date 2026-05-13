import { describe, expect, it } from "vitest";
import { defaultInput, InfernoDriftSim } from "./index";

describe("InfernoDriftSim", () => {
  it("boost increases car speed on the ground and in the air", () => {
    const sim = new InfernoDriftSim(7);
    sim.startMode("campaign");
    for (let i = 0; i < 40; i++) sim.step({ ...defaultInput(), throttle: 1 });
    const groundSpeed = sim.state.player.speed;
    sim.step({ ...defaultInput(), throttle: 1, jump: true });
    for (let i = 0; i < 30; i++)
      sim.step({ ...defaultInput(), throttle: 1, boost: true });
    expect(sim.state.player.speed).toBeGreaterThan(groundSpeed);
    expect(sim.state.player.grounded).toBe(false);
  });

  it("wins a score mode when objective target is reached", () => {
    const sim = new InfernoDriftSim(8);
    sim.startMode("drift-score");
    sim.state.score = sim.state.objective.target;
    sim.step(defaultInput());
    expect(sim.state.phase).toBe("won");
  });

  it("exports concise deterministic text state", () => {
    const simA = new InfernoDriftSim(44);
    const simB = new InfernoDriftSim(44);
    simA.startMode("race");
    simB.startMode("race");
    for (let i = 0; i < 120; i++) {
      const frame = {
        ...defaultInput(),
        throttle: 1,
        steer: i % 30 < 15 ? 0.2 : -0.2,
      };
      simA.step(frame);
      simB.step(frame);
    }
    expect(simA.serialize()).toEqual(simB.serialize());
  });
});
