import { describe, expect, it } from "vitest";

import {
  formatPln,
  groszeToInputValue,
  groszeToZl,
  parseMoneyInput,
  zlToGrosze,
} from "@/lib/money";

describe("money", () => {
  it("keeps amounts in integer grosze", () => {
    expect(zlToGrosze(410)).toBe(41000);
    expect(zlToGrosze(10.5)).toBe(1050);
    expect(groszeToZl(1050)).toBe("10.50");
    expect(formatPln(5000)).toBe("50.00 zł");
  });

  it("rounds half-grosz away from a float error", () => {
    expect(zlToGrosze(0.1 + 0.2)).toBe(30);
  });

  it("parses comma and dot input, including a negative surcharge", () => {
    expect(parseMoneyInput("410")).toBe(41000);
    expect(parseMoneyInput("10,50")).toBe(1050);
    expect(parseMoneyInput("-5.25")).toBe(-525);
    expect(parseMoneyInput("")).toBe(0);
    expect(parseMoneyInput("10.555")).toBeNull();
    expect(parseMoneyInput("abc")).toBeNull();
  });

  it("drops trailing zeros in the edit field", () => {
    expect(groszeToInputValue(41000)).toBe("410");
    expect(groszeToInputValue(1050)).toBe("10,50");
  });
});
