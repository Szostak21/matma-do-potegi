import { describe, expect, it } from "vitest";

import {
  buildMessageVariables,
  countSmsSegments,
  findUnknownVariables,
  renderMessage,
} from "@/lib/messages/render";

const variables = buildMessageVariables({
  displayName: "Anna Kowalska",
  parentName: "Ewa Kowalska",
  amountDueGrosze: 41000,
  month: new Date(Date.UTC(2026, 9, 1)),
  packageName: "Matura Rozszerzona",
  payUrl: "https://www.matmadopotegi.pl/p/abc",
  dueDateLabel: "5 października",
  transferTitle: "MDP 2026-10 abcdef12",
});

describe("message templates", () => {
  it("fills known placeholders and reports typos", () => {
    const result = renderMessage(
      "Cześć {imie}, czesne {kwota}. Link: {link}. {nieznana}",
      variables,
    );

    expect(result.body).toContain("Cześć Anna");
    expect(result.body).toContain("410.00 zł");
    expect(result.body).toContain("/p/abc");
    expect(result.body).toContain("{nieznana}");
    expect(result.unknownVariables).toEqual(["nieznana"]);
    expect(findUnknownVariables("Witaj {imie} {nieznana}")).toEqual([
      "nieznana",
    ]);
  });

  it("uses the student first name and the billing month", () => {
    expect(variables.imie).toBe("Anna");
    expect(variables.rodzic).toBe("Ewa Kowalska");
    expect(variables.miesiac).toMatch(/październik 2026/i);
  });

  it("counts a Polish SMS as 70-character segments", () => {
    expect(countSmsSegments("a".repeat(160))).toEqual({
      characters: 160,
      segments: 1,
      isUnicode: false,
    });
    expect(countSmsSegments("Cześć")).toMatchObject({
      characters: 5,
      segments: 1,
      isUnicode: true,
    });
    expect(countSmsSegments("ł".repeat(71)).segments).toBe(2);
  });
});
