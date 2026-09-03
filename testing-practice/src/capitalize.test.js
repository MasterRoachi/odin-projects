import { describe, expect, it } from "vitest";
import { capitalize } from "./capitalize.js";

describe("capitalize", () => {
  it("capitalises the first character", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("touches only the first character, not every word", () => {
    expect(capitalize("hello world")).toBe("Hello world");
  });

  it("leaves an already capitalised string as it is", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  it("handles a single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("returns an empty string unchanged", () => {
    expect(capitalize("")).toBe("");
  });

  it("leaves a leading digit alone", () => {
    expect(capitalize("1st place")).toBe("1st place");
  });

  it("leaves a leading space alone rather than skipping to the letter", () => {
    expect(capitalize(" hello")).toBe(" hello");
  });

  it("does not split a leading emoji in half", () => {
    expect(capitalize("😀hello")).toBe("😀hello");
  });

  // The emoji test above passes either way, because an emoji has no
  // uppercase form — indexing a lone surrogate and uppercasing it gives the
  // same string back. This one actually distinguishes them: Deseret lives
  // outside the basic plane *and* has a case mapping, so text[0] uppercases
  // half a character and leaves the letter unchanged.
  it("uppercases a character from outside the basic plane", () => {
    expect(capitalize("𐐨test")).toBe("𐐀test");
  });

  it("refuses anything that is not a string", () => {
    expect(() => capitalize(42)).toThrow(TypeError);
    expect(() => capitalize(null)).toThrow(TypeError);
    expect(() => capitalize(["a"])).toThrow(TypeError);
  });
});
