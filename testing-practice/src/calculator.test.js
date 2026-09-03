import { describe, expect, it } from "vitest";
import { calculator } from "./calculator.js";

describe("calculator", () => {
  describe("add", () => {
    it("adds two positives", () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it("adds negatives", () => {
      expect(calculator.add(-4, -6)).toBe(-10);
      expect(calculator.add(-4, 6)).toBe(2);
    });

    it("adds zero without changing anything", () => {
      expect(calculator.add(7, 0)).toBe(7);
    });

    // floating point: 0.1 + 0.2 is 0.30000000000000004, so toBe would fail
    it("adds decimals within floating-point tolerance", () => {
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
    });
  });

  describe("subtract", () => {
    it("subtracts", () => {
      expect(calculator.subtract(9, 4)).toBe(5);
    });

    it("goes below zero", () => {
      expect(calculator.subtract(4, 9)).toBe(-5);
    });
  });

  describe("multiply", () => {
    it("multiplies", () => {
      expect(calculator.multiply(6, 7)).toBe(42);
    });

    it("anything times zero is zero", () => {
      expect(calculator.multiply(999, 0)).toBe(0);
    });

    it("two negatives make a positive", () => {
      expect(calculator.multiply(-3, -4)).toBe(12);
    });
  });

  describe("divide", () => {
    it("divides", () => {
      expect(calculator.divide(9, 3)).toBe(3);
    });

    it("returns a fraction where there is one", () => {
      expect(calculator.divide(7, 2)).toBe(3.5);
    });

    // a calculator that returns Infinity pushes the problem downstream,
    // where it becomes NaN several steps later and is hard to trace back
    it("throws rather than returning Infinity when dividing by zero", () => {
      expect(() => calculator.divide(1, 0)).toThrow(RangeError);
      expect(() => calculator.divide(0, 0)).toThrow(RangeError);
    });
  });

  describe("bad input", () => {
    it("refuses non-numbers", () => {
      expect(() => calculator.add("2", 3)).toThrow(TypeError);
      expect(() => calculator.multiply(null, 3)).toThrow(TypeError);
      expect(() => calculator.subtract(undefined, 1)).toThrow(TypeError);
    });

    it("refuses NaN, which is technically a number", () => {
      expect(() => calculator.add(NaN, 1)).toThrow(TypeError);
    });
  });
});
