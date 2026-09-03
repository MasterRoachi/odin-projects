# Quarry — Sign-up Form

A sign-up form for an invented service, built as part of [The Odin Project](https://www.theodinproject.com/) Intermediate HTML and CSS course.

## Overview

The brief supplies a design: an image sidebar with a wordmark on a dark scrim, and a sign-up form beside it, for "an imaginary service". This build invents the service rather than leaving it generic.

**Quarry** keeps your sources, quotes and half-formed ideas in one searchable seam — so the paper you skimmed eight months ago is still there when you finally need it. The photograph is a granite cliff, which is where the name comes from.

## The brief's specifics

The lesson names three things exactly, and this uses all three:

| Thing | Value |
| --- | --- |
| Create Account button | `#596D48` |
| Default input border | `#E5E7EB` |
| Invalid password border | red, via `:user-invalid` |
| Focused input | blue border and a subtle box-shadow, via `:focus` |

`:user-invalid` rather than `:invalid` matters here: `:invalid` matches an empty required field the moment the page loads, so a fresh form would open covered in red borders. `:user-invalid` only applies once the person has actually interacted with the field.

## Built With

* HTML
* CSS — Grid for the split layout and the field pairs
* JavaScript — for the parts the brief says to skip

## Going Beyond the Brief

The brief says not to worry about mobile, and that validating that the passwords match needs JavaScript from a later lesson, so skip it. This does both, plus:

* **Live password matching.** The confirm field checks against the first as you type, and says "Passwords match." in green once they agree rather than only going quiet.
* **Written error messages.** Each field has its own message wired up with `aria-describedby` and `aria-invalid`, so the reason is stated rather than implied by a red border. The password message counts down: *"At least 8 characters — 3 to go."*
* **A strength meter** scored on length and character variety, knocked down for the handful of passwords everybody tries first. `password1` scores 15, `Trombone7` scores 65, `Tr0mbone!x9q` scores 92.
* **Show/hide toggles** on both password fields, reporting state through `aria-pressed`.
* **Responsive from 320px.** The sidebar becomes a banner and the field pairs collapse to one column.

## How the validation is arranged

Rules are plain functions — given a value, return a message or `null` — and none of them touch the DOM:

```js
email: (v) => {
  if (!v.trim()) return "We need an email address.";
  return EMAIL.test(v.trim()) ? null : "That needs an @ and a domain.";
}
```

Rendering is separate and reads those results. The email pattern is deliberately loose: the only way to truly validate an address is to send mail to it, and strict patterns reject real addresses.

A field is only scolded once it has been **left** — errors appear on `blur`, not on the first keystroke. But once someone has been told, the message updates live as they fix it, so they are not left waiting to find out whether the correction worked.

## Accessibility

* Every input has a real `<label>`, and errors are linked with `aria-describedby`
* `aria-invalid` is set and cleared alongside the visible state
* Error slots are `aria-live` regions, so corrections are announced
* Submitting an incomplete form moves focus to the first field that needs attention
* Visible focus rings throughout

## Credits

Photograph: *Granite cliff with feldspar crystals in Loddebo* by W.carter, [CC0](https://creativecommons.org/publicdomain/zero/1.0/), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Granite_cliff_with_feldspar_crystals_in_Loddebo_2.jpg). Credited on the page as well as here.

Anton for the wordmark and headings, Karla for everything else.

## What I Practiced

* Form markup: labels, `autocomplete` values, input types, and `novalidate` with custom handling
* `:focus` and `:user-invalid`, and why the distinction between `:invalid` and `:user-invalid` matters
* CSS Grid for a split page layout and for paired form fields
* Keeping validation rules separate from validation rendering
* Communicating errors in words rather than only in colour

## Project Status

Complete.

## Acknowledgements

Completed as part of The Odin Project Intermediate HTML and CSS course.
