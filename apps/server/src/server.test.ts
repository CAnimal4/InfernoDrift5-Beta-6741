import { describe, expect, it } from "vitest";
import { sanitizeChat } from "@infernodrift4/protocol";

describe("server safety helpers", () => {
  it("keeps chat plain and bounded", () => {
    expect(sanitizeChat("<script>hello hell</script>").length).toBeLessThan(
      160,
    );
    expect(sanitizeChat("hello    driver")).toBe("hello driver");
  });
});
