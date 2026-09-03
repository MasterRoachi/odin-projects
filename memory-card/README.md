# Don't Click Twice

A memory card game, from [The Odin Project](https://www.theodinproject.com/)'s Memory Card assignment.

```bash
npm install
npm run dev
npm run build
```

[**Play it**](./dist/) — click every card on the board once. Never twice.

## The rules

Pick a card you have not had, and the score goes up. The cards then turn face-down, shuffle, and turn back — so the position you just memorised is worthless and only the picture matters.

Pick one you have already had, and the run ends.

Clear a board and the next one is bigger: **4, 6, 8, 10, 12, 14, 16**. Clearing all seven takes seventy correct picks in a row without ever repeating one.

## One request, not sixteen

The obvious implementation asks PokéAPI for each card separately. It does not need to. The list endpoint returns a name and a URL for every Pokémon in one response, the id is the last segment of that URL, and the artwork path is derivable from the id:

```js
const idFromUrl = (url) => Number(url.split("/").filter(Boolean).at(-1));
const artworkFor = (id) => `.../official-artwork/${id}.png`;
```

So the whole roster — names and images for all 151 — costs **a single fetch**, and dealing a level is then just picking at random from an array already in memory. No request happens when a level changes.

## The effect, which is the actual lesson

Fetching in `useEffect` has two separate failure modes and needs two separate guards:

```jsx
const controller = new AbortController();
let ignore = false;

// … fetch with controller.signal, and check `ignore` before every setState

return () => { ignore = true; controller.abort(); };
```

`controller` cancels the request, so a fetch nobody is waiting for stops using the network. `ignore` handles the other case: a response already in flight can still land *after* cleanup, and calling `setState` then is a warning at best and a bug at worst. Aborting alone does not cover it.

StrictMode runs every effect twice in development specifically to catch code that gets this wrong, which is why it is worth leaving on.

One more thing that bites everyone: **`fetch` does not reject on a 404.** A 500 resolves perfectly happily with `ok: false`, so the status has to be checked by hand or the app tries to read `results` off an error page.

## Three more decisions worth explaining

**Dealing is an action, not something computed while rendering.** `deal()` picks cards at random, and a component that returned a different board every time React chose to re-render would be impossible to reason about. Anything random or time-dependent has to be an event, and the result has to live in state.

**Every timer is tracked so it can be cancelled.**

```jsx
const timers = useRef([]);
useEffect(() => cancelTimers, [cancelTimers]);
```

The flip is a chain of timeouts. Without cancelling them, losing halfway through a flip leaves a timeout that fires afterwards and turns the cards back over on a finished game — and unmounting mid-flip sets state on a component that no longer exists.

**Cards are keyed by the Pokémon's id, never by position.** This is the project where index keys do the most damage: the array is deliberately reordered on *every single pick*. With index keys React would keep element 0 in place and swap only the image inside it, so the flip animation would play on the wrong cards and the shuffle would be visible as a straight swap rather than a reshuffle.

## The flip

A single element with two faces, rotated in 3D:

```css
.card { transform-style: preserve-3d; transition: transform 380ms; }
.card.is-down { transform: rotateY(180deg); }
.face { backface-visibility: hidden; }
.face--back { transform: rotateY(180deg); }
```

Worth noting: the **game advances on timers, not on `transitionend`**. That means the animation is genuinely decoration — where transitions are disabled or simply do not run, the cards change instantly and the game is unaffected. Tying game state to an animation event is how you end up with a board that locks forever because a transition never fired.

## The object

It is drawn as the device: red moulded shell, the blue lens and three status lights top-left, a recessed grey bezel around a dark screen, and the score and best on pale-green LCD panels down on the control deck. Card backs are the ball motif, and each card carries its national dex number.

None of the chrome means anything, so the lens, lights, d-pad and speaker grille are all `aria-hidden`.

The contrast pass here caught something worth remembering. The shell is a **gradient**, and a probe that reads `backgroundColor` sees `transparent`, walks up to the page behind it, and cheerfully reports a number for the wrong pair entirely — it told me the LCD digits were at 1.24:1 when they are fine, and told me the title was fine when it was not. Measured against the gradient's own colour stops, white on the shell sheen was **4.15:1**: a genuine failure, exactly where the title crosses the left edge where the sheen is lightest.

The sheen is darker now, and the restart button darkens on hover rather than lightening, for the same reason. Worst pair on the object is 5.21:1.

## Verifying it

The interesting paths here are the ones you cannot reach by playing normally, so both were forced:

* **The error state** — temporarily pointed the hook at a nonexistent endpoint, confirmed it renders `PokéAPI answered 400` with a retry button and no board, and that retry genuinely re-runs the effect (loading → error again). Then put the URL back.
* **The win state** — temporarily shortened the level list to a single two-card board, cleared it, confirmed the win overlay. Then put the levels back.

That second test found something: the win headline read *"All sixteen"*, hardcoded. With one level it was a lie. It now reads off the level list, so the copy cannot claim a number the game does not use.

Also checked: the board locks during every flip and clicks are ignored, clicking after a loss does nothing, the score carries between levels while the pips reset, the best score survives a reload, no colour pair is below 7.9:1, and there is no horizontal scroll at 375px.

## What I Practiced

* Fetching in an effect with both guards, and why one is not enough
* That `fetch` treats a 500 as a success
* Keeping randomness out of render
* Cleaning up timers, and what happens when you do not
* Stable keys on a list that is *designed* to reorder constantly

## Project Status

Complete, with levels, a persistent high score and the flip animation.

## Acknowledgements

Completed as part of The Odin Project's React course.

Data and artwork from [PokéAPI](https://pokeapi.co/), referenced at runtime from their servers — nothing is redistributed here. Pokémon and the artwork are property of Nintendo, Creatures Inc. and GAME FREAK Inc.; this is a non-commercial learning exercise.
