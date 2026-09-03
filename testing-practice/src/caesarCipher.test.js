import { describe, expect, it } from "vitest";
import { caesarCipher } from "./caesarCipher.js";

describe("caesarCipher", () => {
  describe("the cases the brief names", () => {
    it("wraps from z round to a", () => {
      expect(caesarCipher("xyz", 3)).toBe("abc");
    });

    it("keeps the case of each letter where it was", () => {
      expect(caesarCipher("HeLLo", 3)).toBe("KhOOr");
    });

    it("leaves punctuation and spaces alone", () => {
      expect(caesarCipher("Hello, World!", 3)).toBe("Khoor, Zruog!");
    });
  });

  describe("shifts", () => {
    it("changes nothing when the shift is zero", () => {
      expect(caesarCipher("Hello", 0)).toBe("Hello");
    });

    it("changes nothing when the shift is a whole alphabet", () => {
      expect(caesarCipher("Hello", 26)).toBe("Hello");
    });

    it("treats a shift larger than the alphabet as the remainder", () => {
      expect(caesarCipher("abc", 29)).toBe(caesarCipher("abc", 3));
      expect(caesarCipher("abc", 29)).toBe("def");
    });

    // the reason normaliseShift exists: -3 % 26 is -3 in JavaScript, and
    // adding a negative walks off the front of the alphabet
    it("shifts backwards when given a negative", () => {
      expect(caesarCipher("abc", -3)).toBe("xyz");
    });

    it("handles a large negative shift", () => {
      expect(caesarCipher("abc", -29)).toBe("xyz");
    });

    it("round-trips: shifting back undoes shifting forward", () => {
      const message = "The quick brown Fox jumps over 13 lazy dogs!";
      expect(caesarCipher(caesarCipher(message, 7), -7)).toBe(message);
    });
  });

  describe("characters it must not touch", () => {
    it("leaves digits alone", () => {
      expect(caesarCipher("abc123", 3)).toBe("def123");
    });

    it("leaves accented letters alone rather than mangling them", () => {
      expect(caesarCipher("café", 1)).toBe("dbgé");
    });

    it("returns an empty string unchanged", () => {
      expect(caesarCipher("", 5)).toBe("");
    });

    it("handles a string of only punctuation", () => {
      expect(caesarCipher("!?,. ", 10)).toBe("!?,. ");
    });
  });

  describe("bad input", () => {
    it("refuses anything that is not a string", () => {
      expect(() => caesarCipher(123, 3)).toThrow(TypeError);
      expect(() => caesarCipher(null, 3)).toThrow(TypeError);
      expect(() => caesarCipher(undefined, 3)).toThrow(TypeError);
    });

    it("refuses a shift that is not a whole number", () => {
      expect(() => caesarCipher("abc", 1.5)).toThrow(TypeError);
      expect(() => caesarCipher("abc", "3")).toThrow(TypeError);
      expect(() => caesarCipher("abc", NaN)).toThrow(TypeError);
    });
  });
});
