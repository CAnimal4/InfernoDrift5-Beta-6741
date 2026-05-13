import { describe, expect, it } from "vitest";
import { parseClientMessage, protocolVersion, sanitizeChat } from "./index";

describe("protocol validation", () => {
  it("accepts valid input frames", () => {
    expect(
      parseClientMessage({
        v: protocolVersion,
        type: "input.frame",
        seq: 1,
        payload: {
          tick: 8,
          throttle: 1,
          steer: -0.4,
          drift: true,
          boost: false,
          jump: false,
        },
      }).type,
    ).toBe("input.frame");
  });

  it("rejects speed-hack style input values", () => {
    expect(() =>
      parseClientMessage({
        v: protocolVersion,
        type: "input.frame",
        seq: 1,
        payload: {
          tick: 8,
          throttle: 7,
          steer: 0,
          drift: false,
          boost: false,
          jump: false,
        },
      }),
    ).toThrow();
  });

  it("sanitizes chat text", () => {
    expect(sanitizeChat("<b>hello   hell</b>")).toBe("bhello ****/b");
  });
});
