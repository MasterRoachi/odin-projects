# Testing Practice

Five small functions, and the tests that hold them to account. Built for [The Odin Project](https://www.theodinproject.com/)'s Testing Practice assignment.

## Overview

The assignment names five things to write and test: `capitalize`, `reverseString`, a `calculator` object, `caesarCipher`, and `analyzeArray`.

**58 tests across 5 files.** There is also a [page](./index.html) that imports the same modules the suite imports, so you can type into each function and watch it work — including the ways it refuses.

```bash
npm install
npm test        # run the suite
npm run watch   # re-run on save
```

## Vitest rather than Jest

The lesson specifies Jest, and notes that Jest has no stable ESM support — so it walks you through configuring Babel purely to convert `import` back into `require`.

This uses [Vitest](https://vitest.dev/) instead. The API is identical — `describe`, `it`, `expect`, `toBe`, `toEqual`, `toThrow` all behave the same — but it runs ES modules natively, so the Babel layer that exists only to undo ESM is not needed at all. The dependency list is one package.

## Failure is designed, not accidental

Several of these functions can be handed something they cannot answer. Rather than let the behaviour fall out by accident, each case was decided and then tested:

| Case | Behaviour | Why |
| --- | --- | --- |
| `calculator.divide(1, 0)` | Throws `RangeError` | Returning `Infinity` pushes the problem downstream, where it becomes `NaN` several steps later and is hard to trace back |
| `analyzeArray([])` | Throws `RangeError` | There is no honest average of nothing. `0` would be a lie; `NaN` would quietly poison whatever used it next |
| Any function, wrong type | Throws `TypeError` | Failing at the boundary beats returning `"undefinedhello"` |
| `caesarCipher('abc', -3)` | `'xyz'` | Negative shifts decipher |
| Non-letters in the cipher | Unchanged | Including digits and accented characters |

## The bug the tests nearly missed

A suite that passes proves nothing on its own — it has to be able to *fail*. So each function was deliberately broken to check the tests noticed. Six mutations; five were caught immediately.

The one that slipped through: replacing `capitalize`'s code-point spread with a plain `text[0]`.

The test meant to catch that was `capitalize('😀hello')`. It passes either way — an emoji has no uppercase form, so uppercasing a lone surrogate returns the same character and the string comes back identical. The test looked like it was testing something and was testing nothing.

What actually distinguishes them is a character that is **both** outside the basic plane **and** has a case mapping. Deseret is one:

```js
capitalize('𐐨test')  // spread: '𐐀test'   ✓
                      // text[0]: '𐐨test'   ✗
```

With that test added, all six mutations are caught.

## Notes on the implementation

**`normaliseShift` exists because of a sign.** A plain `shift % 26` is not enough for negative shifts: JavaScript's remainder keeps the sign, so `-3 % 26` is `-3`, and adding that to a character code walks off the front of the alphabet. `((shift % 26) + 26) % 26` folds it back round.

**Strings are iterated by code point, not by UTF-16 unit.** `[...text]` rather than `text.split('')`, so `reverseString('ab😀')` gives `'😀ba'` instead of two broken halves.

**Only the public function is tested.** The brief makes this point about `caesarCipher`: its two helpers are not exported and have no tests of their own. If `caesarCipher` behaves across wrapping, case, punctuation, negative and oversized shifts, the helpers are doing their job.

## The page

`index.html` imports the real modules — there is no second copy of the logic, so if the page shows the right answer, the tested code produced it. Thrown errors are rendered as results in red rather than swallowed, because the refusals are part of the design.

The pass count on it is read from `test-summary.json`, written by `npm run report`. It is labelled as a recorded figure with the date it was taken, not presented as if the suite ran when the page loaded.

## Built With

* Vitest
* Plain ES modules in the browser for the page — no bundler, no build step
* Sora and JetBrains Mono

## What I Practiced

* `describe` / `it` / `expect`, and `toThrow` for behaviour that is supposed to fail
* `toBeCloseTo`, because `0.1 + 0.2` is not `0.3`
* Deciding what a function should do with bad input, then testing the decision
* Checking a suite by breaking the code on purpose, rather than trusting a green run
* Testing the public surface and leaving helpers alone

## Project Status

Complete. 58 tests, all passing, all six mutations caught.

## Acknowledgements

Completed as part of The Odin Project's JavaScript course.
