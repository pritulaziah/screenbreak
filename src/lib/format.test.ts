import { describe, expect, it } from "vitest";
import { formatTimer } from "./format";

describe("formatTimer", () => {
  it("formats minutes and seconds with two digits", () => {
    expect(formatTimer(5)).toBe("00:05");
    expect(formatTimer(65)).toBe("01:05");
    expect(formatTimer(600)).toBe("10:00");
  });

  it("clamps negative input", () => {
    expect(formatTimer(-5)).toBe("00:00");
  });
});
