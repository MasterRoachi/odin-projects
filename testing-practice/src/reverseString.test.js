import { describe, expect, it } from "vitest";
import { reverseString } from "./reverseString.js";

describe("reverseString", () => {
  it("reverses a word", () => {
    expect(reverseString("hello")).toBe("olleh");
  });

  it("returns an empty string unchanged", () => {
    expect(reverseString("")).toBe("");
  });

  it("handles a single character", () => {
    expect(reverseString("a")).toBe("a");
  });

  it("leaves a palindrome looking the same", () => {
    expect(reverseString("racecar")).toBe("racecar");
  });

  it("reverses spaces and punctuation along with the letters", () => {
    expect(reverseString("a b, c!")).toBe("!c ,b a");
  });

  it("preserves case", () => {
    expect(reverseString("AbC")).toBe("CbA");
  });

  // "ab😀".split("") would tear the emoji into two broken halves
  it("does not tear an emoji apart", () => {
    expect(reverseString("ab😀")).toBe("😀ba");
  });

  it("reverses twice back to the original", () => {
    const text = "The quick brown fox";
    expect(reverseString(reverseString(text))).toBe(text);
  });

  it("refuses anything that is not a string", () => {
    expect(() => reverseString(123)).toThrow(TypeError);
    expect(() => reverseString(undefined)).toThrow(TypeError);
  });
});
