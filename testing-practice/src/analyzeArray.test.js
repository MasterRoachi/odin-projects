import { describe, expect, it } from "vitest";
import { analyzeArray } from "./analyzeArray.js";

describe("analyzeArray", () => {
  it("returns the example the brief gives", () => {
    expect(analyzeArray([1, 8, 3, 4, 2, 6])).toEqual({
      average: 4,
      min: 1,
      max: 8,
      length: 6,
    });
  });

  it("handles a single number", () => {
    expect(analyzeArray([5])).toEqual({ average: 5, min: 5, max: 5, length: 1 });
  });

  it("handles negatives", () => {
    expect(analyzeArray([-5, 0, 5])).toEqual({
      average: 0,
      min: -5,
      max: 5,
      length: 3,
    });
  });

  it("does not round a fractional average", () => {
    expect(analyzeArray([1, 2]).average).toBe(1.5);
  });

  it("copes with all the same number", () => {
    expect(analyzeArray([3, 3, 3])).toEqual({ average: 3, min: 3, max: 3, length: 3 });
  });

  it("counts duplicates in the length", () => {
    expect(analyzeArray([2, 2, 2, 2]).length).toBe(4);
  });

  it("leaves the array it was given alone", () => {
    const input = [3, 1, 2];
    analyzeArray(input);
    expect(input).toEqual([3, 1, 2]);
  });

  // there is no honest average of nothing — 0 would be a lie and NaN would
  // quietly poison whatever used it next
  it("throws on an empty array rather than inventing an answer", () => {
    expect(() => analyzeArray([])).toThrow(RangeError);
  });

  it("refuses anything that is not an array", () => {
    expect(() => analyzeArray("123")).toThrow(TypeError);
    expect(() => analyzeArray(null)).toThrow(TypeError);
  });

  it("refuses an array containing anything that is not a number", () => {
    expect(() => analyzeArray([1, "2", 3])).toThrow(TypeError);
    expect(() => analyzeArray([1, NaN])).toThrow(TypeError);
  });
});
